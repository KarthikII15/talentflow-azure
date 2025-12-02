# backend/cloud_config.py

from typing import Optional, Dict

from db.firestore_client import db  # you already have this client

COLLECTION = "CloudConfigs"


def _doc_id(env: str) -> str:
    return f"azure-{env}"


def save_azure_config(env: str, connection_string: str, container_name: str) -> None:
    """
    Save Azure storage configuration for a given environment and mark it as 'ready'.
    """
    if not db:
        print("[ERROR] Firestore DB not initialized, cannot save Azure config")
        return

    doc_ref = db.collection(COLLECTION).document(_doc_id(env))
    doc_ref.set(
        {
            "environment": env,
            "provider": "azure",
            "connection_string": connection_string,
            "container_name": container_name,
            "status": "ready",
        },
        merge=True,
    )
    print(f"[INFO] Saved Azure config for env={env} in {COLLECTION}/{_doc_id(env)}")


def get_azure_config(env: str) -> Optional[Dict]:
    """
    Retrieve Azure config for a given environment from Firestore.
    """
    if not db:
        print("[ERROR] Firestore DB not initialized, cannot read Azure config")
        return None

    doc_ref = db.collection(COLLECTION).document(_doc_id(env))
    doc = doc_ref.get()

    if not doc.exists:
        print(f"[INFO] No Azure config found for env={env}")
        return None

    data = doc.to_dict()
    print(f"[INFO] Loaded Azure config for env={env}")
    return data


def set_azure_status(env: str, status: str) -> None:
    """
    Update only the status field for Azure in this environment.
    """
    if not db:
        print("❌ Firestore DB not initialized, cannot set Azure status")
        return

    doc_ref = db.collection(COLLECTION).document(_doc_id(env))
    doc_ref.set({"status": status}, merge=True)
    print(f"[INFO] Azure status for env={env} -> {status}")


def get_azure_status(env: str) -> str:
    """
    Get Azure status for this environment.
    If no document exists, returns 'not_provisioned'.
    """
    cfg = get_azure_config(env)
    if not cfg:
        print(f"[INFO] No config found for env={env}, returning 'not_provisioned'")
        return "not_provisioned"
    
    status = cfg.get("status", "unknown")
    print(f"[INFO] env={env} status={status}")
    return status


def delete_azure_config(env: str) -> None:
    """
    Completely delete the Azure config document for this environment.
    """
    if not db:
        print("[ERROR] Firestore DB not initialized, cannot delete Azure config")
        return

    db.collection(COLLECTION).document(_doc_id(env)).delete()
    print(f"[INFO] Deleted Azure config for env={env}")
