from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import credentials, auth

# Firebase Admin initialization
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred)

app = FastAPI()

# Bearer token security
security = HTTPBearer()


# Public test route
@app.get("/")
def home():
    return {
        "message": "Network Security Auditor Backend is running!"
    }


# Verify Firebase ID token
def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired Firebase ID token"
        )


# Protected route
@app.get("/auth/me")
def get_current_user(user=Depends(verify_token)):
    return {
        "message": "Authentication successful",
        "uid": user["uid"],
        "email": user.get("email"),
        "phone_number": user.get("phone_number")
    }
from database import get_db_connection
@app.get("/db-test")
def test_database():
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("SELECT DATABASE();")
        result = cursor.fetchone()
        cursor.close()
        db.close()

        return {
            "message": "MySQL connection successful",
            "database": result[0]
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )