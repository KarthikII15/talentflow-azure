# # backend/agents/cloud_setup.py

# class CloudSetupAgent:
#     """
#     Sets up cloud storage:
#     - Creates bucket
#     - Creates standard folders
#     - Upload URLs are generated per-file (NOT here)
#     """

#     def __init__(self, provider):
#         self.provider = provider

#     def setup_storage(self):
#         bucket_name = f"talentflow-{self.provider.cloud_name}"

#         self.provider.create_bucket(bucket_name)

#         folders = ["incoming/", "JDs/", "Resumes/", "Others/", "Results/"]
#         for f in folders:
#             self.provider.create_folder(bucket_name, f)

#         return {
#             "bucket_name": bucket_name,
#             "upload_url": None,
#             "folders_created": folders,
#         }


# from abc import ABC, abstractmethod
# from typing import List, Dict, Any
# import json

# from google.cloud import storage
# from google.cloud.exceptions import Conflict


# # ----------------- BASE CLASS ------------------

# class CloudProvider(ABC):
#     """
#     Common interface for all cloud providers.
#     """

#     cloud_name: str

#     @abstractmethod
#     def create_bucket(self, bucket_name: str):
#         """Create bucket/container if it doesn't exist."""
#         raise NotImplementedError

#     @abstractmethod
#     def create_folder(self, bucket_name: str, folder: str):
#         """Create a logical 'folder'."""
#         raise NotImplementedError

#     @abstractmethod
#     def generate_upload_link(self, bucket_name: str, folder: str) -> str:
#         """Generate a signed URL for uploading."""
#         raise NotImplementedError

#     @abstractmethod
#     def list_files(self, prefix: str) -> List[str]:
#         """List object names under a given prefix (folder)."""
#         raise NotImplementedError

#     @abstractmethod
#     def move_file(self, source: str, dest: str) -> None:
#         """Move/rename a file inside the storage."""
#         raise NotImplementedError

#     @abstractmethod
#     def upload_json(self, path: str, data: Dict[str, Any]) -> None:
#         """Store JSON analysis result in cloud."""
#         raise NotImplementedError


# # ----------------- GCP IMPLEMENTATION ------------------

# class GCPProvider(CloudProvider):
#     cloud_name = "gcp"

#     def __init__(self):
#         # Uses GOOGLE_APPLICATION_CREDENTIALS env var
#         self.client = storage.Client()
#         self.bucket_name = f"talentflow-{self.cloud_name}"

#     def _get_bucket(self):
#         return self.client.bucket(self.bucket_name)

#     def create_bucket(self, bucket_name: str):
#         """
#         Create bucket if it doesn't exist.
#         """
#         self.bucket_name = bucket_name
#         try:
#             bucket = self.client.create_bucket(bucket_name, location="us-central1")
#             return bucket
#         except Conflict:
#             return self.client.bucket(bucket_name)

#     def create_folder(self, bucket_name: str, folder: str):
#         """
#         In GCS, folders are just zero-byte blobs with a trailing '/'.
#         """
#         self.bucket_name = bucket_name
#         if not folder.endswith("/"):
#             folder = folder + "/"

#         bucket = self._get_bucket()
#         blob = bucket.blob(folder)
#         if not blob.exists():
#             blob.upload_from_string(b"")

#     def generate_upload_link(self, bucket_name: str, folder: str) -> str:
#         """
#         Generates a signed URL where TAG team can upload files into `folder`.
#         """
#         self.bucket_name = bucket_name
#         if not folder.endswith("/"):
#             folder = folder + "/"

#         bucket = self._get_bucket()
#         object_name = folder + "upload-here.tmp"
#         blob = bucket.blob(object_name)

#         url = blob.generate_signed_url(
#             version="v4",
#             expiration=3600,
#             method="PUT",
#             content_type="application/octet-stream",
#         )
#         return url

#     # --------- List files ---------

#     def list_files(self, prefix: str) -> List[str]:
#         """
#         List all non-folder objects under a prefix.
#         Example: prefix='incoming/'.
#         """
#         bucket = self._get_bucket()
#         blobs = bucket.list_blobs(prefix=prefix)
#         return [b.name for b in blobs if not b.name.endswith("/")]

#     # --------- Safe move_file (fixes 404 issues) ---------

#     def move_file(self, source: str, dest: str) -> None:
#         """
#         Safely move a blob within same bucket: copy + delete.
#         Works even if the name has URL-encoding quirks.
#         """
#         bucket = self._get_bucket()

#         prefix = "/".join(source.split("/")[:-1]) + "/"
#         filename_only = source.split("/")[-1]

#         blobs = list(bucket.list_blobs(prefix=prefix))

#         matched_blob = None
#         for b in blobs:
#             if b.name == source or b.name.endswith(filename_only):
#                 matched_blob = b
#                 break

#         if not matched_blob:
#             raise Exception(f"GCP MOVE ERROR: File not found → {source}")

#         bucket.copy_blob(matched_blob, bucket, new_name=dest)
#         matched_blob.delete()

#     # --------- Upload JSON ---------

#     def upload_json(self, path: str, data: Dict[str, Any]) -> None:
#         """
#         Upload JSON file at given object path.
#         """
#         bucket = self._get_bucket()
#         blob = bucket.blob(path)
#         blob.upload_from_string(
#             json.dumps(data, indent=2),
#             content_type="application/json",
#         )


# # ----------------- AWS / AZURE STUBS ------------------

# class AWSProvider(CloudProvider):
#     cloud_name = "aws"

#     def create_bucket(self, bucket_name: str):
#         raise NotImplementedError("AWSProvider not implemented yet")

#     def create_folder(self, bucket_name: str, folder: str):
#         raise NotImplementedError("AWSProvider not implemented yet")

#     def generate_upload_link(self, bucket_name: str, folder: str) -> str:
#         raise NotImplementedError("AWSProvider not implemented yet")

#     def list_files(self, prefix: str) -> List[str]:
#         raise NotImplementedError("AWSProvider not implemented yet")

#     def move_file(self, source: str, dest: str) -> None:
#         raise NotImplementedError("AWSProvider not implemented yet")

#     def upload_json(self, path: str, data: Dict[str, Any]) -> None:
#         raise NotImplementedError("AWSProvider not implemented yet")


# class AzureProvider(CloudProvider):
#     cloud_name = "azure"

#     def create_bucket(self, bucket_name: str):
#         raise NotImplementedError("AzureProvider not implemented yet")

#     def create_folder(self, bucket_name: str, folder: str):
#         raise NotImplementedError("AzureProvider not implemented yet")

#     def generate_upload_link(self, bucket_name: str, folder: str) -> str:
#         raise NotImplementedError("AzureProvider not implemented yet")

#     def list_files(self, prefix: str) -> List[str]:
#         raise NotImplementedError("AzureProvider not implemented yet")

#     def move_file(self, source: str, dest: str) -> None:
#         raise NotImplementedError("AzureProvider not implemented yet")

#     def upload_json(self, path: str, data: Dict[str, Any]) -> None:
#         raise NotImplementedError("AzureProvider not implemented yet")

# class CloudSetupAgent:
#     """
#     Sets up cloud storage:
#     - Creates bucket
#     - Creates standard folders
#     - Signed upload URLs are generated later (per file)
#     """

#     def __init__(self, provider):
#         self.provider = provider

#     def setup_storage(self):
#         bucket_name = f"talentflow-{self.provider.cloud_name}"

#         # Create bucket (idempotent)
#         self.provider.create_bucket(bucket_name)

#         # Create folders
#         folders = ["incoming/", "JDs/", "Resumes/", "Others/", "Results/"]
#         for f in folders:
#             self.provider.create_folder(bucket_name, f)

#         return {
#             "bucket_name": bucket_name,
#             "folders_created": folders,
#             "upload_url": None  # frontend uses per-file signed URLs
#         }

class CloudSetupAgent:
    """
    Sets up cloud storage:
    - Create bucket/container
    - Create standard folders
    """

    def __init__(self, provider):
        self.provider = provider

    def setup_storage(self):
        bucket_name = f"talentflow-{self.provider.cloud_name}"

        # Create bucket/container
        self.provider.create_bucket(bucket_name)

        # Create folder structure
        folders = ["incoming/", "JDs/", "Resumes/", "Others/", "Results/"]
        for f in folders:
            self.provider.create_folder(f)

        return {
            "bucket_name": bucket_name,
            "folders_created": folders
        }
