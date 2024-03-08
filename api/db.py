import os
import psycopg2

# Credenziali di accesso al database PostgreSQL
dbname = os.environ.get("POSTGRES_DATABASE")
user = os.environ.get("POSTGRES_USER")
password = os.environ.get("POSTGRES_PASSWORD")
host = os.environ.get("POSTGRES_HOST")

def connect():
    # Connessione al database
    return psycopg2.connect(dbname=dbname, user=user, password=password, host=host, port=5432)


def add_visit(ip : str):
    conn = connect()
    visits = get_visits(ip)
    cur = conn.cursor()

    # Query di inserimento
    if visits == 0:
        query = "INSERT INTO visits (ip, visits) VALUES (%s, %s)"
        values = (ip, visits + 1)
    else:
        query = "UPDATE visits SET visits = %s WHERE ip = %s"
        values = (visits + 1, ip)
    print(values, flush=True)

    cur.execute(query, values)
    conn.commit()
    cur.close()

def get_visits(ip : str):
    conn = connect()
    cur = conn.cursor()

    query = "SELECT visits FROM visits WHERE ip = %s"
    values = (ip,)

    cur.execute(query, values)
    result = cur.fetchone()
    cur.close()
    if result == None:
        return 0
    return int(result[0])

def add_feedback(question: str, body: str, feedback: bool):
    conn = connect()
    # Query di inserimento
    try:
        cur = conn.cursor()
        query = "INSERT INTO feedback (query, body, feedback) VALUES (%s, %s, %s)"
        values = (question, body, feedback)

        cur.execute(query, values)
        conn.commit()
    except Exception as e:
        print("error on setting feedback", e, flush=True)
    finally:
        cur.close()

def add_email(mail : str):
    conn = connect()
    # Query di inserimento
    try:
        cur = conn.cursor()
        query = "INSERT INTO emails (email) VALUES (%s)"
        values = (mail,)

        cur.execute(query, values)
        conn.commit()
    except Exception as e:
        print("error on adding email", e, flush=True)
    finally:
        cur.close()
