# backend/db/firestore_client.py

import os
import json
from dotenv import load_dotenv
from google.cloud import firestore

load_dotenv()

print("DEBUG CREDENTIAL PATH =", os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))

try:
    db = firestore.Client()
    print("🔥 Firestore Connected")
except Exception as e:
    print("❌ Firestore Connection Failed:", e)
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



# import os
# from dotenv import load_dotenv
# from google.cloud import firestore

# load_dotenv()

# print("DEBUG CREDENTIAL PATH =", os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))

# # ✅ Connection Test Logic
# try:
#     db = firestore.Client()
#     print("🔥 Firestore Connected Successfully!")
# except Exception as e:
#     print("❌ Firestore Connection Failed:", e)
#     db = None 

# def save_jd(jd_id: str, file_name: str, extracted_text: str, session_id: str, job_title: str):
#     if not db:
#         return False
#     db.collection("JDs").document(jd_id).set({
#         "jd_id": jd_id,
#         "file_name": file_name,
#         "text": extracted_text,
#         "job_title": job_title,
#         "session_id": session_id,
#     })
#     print(f"[FIRESTORE] Saved JD {jd_id} -> {file_name}")
#     return True


# def save_candidate(candidate_id: str, file_name: str, extracted_text: str,
#                    session_id: str, candidate_name: str, skills: list): # Changed skills to list for better querying if needed
#     if not db:
#         return False
#     # Ensure skills is stored as a JSON string if that's what frontend expects, 
#     # or kept as a list if you change frontend parsing.
#     # Based on previous code, frontend expects a JSON string.
#     import json
#     skills_str = json.dumps(skills) if isinstance(skills, list) else skills

#     db.collection("Candidates").document(candidate_id).set({
#         "candidate_id": candidate_id,
#         "file_name": file_name,
#         "text": extracted_text,
#         "candidate_name": candidate_name,
#         "skills": skills_str,
#         "session_id": session_id,
#     })
#     print(f"[FIRESTORE] Saved Candidate {candidate_id} -> {file_name}")
#     return True


# def list_jds(session_id: str):
#     if not db:
#         return []
#     docs = db.collection("JDs").where("session_id", "==", session_id).stream()
#     return [doc.to_dict() for doc in docs]


# def list_candidates(session_id: str):
#     if not db:
#         return []
#     docs = db.collection("Candidates").where("session_id", "==", session_id).stream()
#     return [doc.to_dict() for doc in docs]


# def save_mapping(jd_id: str, candidate_id: str, status: str = "PENDING"):
#     if not db: return False
#     doc_id = f"{jd_id}__{candidate_id}"
#     db.collection("Mappings").document(doc_id).set({
#         "jd_id": jd_id,
#         "candidate_id": candidate_id,
#         "status": status,
#     })
#     return True

# def list_mappings_for_jd(jd_id: str):
#     if not db: return []
#     docs = db.collection("Mappings").where("jd_id", "==", jd_id).stream()
#     return [d.to_dict() for d in docs]

# def save_shortlist_result(jd_id: str, candidate_id: str, result: dict):
#     if not db: return False
#     doc_id = f"{jd_id}__{candidate_id}"
#     db.collection("Results").document(doc_id).set({
#         "jd_id": jd_id,
#         "candidate_id": candidate_id,
#         **result,
#     })
#     return True

# def get_candidate(candidate_id: str):
#     if not db: return None
#     doc = db.collection("Candidates").document(candidate_id).get()
#     return doc.to_dict() if doc.exists else None

# def get_jd(jd_id: str):
#     if not db: return None
#     doc = db.collection("JDs").document(jd_id).get()
#     return doc.to_dict() if doc.exists else None