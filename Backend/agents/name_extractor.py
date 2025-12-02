import re
import openai
import os
from dotenv import load_dotenv

load_dotenv()

openai.api_key = os.getenv("GROQ")  # or OPENAI_API_KEY

# --------------------------------------------------------
# RULE-BASED + LLM FALLBACK
# --------------------------------------------------------

def extract_name_regex(text: str):
    # Look for typical resume patterns
    lines = text.split("\n")

    for line in lines[:5]:
        clean = line.strip()
        if len(clean.split()) in [2, 3] and clean[0].isupper():
            return clean

    return None


def extract_name_llm(text: str):
    prompt = f"""
Extract ONLY the candidate's full name from this resume text.
If unsure, return only the best guess.
Resume Text:
{text[:2000]}  # limit for speed
"""

    try:
        response = openai.ChatCompletion.create(
            model="mixtral-8x7b-32768",  
            messages=[{"role": "user", "content": prompt}],
            max_tokens=20,
            temperature=0
        )
        return response["choices"][0]["message"]["content"].strip()

    except:
        return None


def extract_name_from_text(text: str) -> str:
    # Try regex first
    name = extract_name_regex(text)
    if name:
        return name

    # Then LLM fallback
    name = extract_name_llm(text)
    if name:
        return name

    return "Unknown Candidate"
