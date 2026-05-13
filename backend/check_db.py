import psycopg2
try:
    conn = psycopg2.connect('postgres://postgres:rishiktrue11@localhost:5432/acp_db')
    cur = conn.cursor()
    cur.execute('SELECT title, fields FROM "FormSessions" ORDER BY "createdAt" DESC LIMIT 5')
    rows = cur.fetchall()
    for r in rows:
        print(f"Title: {r[0]}")
        print(f"Fields: {r[1]}")
        print(f"Type: {type(r[1])}")
        print("-" * 20)
except Exception as e:
    print(e)
