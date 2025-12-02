import openai
import os
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("GROQ")

def extract_skills(text: str):
    prompt = f"""
Extract key technical skills from this resume.
Return a JSON list ONLY. No sentences.

Example output:
["Python", "SQL", "AWS", "Data Engineering"]

Resume:
{text[:2000]}
"""

    try:
        res = openai.ChatCompletion.create(
            model="mixtral-8x7b-32768",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=80,
            temperature=0
        )
        return res["choices"][0]["message"]["content"].strip()

    except:
        return "[]"
