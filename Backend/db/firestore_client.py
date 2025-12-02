# backend/db/firestore_client.py

import os
import json
from dotenv import load_dotenv
from google.cloud import firestore

load_dotenv()

project_id = os.getenv("FIRESTORE_PROJECT_ID")
cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

print(f"DEBUG: Project ID = {project_id}")
print(f"DEBUG: Credential Path = {cred_path}")

if not project_id:
    print("[ERROR] FIRESTORE_PROJECT_ID is not set in .env")

if not cred_path or not os.path.exists(cred_path):
    print(f"[ERROR] GOOGLE_APPLICATION_CREDENTIALS file not found at: {cred_path}")

try:
    if project_id:
        db = firestore.Client(project=project_id)
        print("[INFO] Firestore Connected")
    else:
        # Fallback to default inference if project_id is missing but creds might have it
        db = firestore.Client()
        print("[INFO] Firestore Connected (Project ID inferred)")
except Exception as e:
    print("[ERROR] Firestore Connection Failed:", e)
    db = None


def save_jd(jd_id, file_name, text, session_id, job_title):
    if not db: return False
    db.collection("JDs").document(jd_id).set({
        "jd_id": jd_id,
        "file_name": file_name,
        "text": text,
        "job_title": job_title,
        "session_id": session_id,
    })
    return True


def save_candidate(candidate_id, file_name, text, session_id, candidate_name, skills):
    if not db: return False
    skills_str = json.dumps(skills)
    db.collection("Candidates").document(candidate_id).set({
        "candidate_id": candidate_id,
        "file_name": file_name,
        "text": text,
        "candidate_name": candidate_name,
        "skills": skills_str,
        "session_id": session_id,
    })
    return True


def list_jds(session_id):
    if not db: return []
    docs = db.collection("JDs").where("session_id", "==", session_id).stream()
    return [d.to_dict() for d in docs]


def list_candidates(session_id):
    if not db: return []
    docs = db.collection("Candidates").where("session_id", "==", session_id).stream()
    return [d.to_dict() for d in docs]


def save_mapping(jd_id, candidate_id, status="PENDING"):
    if not db: return False
    doc_id = f"{jd_id}__{candidate_id}"
    db.collection("Mappings").document(doc_id).set({
        "jd_id": jd_id,
        "candidate_id": candidate_id,
        "status": status,
    })
    return True


def list_mappings_for_jd(jd_id):
    if not db: return []
    docs = db.collection("Mappings").where("jd_id", "==", jd_id).stream()
    return [d.to_dict() for d in docs]


def save_shortlist_result(jd_id, candidate_id, result):
    if not db: return False
    doc_id = f"{jd_id}__{candidate_id}"
    db.collection("Results").document(doc_id).set({
        "jd_id": jd_id,
        "candidate_id": candidate_id,
        **result,
    })
    return True


def get_candidate(candidate_id):
    if not db: return None
    doc = db.collection("Candidates").document(candidate_id).get()
    return doc.to_dict() if doc.exists else None


def get_jd(jd_id):
    if not db: return None
    doc = db.collection("JDs").document(jd_id).get()
    return doc.to_dict() if doc.exists else None