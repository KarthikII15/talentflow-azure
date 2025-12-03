# backend/db/cloud_provider.py

from abc import ABC, abstractmethod
from typing import List, Dict, Any
import json
import os

# ----------------- BASE CLASS ------------------


class CloudProvider(ABC):
    cloud_name: str
    bucket_name: str  # or container_name for Azure, but we standardize as bucket_name

    @abstractmethod
    def create_bucket(self, bucket_name: str):
        raise NotImplementedError

    @abstractmethod
    def create_folder(self, folder: str):
        """Create a 'folder' prefix like incoming/, JDs/, Resumes/."""
        raise NotImplementedError

    @abstractmethod
    def generate_upload_link(self, object_path: str) -> str:
        """Generate signed URL for PUT upload to this exact object path."""
        raise NotImplementedError

    @abstractmethod
    def list_files(self, prefix: str) -> List[str]:
        raise NotImplementedError

    @abstractmethod
    def move_file(self, source: str, dest: str) -> None:
        raise NotImplementedError

    @abstractmethod
    def upload_json(self, path: str, data: Dict[str, Any]) -> None:
        raise NotImplementedError

    @abstractmethod
    def download_bytes(self, path: str) -> bytes:
        """Download raw bytes for the given object key/path."""
        raise NotImplementedError


# =====================================================
#                   G C P   (GCS)
# =====================================================
from google.cloud import storage
from google.cloud.exceptions import Conflict


class GCPProvider(CloudProvider):
    cloud_name = "gcp"

    def __init__(self):
        self.client = storage.Client()
        # default bucket; will be overridden by create_bucket
        self.bucket_name = f"talentflow-{self.cloud_name}"

    def _get_bucket(self):
        return self.client.bucket(self.bucket_name)

    # ----------- CORS SETUP --------------
    def _apply_cors(self, bucket):
        cors_config = [{
            "origin": ["*"],
            "method": ["GET", "PUT", "POST", "DELETE"],
            "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"],
            "maxAgeSeconds": 3600
        }]
        bucket.cors = cors_config
        bucket.patch()
        print("✅ [GCP] CORS rules applied.")

    def create_bucket(self, bucket_name: str):
        self.bucket_name = bucket_name
        try:
            bucket = self.client.create_bucket(bucket_name, location="us-central1")
            print("🎉 [GCP] Bucket created:", bucket.name)
            self._apply_cors(bucket)
            return bucket
        except Conflict:
            bucket = self.client.bucket(bucket_name)
            print("ℹ️ [GCP] Bucket already exists:", bucket.name)
            if not bucket.cors:
                print("⚠️ [GCP] Bucket has no CORS — applying…")
                self._apply_cors(bucket)
            return bucket

    def create_folder(self, folder: str):
        if not folder.endswith("/"):
            folder += "/"
        bucket = self._get_bucket()
        blob = bucket.blob(folder)
        if not blob.exists():
            blob.upload_from_string(b"")

    def generate_upload_link(self, object_path: str) -> str:
        bucket = self._get_bucket()
        blob = bucket.blob(object_path)
        url = blob.generate_signed_url(
            version="v4",
            expiration=3600,  # 1 hour
            method="PUT",
            content_type="application/octet-stream",
        )
        return url

    def list_files(self, prefix: str) -> List[str]:
        bucket = self._get_bucket()
        blobs = bucket.list_blobs(prefix=prefix)
        return [b.name for b in blobs if not b.name.endswith("/")]

    def move_file(self, source: str, dest: str) -> None:
        bucket = self._get_bucket()
        blob = bucket.blob(source)

        if not blob.exists():
            raise Exception(f"[GCP] MOVE ERROR: File not found → {source}")

        bucket.copy_blob(blob, bucket, new_name=dest)
        blob.delete()

    def upload_json(self, path: str, data: Dict[str, Any]) -> None:
        bucket = self._get_bucket()
        blob = bucket.blob(path)
        blob.upload_from_string(
            json.dumps(data, indent=2),
            content_type="application/json",
        )

    def download_bytes(self, path: str) -> bytes:
        bucket = self._get_bucket()
        blob = bucket.blob(path)
        return blob.download_as_bytes()


# =====================================================
#                   A W S   (S3)
# =====================================================
import boto3
from botocore.exceptions import ClientError


class AWSProvider(CloudProvider):
    cloud_name = "aws"

    def __init__(self):
        self.s3 = boto3.client(
            "s3",
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            region_name=os.getenv("AWS_REGION", os.getenv("AWS_DEFAULT_REGION", "us-east-1")),
        )
        self.bucket_name = os.getenv("AWS_S3_BUCKET", "talentflow-aws")

    def create_bucket(self, bucket_name: str):
        self.bucket_name = bucket_name
        try:
            region = self.s3.meta.region_name or "us-east-1"
            if region == "us-east-1":
                self.s3.create_bucket(Bucket=bucket_name)
            else:
                self.s3.create_bucket(
                    Bucket=bucket_name,
                    CreateBucketConfiguration={"LocationConstraint": region},
                )
            print(f"🎉 [AWS] Bucket created: {bucket_name}")
        except ClientError as e:
            if e.response["Error"]["Code"] == "BucketAlreadyOwnedByYou":
                print(f"ℹ️ [AWS] Bucket already exists: {bucket_name}")
            else:
                raise

    def create_folder(self, folder: str):
        if not folder.endswith("/"):
            folder += "/"
        self.s3.put_object(Bucket=self.bucket_name, Key=folder, Body=b"")

    def generate_upload_link(self, object_path: str) -> str:
        # S3 presigned URL for PUT
        try:
            url = self.s3.generate_presigned_url(
                ClientMethod="put_object",
                Params={
                    "Bucket": self.bucket_name,
                    "Key": object_path,
                    "ContentType": "application/octet-stream",
                },
                ExpiresIn=3600,
            )
            return url
        except ClientError as e:
            print("[AWS] Presign error:", e)
            raise

    def list_files(self, prefix: str) -> List[str]:
        objs = []
        continuation = None

        while True:
            kwargs = {"Bucket": self.bucket_name, "Prefix": prefix}
            if continuation:
                kwargs["ContinuationToken"] = continuation

            resp = self.s3.list_objects_v2(**kwargs)
            for obj in resp.get("Contents", []):
                key = obj["Key"]
                if not key.endswith("/"):
                    objs.append(key)

            if resp.get("IsTruncated"):
                continuation = resp.get("NextContinuationToken")
            else:
                break

        return objs

    def move_file(self, source: str, dest: str) -> None:
        copy_source = {"Bucket": self.bucket_name, "Key": source}
        self.s3.copy_object(
            Bucket=self.bucket_name,
            CopySource=copy_source,
            Key=dest,
        )
        self.s3.delete_object(Bucket=self.bucket_name, Key=source)

    def upload_json(self, path: str, data: Dict[str, Any]) -> None:
        body = json.dumps(data, indent=2).encode("utf-8")
        self.s3.put_object(
            Bucket=self.bucket_name,
            Key=path,
            Body=body,
            ContentType="application/json",
        )

    def download_bytes(self, path: str) -> bytes:
        resp = self.s3.get_object(Bucket=self.bucket_name, Key=path)
        return resp["Body"].read()


# =====================================================
#                 A Z U R E   (Blob)
# =====================================================
from azure.storage.blob import (
    BlobServiceClient,
    generate_blob_sas,
    BlobSasPermissions,
)

class AzureProvider(CloudProvider):
    cloud_name = "azure"

    def __init__(self, environment="dev"):
        """
        Load Azure connection details dynamically from Firestore.
        This makes Azure fully dynamic after provisioning.
        """
        from cloud_config import get_azure_config

        cfg = get_azure_config(environment)
        if not cfg:
            raise RuntimeError(f"[AZURE] No Azure config found for env={environment}")

        conn_str = cfg.get("connection_string")
        container_name = cfg.get("container_name")

        if not conn_str:
            raise RuntimeError("[AZURE] Missing connection_string in Firestore")
        if not container_name:
            raise RuntimeError("[AZURE] Missing container_name in Firestore")

        self.client = BlobServiceClient.from_connection_string(conn_str)
        self.bucket_name = container_name
        self.container = self.client.get_container_client(container_name)

        print(f"🔐 [AZURE] Loaded config from Firestore for env={environment}")

    def create_bucket(self, bucket_name: str):
        self.bucket_name = bucket_name
        try:
            self.container = self.client.get_container_client(bucket_name)

            if not self.container.exists():
                print(f"⚠️ [AZURE] Container does not exist. Creating → {bucket_name}")
                self.client.create_container(bucket_name)
                print(f"🎉 [AZURE] Container created: {bucket_name}")
            else:
                print(f"ℹ️ [AZURE] Container already exists: {bucket_name}")
        except Exception as e:
            print("❌ [AZURE] Container creation failed:", e)
            raise

    def create_folder(self, folder: str):
        if not folder.endswith("/"):
            folder += "/"
        try:
            self.container.upload_blob(name=folder, data=b"", overwrite=True)
            print(f"📁 [AZURE] Folder created: {folder}")
        except Exception:
            pass

    def generate_upload_link(self, object_path: str) -> str:
        from datetime import datetime, timedelta

        account_name = self.client.account_name
        sas = generate_blob_sas(
            account_name=account_name,
            container_name=self.bucket_name,
            blob_name=object_path,
            permission=BlobSasPermissions(write=True, create=True),
            expiry=datetime.utcnow() + timedelta(hours=1),
        )

        url = (
            f"https://{account_name}.blob.core.windows.net/"
            f"{self.bucket_name}/{object_path}?{sas}"
        )
        return url

    def list_files(self, prefix: str) -> List[str]:
        blobs = self.container.list_blobs(name_starts_with=prefix)
        return [b.name for b in blobs if not b.name.endswith("/")]

    def move_file(self, source: str, dest: str) -> None:
        src_blob = self.container.get_blob_client(source)
        dst_blob = self.container.get_blob_client(dest)

        if not src_blob.exists():
            raise Exception(f"[AZURE] Source blob does not exist: {source}")

        copy = dst_blob.start_copy_from_url(src_blob.url)

        # Wait for Azure to finish copy
        from time import sleep
        for _ in range(10):  # retry 10 times
            props = dst_blob.get_blob_properties()
            if props.copy.status == "success":
                break
            sleep(0.5)

        src_blob.delete_blob()
        print(f"📦 [AZURE] Move: {source} → {dest}")

    def upload_json(self, path: str, data: Dict[str, Any]) -> None:
        from azure.storage.blob import ContentSettings
        blob_client = self.container.get_blob_client(path)
        blob_client.upload_blob(
            json.dumps(data, indent=2),
            overwrite=True,
            content_settings=ContentSettings(content_type="application/json"),
        )

    def download_bytes(self, path: str) -> bytes:
        blob_client = self.container.get_blob_client(path)
        return blob_client.download_blob().readall()
