# backend/agents/jd_extractor.py

import re
from typing import List
import os
import openai
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("GROQ")

# Keywords used to detect job titles heuristically
TITLE_KEYWORDS = (
    "Engineer", "Manager", "Developer", "Architect", "Analyst",
    "Scientist", "Lead", "Specialist", "Consultant", "Administrator",
    "Executive", "Designer", "Director", "Coordinator"
)


def _clean_line(line: str) -> str:
    """Clean bullets, emojis, and cut ' - Company' suffix."""
    line = re.sub(r"^[\W_]+", "", line).strip()

    # Example: "Senior Data Engineer - Motivity Labs" → "Senior Data Engineer"
    if " - " in line:
        line = line.split(" - ")[0].strip()

    return line


# ------------------------------------------------------------------
# RULE-BASED TITLE DETECTION
# ------------------------------------------------------------------
def heuristic_extract_titles(text: str) -> List[str]:
    """Extract one or multiple job titles heuristically."""
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    if not lines:
        return []

    titles = []

    # 1. First line candidate
    first = _clean_line(lines[0])
    if 3 <= len(first) <= 80:
        titles.append(first)

    # 2. Search first 15 lines for title keywords
    for line in lines[:15]:
        clean = _clean_line(line)
        if any(k in clean for k in TITLE_KEYWORDS):
            if 3 <= len(clean) <= 80:
                titles.append(clean)

    # Deduplicate & return
    titles = list(dict.fromkeys(titles))

    return titles


# ------------------------------------------------------------------
# LLM FALLBACK FOR DIFFICULT DOCUMENTS
# ------------------------------------------------------------------
def llm_extract_titles(text: str) -> List[str]:
    """
    LLM fallback: returns 1 or multiple job titles.
    Useful for messy DOCX or documents containing multiple roles.
    """

    prompt = f"""
Extract ALL job titles found inside the job description text.

Output JSON list only, like:
["Senior Data Engineer", "Cloud DevOps Engineer"]

Text:
{text[:4000]}
"""

    try:
        response = openai.ChatCompletion.create(
            model="mixtral-8x7b-32768",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100,
            temperature=0,
        )

        raw = response["choices"][0]["message"]["content"].strip()

        # Try parsing JSON list
        import json
        try:
            titles = json.loads(raw)
            if isinstance(titles, list):
                return titles
        except:
            pass

        # If LLM returned plain text — split lines
        lines = [l.strip() for l in raw.split("\n") if l.strip()]
        return lines

    except Exception as e:
        print("LLM JD Title Extraction Error:", e)
        return []


# ------------------------------------------------------------------
# MAIN ENTRY POINT — HYBRID JD TITLE EXTRACTION
# ------------------------------------------------------------------
def extract_jd_title(text: str) -> str:
    """
    Hybrid pipeline:
    1. Heuristic → fast, offline, stable
    2. Fallback to LLM when:
       - No titles found
       - Titles look generic / incorrect
       - Multiple roles exist → pick the first main role
    """

    if not text:
        return "Unknown Role"

    # --- Step 1: Heuristic detection ---
    heuristic_titles = heuristic_extract_titles(text)

    if heuristic_titles:
        # Use heuristic if it found clean titles
        best = heuristic_titles[0]
        if best.lower() not in ("role", "job description", "unknown", "overview"):
            return best

    # --- Step 2: LLM fallback ---
    llm_titles = llm_extract_titles(text)

    if llm_titles:
        return llm_titles[0]  # store only primary role

    return "Unknown Role"
