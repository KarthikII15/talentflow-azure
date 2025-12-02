import os
import socket
import traceback
import requests
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

def section(title):
    print("\n" + "="*50)
    print(title)
    print("="*50)

def test_dns(domain):
    try:
        ip = socket.gethostbyname(domain)
        print(f"  DNS OK: {domain} -> {ip}")
    except Exception as e:
        print(f"  ❌ DNS FAILED for {domain}: {repr(e)}")

def test_https(url):
    try:
        resp = requests.get(url, timeout=5)
        print(f"  HTTPS OK: {url} -> {resp.status_code}")
    except Exception as e:
        print(f"  ❌ HTTPS FAILED for {url}")
        print(f"     {repr(e)}")

def test_groq():
    groq_key = os.getenv("GROQ")

    section("[STEP] Groq Environment Check")
    if groq_key:
        print("  GROQ key found:", groq_key[:6] + "...")
    else:
        print("  ❌ GROQ key missing! Skipping Groq test.")
        return

    section("[STEP] Groq Client Test")

    client = Groq(api_key=groq_key)

    try:
        print("  -> Sending Groq request...")
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": "Hello from Groq connectivity test"}],
            temperature=0,
        )
        print("  ✅ Groq response:", response.choices[0].message.content)
    except Exception as e:
        print("  ❌ Groq FAILED")
        print("     Type:", type(e))
        print("     Repr:", repr(e))
        traceback.print_exc()

def test_gemini():
    gemini_key = os.getenv("GEMINI_API_KEY")

    section("[STEP] Gemini Environment Check")
    if gemini_key:
        print("  GEMINI key found:", gemini_key[:6] + "...")
    else:
        print("  ❌ GEMINI key missing! Skipping Gemini test.")
        return

    section("[STEP] Gemini Connectivity Test")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={gemini_key}"

    payload = {
        "contents": [
            {"parts": [{"text": "Hello from Gemini connectivity test"}]}
        ]
    }

    try:
        print("  -> Sending Gemini request...")
        resp = requests.post(url, json=payload, timeout=5)
        print("  HTTP", resp.status_code)
        print("  Response:", resp.text[:200])  
    except Exception as e:
        print("  ❌ Gemini FAILED")
        print("     Type:", type(e))
        print("     Repr:", repr(e))

def main():
    section("GLOBAL DNS CHECK")
    test_dns("api.groq.com")
    test_dns("generativelanguage.googleapis.com")

    section("GLOBAL HTTPS CHECK")
    test_https("https://api.groq.com")
    test_https("https://generativelanguage.googleapis.com")

    test_groq()
    test_gemini()

if __name__ == "__main__":
    main()
