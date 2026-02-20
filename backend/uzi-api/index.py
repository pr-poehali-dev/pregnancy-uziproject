"""
API для УЗИ-центра: врачи, расписание, запись на приём и админка.
"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = "t_p23992535_pregnancy_uziproject"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
}

ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "uzi-admin-2026")


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"], cursor_factory=RealDictCursor)


def resp(data, status=200):
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(data, ensure_ascii=False, default=str)}


def err(msg, status=400):
    return resp({"error": msg}, status)


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")
    params = event.get("queryStringParameters") or {}
    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            pass

    # GET /doctors
    if method == "GET" and path == "/doctors":
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(f"SELECT * FROM {SCHEMA}.doctors ORDER BY id")
                doctors = [dict(r) for r in cur.fetchall()]
        return resp({"doctors": doctors})

    # GET /schedule?doctor_id=1
    if method == "GET" and path == "/schedule":
        doctor_id = params.get("doctor_id")
        if not doctor_id:
            return err("doctor_id required")
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT s.id, s.day_of_week, s.time_slot, s.is_active, "
                    f"CASE WHEN a.id IS NOT NULL THEN TRUE ELSE FALSE END as is_booked "
                    f"FROM {SCHEMA}.schedule_slots s "
                    f"LEFT JOIN {SCHEMA}.appointments a "
                    f"ON a.slot_id = s.id AND a.status != 'cancelled' "
                    f"WHERE s.doctor_id = %s AND s.is_active = TRUE "
                    f"ORDER BY s.day_of_week, s.time_slot",
                    (doctor_id,)
                )
                slots = [dict(r) for r in cur.fetchall()]
        schedule = {}
        for s in slots:
            day = s["day_of_week"]
            if day not in schedule:
                schedule[day] = []
            schedule[day].append({"id": s["id"], "time": s["time_slot"], "booked": s["is_booked"]})
        return resp({"schedule": schedule})

    # POST /appointments
    if method == "POST" and path == "/appointments":
        required = ["doctor_id", "slot_id", "patient_name", "patient_phone", "day_of_week", "time_slot"]
        for f in required:
            if not body.get(f):
                return err(f"Field {f} required")
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT id FROM {SCHEMA}.appointments WHERE slot_id = %s AND status != 'cancelled'",
                    (body["slot_id"],)
                )
                if cur.fetchone():
                    return err("Этот слот уже занят", 409)
                cur.execute(
                    f"INSERT INTO {SCHEMA}.appointments (doctor_id, slot_id, patient_name, patient_phone, comment, day_of_week, time_slot) "
                    f"VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id",
                    (body["doctor_id"], body["slot_id"], body["patient_name"], body["patient_phone"],
                     body.get("comment", ""), body["day_of_week"], body["time_slot"])
                )
                new_id = cur.fetchone()["id"]
            conn.commit()
        return resp({"success": True, "appointment_id": new_id}, 201)

    # ADMIN routes — check token
    token = (event.get("headers") or {}).get("X-Admin-Token", "")
    if not token:
        token = params.get("token", "")
    is_admin = token == ADMIN_TOKEN

    # GET /admin/appointments
    if method == "GET" and path == "/admin/appointments":
        if not is_admin:
            return err("Unauthorized", 401)
        status_filter = params.get("status", "")
        with get_conn() as conn:
            with conn.cursor() as cur:
                query = (
                    f"SELECT a.*, d.name as doctor_name FROM {SCHEMA}.appointments a "
                    f"JOIN {SCHEMA}.doctors d ON d.id = a.doctor_id "
                )
                if status_filter:
                    query += f" WHERE a.status = '{status_filter}'"
                query += " ORDER BY a.created_at DESC"
                cur.execute(query)
                appointments = [dict(r) for r in cur.fetchall()]
        return resp({"appointments": appointments})

    # PUT /admin/appointments/:id/status
    if method == "PUT" and "/admin/appointments/" in path and path.endswith("/status"):
        if not is_admin:
            return err("Unauthorized", 401)
        parts = path.split("/")
        try:
            appt_id = int(parts[-2])
        except Exception:
            return err("Invalid id")
        new_status = body.get("status")
        if new_status not in ("new", "confirmed", "cancelled", "done"):
            return err("Invalid status")
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    f"UPDATE {SCHEMA}.appointments SET status = %s WHERE id = %s",
                    (new_status, appt_id)
                )
            conn.commit()
        return resp({"success": True})

    # GET /admin/stats
    if method == "GET" and path == "/admin/stats":
        if not is_admin:
            return err("Unauthorized", 401)
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(f"SELECT COUNT(*) as total FROM {SCHEMA}.appointments")
                total = cur.fetchone()["total"]
                cur.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.appointments WHERE status = 'new'")
                new_cnt = cur.fetchone()["cnt"]
                cur.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.appointments WHERE status = 'confirmed'")
                confirmed = cur.fetchone()["cnt"]
                cur.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.appointments WHERE status = 'cancelled'")
                cancelled = cur.fetchone()["cnt"]
                cur.execute(
                    f"SELECT d.name, COUNT(a.id) as cnt FROM {SCHEMA}.doctors d "
                    f"LEFT JOIN {SCHEMA}.appointments a ON a.doctor_id = d.id "
                    f"GROUP BY d.name ORDER BY d.id"
                )
                by_doctor = [dict(r) for r in cur.fetchall()]
        return resp({"total": total, "new": new_cnt, "confirmed": confirmed, "cancelled": cancelled, "by_doctor": by_doctor})

    return err("Not found", 404)
