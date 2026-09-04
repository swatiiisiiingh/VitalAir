import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "advisories.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS advisory_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            location TEXT,
            lat REAL,
            lon REAL,
            temperature REAL,
            aqi INTEGER,
            profile_summary TEXT,
            advisory_text TEXT,
            risk_level TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)
    conn.commit()
    conn.close()

def save_advisory(location, lat, lon, temperature, aqi, profile_summary, advisory_text, risk_level):
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """INSERT INTO advisory_log
           (location, lat, lon, temperature, aqi, profile_summary, advisory_text, risk_level)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (location, lat, lon, temperature, aqi, profile_summary, advisory_text, risk_level),
    )
    conn.commit()
    conn.close()

def get_history(lat, lon, limit=14):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        """SELECT * FROM advisory_log
           WHERE ABS(lat - ?) < 0.05 AND ABS(lon - ?) < 0.05
           ORDER BY created_at DESC LIMIT ?""",
        (lat, lon, limit),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def delete_advisory(item_id: int):
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DELETE FROM advisory_log WHERE id = ?", (item_id,))
    conn.commit()
    conn.close()
