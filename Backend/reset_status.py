import sys
import os

# Add current directory to sys.path so imports work
sys.path.append(os.getcwd())

try:
    from cloud_config import set_azure_status
    print("Resetting Azure status to 'not_provisioned'...")
    set_azure_status("dev", "not_provisioned")
    print("[SUCCESS] Status reset successfully.")
except Exception as e:
    print(f"[ERROR] Failed to reset status: {e}")
