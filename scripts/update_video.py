import sqlite3

con = sqlite3.connect('./data/run.db')
cur = con.cursor()
cur.execute("UPDATE products SET video_url = '/media/run-campaign-motion.mp4' WHERE id IN (1, 2, 4)")
con.commit()
print("Updated video_url in products! Rows affected:", cur.rowcount)

# Verify
rows = cur.execute("SELECT id, name, video_url FROM products WHERE video_url IS NOT NULL").fetchall()
for r in rows:
    print(" -", r[0], r[1], "->", r[2])
con.close()
