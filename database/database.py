import mysql.connector

def get_db_connection():
    return mysql.connector.connect(
        host="127.0.0.1",
        port=3307,
        user="root",
        password="",
        database="network_security_auditor"
    )