import os
import sys
from dotenv import load_dotenv

# Force load .env
load_dotenv()

print(f"Current CWD: {os.getcwd()}")
print(f"AZURE_STORAGE_CONNECTION_STRING present: {'AZURE_STORAGE_CONNECTION_STRING' in os.environ}")

try:
    from db.cloud_provider import AzureProvider
    print("Attempting to initialize AzureProvider...")
    provider = AzureProvider()
    print("AzureProvider initialized successfully.")
    
    bucket_name = "talentflow-azure"
    print(f"Attempting to create bucket: {bucket_name}")
    provider.create_bucket(bucket_name)
    print("Bucket creation done (or existed).")

    print("Attempting to create folder 'incoming/'...")
    provider.create_folder("incoming/")
    print("Folder creation done.")

    print("Attempting to list files...")
    files = provider.list_files("incoming/")
    print(f"Files found: {files}")

except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
