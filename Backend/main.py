from dotenv import load_dotenv
import os
import uuid
import traceback
from io import BytesIO
from typing import Literal
from datetime import timedelta

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi import Query, Header

# ---------- EXTERNAL IMPORTS ----------
from pdfminer.high_level import extract_text as pdf_extract_text
from docx import Document

# ---------- INTERNAL IMPORTS ----------
from db.cloud_provider import (
    AWSProvider,
    GCPProvider,
    AzureProvider,
    CloudProvider,
)
from agents.recruiter import evaluate_candidate
from agents.cloud_setup import CloudSetupAgent
from agents.librarian import LibrarianAgent

# ---------- NEW IMPORTS FOR AZURE FLOW ----------
import os
import httpx
from pydantic import BaseModel

from cloud_config import (
    save_azure_config,
    get_azure_config,
    delete_azure_config,
    set_azure_status,
    get_azure_status,
)

from db.firestore_client import (
    save_jd,
    save_candidate,
    list_jds,
    list_candidates,
    save_mapping,
    list_mappings_for_jd,
    get_candidate,
    get_jd,
    save_shortlist_result,
)

load_dotenv()

# ---------------------------------------------------------
# FASTAPI APP
# ---------------------------------------------------------
app = FastAPI(title="CARPAS – Cloud-Agnostic Recruitment System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# Azure Models
# ---------------------------------------------------------
from pydantic import BaseModel

class AzureConfigPayload(BaseModel):
    environment: str
    connection_string: str
    container_name: str


class UseAzureRequest(BaseModel):
    environment: str = "dev"


class AzureDestroyPayload(BaseModel):
    environment: str


# ---------------------------------------------------------
# INTERNAL AZURE CONFIG UPDATE (called by GitHub Action)
# ---------------------------------------------------------
INTERNAL_WEBHOOK_SECRET = os.getenv("INTERNAL_WEBHOOK_SECRET")


@app.post("/internal/cloud/azure/config")
async def internal_update_azure_config(
    payload: AzureConfigPayload,
    x_internal_secret: str = Header(default=None, alias="X-Internal-Secret"),
):
    """
    PRIVATE: Called only from GitHub Action after Terraform finishes.
    Saves the Azure connection string & container name into Firestore.
    """

    if not INTERNAL_WEBHOOK_SECRET or x_internal_secret != INTERNAL_WEBHOOK_SECRET:
        # Protect this endpoint from external calls
        raise HTTPException(status_code=403, detail="Unauthorized")

    save_azure_config(
        env=payload.environment,
        connection_string=payload.connection_string,
        container_name=payload.container_name,
    )

    return {"status": "ok"}


@app.post("/internal/cloud/azure/config/destroyed")
async def internal_azure_destroyed(
    payload: AzureDestroyPayload,
    x_internal_secret: str = Header(default=None, alias="X-Internal-Secret")
):
    if not INTERNAL_WEBHOOK_SECRET or x_internal_secret != INTERNAL_WEBHOOK_SECRET:
        raise HTTPException(status_code=403, detail="Unauthorized")

    delete_azure_config(payload.environment)
    return {"status": "deleted"}


# ---------------------------------------------------------
# PUBLIC AZURE PROVISIONING ENDPOINT (triggered from frontend)
# ---------------------------------------------------------

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_REPO = os.getenv("GITHUB_REPO")  # e.g. "your-org/TAG"


@app.post("/cloud/azure/provision")
async def provision_azure(req: UseAzureRequest):
    """
    Trigger Azure infrastructure provisioning via GitHub Actions.
    - If Azure config already exists for this environment -> return 'ready'
    - Else -> trigger repo_dispatch 'provision-azure' and return 'provisioning'
    """

    # 1. Check if already provisioned
    existing = get_azure_config(req.environment)
    if existing and existing.get("status") == "ready":
        return {
            "status": "ready",
            "message": f"Azure already provisioned for env={req.environment}",
        }

    # Mark as provisioning in Firestore
    set_azure_status(req.environment, "provisioning")

    # 2. Validate GitHub config
    if not GITHUB_TOKEN or not GITHUB_REPO:
        raise HTTPException(
            status_code=500,
            detail="GitHub integration not configured (GITHUB_TOKEN / GITHUB_REPO missing)",
        )

    # 3. Trigger GitHub repo dispatch to start the Terraform workflow
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"https://api.github.com/repos/{GITHUB_REPO}/dispatches",
            headers={
                "Accept": "application/vnd.github+json",
                "Authorization": f"Bearer {GITHUB_TOKEN}",
            },
            json={
                "event_type": "provision-azure",
                "client_payload": {
                    "environment": req.environment,
                },
            },
        )

    if resp.status_code not in (200, 201, 204):
        print("❌ GitHub dispatch error:", resp.status_code, resp.text)
        raise HTTPException(
            status_code=500,
            detail="Failed to trigger Azure provisioning via GitHub Actions",
        )


    return {
        "status": "provisioning",
        "message": f"Azure provisioning started for env={req.environment}",
    }


@app.post("/cloud/azure/destroy")
async def destroy_azure(req: UseAzureRequest):
    """
    Trigger Azure destroy workflow.
    """
    # If no config → nothing to destroy
    existing = get_azure_config(req.environment)
    if not existing:
        return {
            "status": "not_provisioned",
            "message": f"No Azure infra found for env={req.environment}",
        }

    # Mark status as deleting
    set_azure_status(req.environment, "deleting")

    # Trigger destroy workflow
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"https://api.github.com/repos/{GITHUB_REPO}/dispatches",
            headers={
                "Accept": "application/vnd.github+json",
                "Authorization": f"Bearer {GITHUB_TOKEN}",
            },
            json={
                "event_type": "destroy-azure",
                "client_payload": {
                    "environment": req.environment,
                },
            },
        )

    if resp.status_code not in (200, 201, 204):
        raise HTTPException(
            status_code=500,
            detail="Failed to trigger Azure destroy workflow"
        )

    return {
        "status": "destroying",
        "message": f"Azure destruction started for env={req.environment}"
    }





# ---------------------------------------------------------
# MODELS
# ---------------------------------------------------------
CloudName = Literal["aws", "gcp", "azure"]

# ---------------------------------------------------------
# AZURE CLOUD CONFIG MODELS
# ---------------------------------------------------------
class AzureConfigPayload(BaseModel):
    environment: str
    connection_string: str
    container_name: str

class AzureDestroyPayload(BaseModel):
    environment: str


class UseAzureRequest(BaseModel):
    # You can later switch this to a project-specific id if needed
    environment: str = "dev"

class UploadURLRequest(BaseModel):
    filename: str

class CandidateEvalRequest(BaseModel):
    job_id: str
    candidate_id: str
    required_experience: float
    candidate_experience: float
    career_gaps_detected: bool
    job_shifts_last_year: int
    skills_match_score: int

class MappingRequest(BaseModel):
    jd_id: str
    candidate_id: str
    status: Literal["PENDING", "SHORTLISTED", "REJECTED"] = "PENDING"

class ShortlistRequest(BaseModel):
    candidate_id: str
    skills_match_score: int = 70

# ---------------------------------------------------------
# HELPERS
# ---------------------------------------------------------
def get_provider(provider: CloudName) -> CloudProvider:
    if provider == "gcp":
        return GCPProvider()
    if provider == "aws":
        return AWSProvider()
    if provider == "azure":
        return AzureProvider()
    raise HTTPException(400, "Invalid provider")

def extract_text_from_bytes(file_bytes: bytes, filename: str) -> str:
    try:
        ext = filename.lower().split(".")[-1]

        if ext == "pdf":
            return pdf_extract_text(BytesIO(file_bytes))

        if ext == "docx":
            try:
                doc = Document(BytesIO(file_bytes))
                return "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
            except:
                return ""

        if ext in ("txt", "md"):
            return file_bytes.decode("utf-8", errors="ignore")

        return ""
    except Exception as e:
        print("TEXT EXTRACTION ERROR:", e)
        return ""

# ---------------------------------------------------------
# CLOUD SETUP
# ---------------------------------------------------------
@app.get("/cloud/setup")
def setup_cloud(provider: CloudName):
    provider_obj = get_provider(provider)
    agent = CloudSetupAgent(provider_obj)

    session_id = uuid.uuid4().hex
    response = agent.setup_storage()
    response["session_id"] = session_id

    return response

# ---------------------------------------------------------
# SIGNED UPLOAD URL
# ---------------------------------------------------------
@app.post("/cloud/generate-upload-url")
def generate_upload_url(payload: UploadURLRequest, provider: CloudName = Query(...)):
    try:
        provider_obj = get_provider(provider)
        object_path = f"incoming/{payload.filename}"

        # FIXED: Correct signature method
        url = provider_obj.generate_upload_link(object_path)

        return {"upload_url": url, "object_path": object_path}

    except Exception as e:
        print("UPLOAD URL ERROR:", e)
        raise HTTPException(500, str(e))

# ---------------------------------------------------------
# PROCESS FILES
# ---------------------------------------------------------
@app.post("/cloud/process-files")
def process_files(provider: CloudName = Query(...), session_id: str = Query(...)):
    from backend.agents.jd_extractor import extract_jd_title
    from backend.agents.name_extractor import extract_name_from_text
    from backend.agents.skills_extractor import extract_skills

    try:
        provider_obj = get_provider(provider)
        incoming_files = provider_obj.list_files("incoming/")

        librarian = LibrarianAgent()
        results = []

        for file_path in incoming_files:
            filename = os.path.basename(file_path)

            # 1. Download bytes (provider agnostic)
            try:
                file_bytes = provider_obj.download_bytes(file_path)
            except:
                provider_obj.move_file(file_path, f"Others/{filename}")
                continue

            # 2. Extract text
            text = extract_text_from_bytes(file_bytes, filename)
            if not text:
                provider_obj.move_file(file_path, f"Others/{filename}")
                continue

            # 3. Classify
            doc_type = librarian.classify_document(text)

            # ---------------- JD ----------------
            if doc_type == "JD":
                jd_id = f"JD-{uuid.uuid4().hex[:8]}"
                job_title = extract_jd_title(text)

                save_jd(jd_id, filename, text, session_id, job_title)
                provider_obj.move_file(file_path, f"JDs/{filename}")

                results.append({
                    "file": filename,
                    "type": "JD",
                    "jd_id": jd_id,
                    "job_title": job_title
                })
                continue

            # ---------------- RESUME ----------------
            if doc_type == "RESUME":
                cand_id = f"CAND-{uuid.uuid4().hex[:8]}"
                name = extract_name_from_text(text)
                skills = extract_skills(text)

                save_candidate(cand_id, filename, text, session_id, name, skills)
                provider_obj.move_file(file_path, f"Resumes/{filename}")

                results.append({
                    "file": filename,
                    "type": "RESUME",
                    "candidate_id": cand_id,
                    "candidate_name": name,
                    "skills": skills
                })
                continue

            # ---------------- OTHER ----------------
            provider_obj.move_file(file_path, f"Others/{filename}")
            results.append({"file": filename, "type": "OTHER"})

        return {
            "message": "Processing completed",
            "session_id": session_id,
            "details": results
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, str(e))

# ---------------------------------------------------------
# DATA FETCH
# ---------------------------------------------------------
@app.get("/jds")
def get_jds_route(session_id: str):
    return {"jds": list_jds(session_id)}

@app.get("/candidates")
def get_candidates_route(session_id: str):
    return {"candidates": list_candidates(session_id)}

# ---------------------------------------------------------
# MAPPING
# ---------------------------------------------------------
@app.post("/map-candidate-to-jd")
def map_candidate_to_jd(payload: MappingRequest):
    if not get_jd(payload.jd_id):
        raise HTTPException(404, "JD not found")
    if not get_candidate(payload.candidate_id):
        raise HTTPException(404, "Candidate not found")

    save_mapping(payload.jd_id, payload.candidate_id, payload.status)
    return {"message": "Mapping saved"}

@app.get("/jd/{jd_id}/candidates")
def get_candidates_for_jd(jd_id: str, session_id: str):
    mapped = list_mappings_for_jd(jd_id)
    mapped_ids = {m["candidate_id"] for m in mapped}

    all_candidates = {c["candidate_id"]: c for c in list_candidates(session_id)}

    mapped_candidates = [
        all_candidates[cid] for cid in mapped_ids if cid in all_candidates
    ]

    return {"candidates": mapped_candidates, "mappings": mapped}

# ---------------------------------------------------------
# EVALUATION
# ---------------------------------------------------------
@app.post("/candidate/evaluate")
def evaluate_candidate_api(payload: CandidateEvalRequest):
    return evaluate_candidate(**payload.dict())

@app.post("/jd/{jd_id}/shortlist")
def shortlist_candidate(jd_id: str, payload: ShortlistRequest):
    jd = get_jd(jd_id)
    cand = get_candidate(payload.candidate_id)

    if not jd or not cand:
        raise HTTPException(404, "Not found")

    result = evaluate_candidate(
        job_id=jd_id,
        candidate_id=payload.candidate_id,
        required_experience=3.0,
        candidate_experience=3.0,
        career_gaps_detected=False,
        job_shifts_last_year=0,
        skills_match_score=payload.skills_match_score,
    )

    save_shortlist_result(jd_id, payload.candidate_id, result)
    return result

@app.get("/cloud/azure/status")
async def get_azure_status_api(environment: str = Query("dev")):
    """
    Return the current Azure status for this environment.
    Values can be:
      - not_provisioned
      - provisioning
      - ready
      - deleting
      - unknown
    """
    status = get_azure_status(environment)
    return {"environment": environment, "status": status}