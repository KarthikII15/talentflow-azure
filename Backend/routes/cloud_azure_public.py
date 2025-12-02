import os
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from Backend.cloud_config import get_azure_config

router = APIRouter(prefix="/cloud/azure", tags=["cloud-azure"])

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_REPO  = os.getenv("GITHUB_REPO")  # e.g. "your-org/TAG"

class UseAzureRequest(BaseModel):
    environment: str = "dev"

@router.post("/provision")
async def provision_azure(req: UseAzureRequest):
    # Check if Azure already provisioned for this env
    existing = get_azure_config(req.environment)
    if existing:
        return {
            "status": "ready",
            "message": "Azure already provisioned for this environment"
        }

    # Trigger GitHub repo dispatch (which runs terraform for Azure)
    if not (GITHUB_TOKEN and GITHUB_REPO):
        raise HTTPException(status_code=500, detail="GitHub integration not configured")

    async with httpx.AsyncClient() as client:
        r = await client.post(
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

    if r.status_code not in (200, 201, 204):
        raise HTTPException(status_code=500, detail="Failed to trigger Azure provisioning")

    return {"status": "provisioning", "message": "Azure provisioning started"}
