# backend/agents/recruiter.py

import os
import json
from datetime import date
from io import BytesIO
from docx import Document
from pypdf import PdfReader
from litellm import completion
from dotenv import load_dotenv
from typing import List
import math
import re

load_dotenv()

# ---------------- TEXT EXTRACTION ----------------

def extract_text_from_docx(file_content: bytes) -> str:
    try:
        doc = Document(BytesIO(file_content))
        return "\n".join([p.text for p in doc.paragraphs])
    except:
        return ""

def extract_text_from_pdf(file_content: bytes) -> str:
    try:
        pdf = PdfReader(BytesIO(file_content))
        text = ""
        for page in pdf.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
        return text
    except:
        return ""

def smart_extract(file_content: bytes, filename: str) -> str:
    if filename.lower().endswith(".pdf"):
        return extract_text_from_pdf(file_content)
    if filename.lower().endswith(".docx"):
        return extract_text_from_docx(file_content)
    return file_content.decode("utf-8", errors="ignore")

# ---------------- COSINE SIMILARITY ----------------

def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    if not vec1 or not vec2 or len(vec1) != len(vec2):
        return 0.0
    
    dot = sum(a*b for a,b in zip(vec1,vec2))
    norm1 = math.sqrt(sum(a*a for a in vec1))
    norm2 = math.sqrt(sum(b*b for b in vec2))
    
    return dot / (norm1 * norm2 + 1e-8)

# ---------------- MAIN AI EVALUATION ----------------

def evaluate_candidate(job_id, candidate_id, required_experience, candidate_experience,
                       career_gaps_detected, job_shifts_last_year, skills_match_score):

    system_prompt = """
You are an expert recruiter. Score a resume against a job description.

STRICT JSON OUTPUT:

{
  "name": "",
  "email": "",
  "score": 0,
  "status": "SELECTED | REJECTED | ON HOLD",
  "reasoning": "Short summary of why",
  "experience_score": 0,
  "skills_score": 0,
  "role_alignment_score": 0,
  "stability_flag": "Stable | Job Hopper",
  "skills_found": ["Python", "SQL"],
  "missing_skills": ["Java"]
}
"""

    user_prompt = f"""
Evaluate this candidate strictly by rubric.

Required Experience: {required_experience}
Candidate Experience: {candidate_experience}
Career Gaps Detected: {career_gaps_detected}
Job Shifts Last Year: {job_shifts_last_year}
Skill Match Score (0–100): {skills_match_score}

Return JSON only.
"""

    try:
        response = completion(
            model="gemini/gemini-2.5-flash",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            api_key=os.getenv("GEMINI_API_KEY"),
            response_format={"type": "json_object"},
        )

        raw = response.choices[0].message.content.strip()

        # Robust JSON parsing
        try:
            result = json.loads(raw)
        except:
            # Fallback for messy LLM output
            start = raw.find("{")
            end = raw.rfind("}")
            result = json.loads(raw[start:end+1])

        # ✅ FIXED: Return the exact structure required by Frontend
        return {
            "candidate_id": candidate_id,
            "job_id": job_id,
            "final_verdict": result.get("status", "UNDECIDED").upper(),
            "score": result.get("score", 0),
            "experience_score": result.get("experience_score", 0),
            "skills_score": result.get("skills_score", 0),
            "role_alignment_score": result.get("role_alignment_score", 0),
            "reasoning": result.get("reasoning", "No reasoning provided."),
            "skills_found": result.get("skills_found", []),
            "missing_skills": result.get("missing_skills", [])
        }

    except Exception as e:
        print(f"EVALUATION ERROR: {e}")
        # Return safe fallback if AI fails
        return {
            "candidate_id": candidate_id,
            "job_id": job_id,
            "final_verdict": "ERROR",
            "score": 0,
            "reasoning": f"AI evaluation failed: {str(e)}"
        }