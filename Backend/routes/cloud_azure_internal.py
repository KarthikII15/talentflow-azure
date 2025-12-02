import os
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

from Backend.cloud_config import save_azure_config

router = APIRouter(prefix="/internal/cloud/azure", tags=["cloud-internal"])

class AzureConfigPayload(BaseModel):
    environment: str
    connection_string: str
    container_name: str

INTERNAL_SECRET = os.getenv("INTERNAL_WEBHOOK_SECRET")

@router.post("/config")
async def update_azure_config(payload: AzureConfigPayload, x_internal_secret: str = Header(None)):
    if not INTERNAL_SECRET or x_internal_secret != INTERNAL_SECRET:
        raise HTTPException(status_code=403, detail="Unauthorized")

    save_azure_config(
        env=payload.environment,
        connection_string=payload.connection_string,
        container_name=payload.container_name,
    )
    return {"status": "ok"}
