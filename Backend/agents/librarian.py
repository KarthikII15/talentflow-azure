# backend/agents/librarian.py

import os
import google.generativeai as genai
from typing import Literal

DocType = Literal["RESUME", "JD", "REFERENCE", "UNKNOWN"]

class LibrarianAgent:

    def __init__(self):
        # Load Gemini API key
        api_key = os.getenv("GEMINI_API_KEY")
        genai.configure(api_key=api_key)

        # Use Gemini 1.5 Flash (best for classification)
        self.model = genai.GenerativeModel("gemini-2.5-flash")

    def classify_document(self, text: str) -> DocType:

        prompt = f"""
Classify the following document into EXACTLY ONE category:

1. RESUME  → Contains personal info, education, skills, projects, experience.
2. JD      → Contains job description, roles, responsibilities, required skills.
3. REFERENCE → Interview prep, notes, study materials, articles.
4. UNKNOWN → If unreadable, empty, irrelevant.

Return ONLY one word: RESUME, JD, REFERENCE, UNKNOWN.

Document:
{text}
"""

        try:
            response = self.model.generate_content(prompt)
            result = response.text.strip().upper()

            allowed = {"RESUME", "JD", "REFERENCE", "UNKNOWN"}
            if result not in allowed:
                return "UNKNOWN"

            return result

        except Exception as e:
            print("Gemini Classification Error:", e)
            return "UNKNOWN"
