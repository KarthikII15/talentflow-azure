import requests
try:
    resp = requests.get("http://localhost:8000/cloud/setup?provider=azure", timeout=5)
    print(f"Status: {resp.status_code}")
    print(f"Body: {resp.text}")
except Exception as e:
    print(f"Error: {e}")
