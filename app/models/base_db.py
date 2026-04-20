
import pymysql
import os
from app.config import settings

class BaseDB:
    def __init__(self):
        self.conn = pymysql.connect(
            host=settings.DB_HOST,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            database=settings.DB_NAME,
            port=settings.DB_PORT,
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=True
        )
        self.cursor = self.conn.cursor()
        self._create_tables()

    def _create_tables(self):

        # users
        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) UNIQUE,
            password VARCHAR(255),
            email VARCHAR(255) UNIQUE,
            full_name VARCHAR(255),
            picture_url TEXT,
            is_admin TINYINT(1) DEFAULT 0,
            token_balance DOUBLE DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)

        # token_history
        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS token_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            type VARCHAR(10),
            amount DOUBLE,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """)

        # base
        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS base (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255),
            url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)

        # packages
        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS packages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255),
            tokens INT,
            amount_vnd INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)

        # payments
        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS payments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            package_id INT,
            amount_vnd INT,
            tokens INT,
            status VARCHAR(20) DEFAULT 'pending',
            sepay_id VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """)

        # conversations (NEW)
        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            title VARCHAR(255),
            is_pinned TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """)

        # chat_logs (UPDATED)
        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            conversation_id INT,
            question TEXT,
            answer TEXT,
            tokens_charged DOUBLE,
            chart_summary TEXT,
            chart_svg LONGTEXT,
            partner_chart_svg LONGTEXT,
            compatibility INT,
            label VARCHAR(50),
            partner_json LONGTEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (conversation_id) REFERENCES conversations(id)
        )
        """)

        # settings
        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS settings (
            `key` VARCHAR(255) PRIMARY KEY,
            value TEXT
        )
        """)

        self.cursor.execute("INSERT IGNORE INTO settings (`key`, value) VALUES ('rate_per_1000','1.0')")
        self.cursor.execute("INSERT IGNORE INTO settings (`key`, value) VALUES ('logo_url','')")
        self.cursor.execute("INSERT IGNORE INTO settings (`key`, value) VALUES ('site_title','Zodiac Whisper')")
        self.cursor.execute("INSERT IGNORE INTO settings (`key`, value) VALUES ('background_url','')")

        # payment_reports
        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS payment_reports (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            payment_id INT,
            description TEXT,
            status VARCHAR(20) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """)

        # login_logs
        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS login_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            ip_address VARCHAR(255),
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """)

    def log_login(self, user_id, ip_address, user_agent):
        self.cursor.execute(
            "INSERT INTO login_logs (user_id, ip_address, user_agent) VALUES (%s,%s,%s)",
            (user_id, ip_address, user_agent)
        )

    def get_recent_logins(self, limit=50):
        query = """
        SELECT ll.*, u.username, u.email
        FROM login_logs ll
        JOIN users u ON ll.user_id = u.id
        ORDER BY ll.created_at DESC
        LIMIT %s
        """
        self.cursor.execute(query, (limit,))
        return self.cursor.fetchall()

    def get_setting(self, key, default=None):
        self.cursor.execute("SELECT value FROM settings WHERE `key`=%s",(key,))
        row = self.cursor.fetchone()
        return row['value'] if row else default

    def set_setting(self,key,value):
        self.cursor.execute(
            "REPLACE INTO settings (`key`,value) VALUES (%s,%s)",
            (key,str(value))
        )

    def get_all_chat_logs(self):

        query="""
        SELECT cl.*,u.username,u.email
        FROM chat_logs cl
        JOIN users u ON cl.user_id=u.id
        ORDER BY cl.created_at DESC
        """

        self.cursor.execute(query)
        rows=self.cursor.fetchall()

        result=[]
        import json

        for row in rows:
            d=dict(row)

            if d.get("chart_summary"):
                try:
                    d["chart_summary"]=json.loads(d["chart_summary"])
                except:
                    pass

            result.append(d)

        return result

    def get_user_chat_logs(self,user_id):

        self.cursor.execute(
            "SELECT * FROM chat_logs WHERE user_id=%s ORDER BY created_at ASC",
            (user_id,)
        )

        rows=self.cursor.fetchall()

        result=[]
        import json

        for row in rows:
            d=dict(row)

            if d.get("chart_summary"):
                try:
                    d["chart_summary"]=json.loads(d["chart_summary"])
                except:
                    pass

            result.append(d)

        return result

    def get_all_pictures(self):

        self.cursor.execute("SELECT * FROM base")
        return self.cursor.fetchall()
    # ===============================
    # CONVERSATIONS
    # ===============================

    def create_conversation(self, user_id, title="Luận giải mới"):

        self.cursor.execute(
            "INSERT INTO conversations (user_id,title) VALUES (%s,%s)",
            (user_id, title)
        )

        return self.cursor.lastrowid


    def get_user_conversations(self, user_id):

        self.cursor.execute(
            "SELECT * FROM conversations WHERE user_id=%s ORDER BY is_pinned DESC, created_at DESC",
            (user_id,)
        )

        return self.cursor.fetchall()


    # 🔥 NEW
    def get_conversation(self, conversation_id):

        self.cursor.execute(
            "SELECT * FROM conversations WHERE id=%s",
            (conversation_id,)
        )

        return self.cursor.fetchone()


    # 🔥 NEW
    def update_conversation_title(self, conversation_id, title):

        self.cursor.execute(
            "UPDATE conversations SET title=%s WHERE id=%s",
            (title, conversation_id)
        )

    # 🔥 NEW: PIN
    def update_conversation_pin(self, conversation_id, is_pinned):
        self.cursor.execute(
            "UPDATE conversations SET is_pinned=%s WHERE id=%s",
            (1 if is_pinned else 0, conversation_id)
        )
    def delete_conversation(self, user_id, conversation_id):

        # xóa chat logs trước
        self.cursor.execute(
            "DELETE FROM chat_logs WHERE conversation_id=%s AND user_id=%s",
            (conversation_id, user_id)
        )

        # xóa conversation
        self.cursor.execute(
            "DELETE FROM conversations WHERE id=%s AND user_id=%s",
            (conversation_id, user_id)
        )
    # ===============================
    # CHAT LOG
    # ===============================

    def save_chat_log(
        self,
        user_id,
        conversation_id,
        question,
        answer,
        tokens_charged,
        chart,   # 🔥 THÊM
        chart_summary=None,
        chart_svg=None,
        partner_chart_svg=None,
        compatibility=None,
        label=None,
        partner_json=None
    ):

        import json

        summary_json = json.dumps(chart_summary) if chart_summary else None

        self.cursor.execute(
            """
            INSERT INTO chat_logs
            (user_id,conversation_id,question,answer,tokens_charged,chart,chart_summary,chart_svg,partner_chart_svg,compatibility,label,partner_json)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """,
            (
                user_id,
                conversation_id,
                question,
                answer,
                float(tokens_charged),
                chart,
                summary_json,
                chart_svg,
                partner_chart_svg,
                compatibility,       
                label,
                json.dumps(partner_json) if partner_json else None               
            )
        )
    # 🚀 NEW: dùng cho history (1 query duy nhất)
    def get_all_user_logs(self, user_id):
        self.cursor.execute(
            "SELECT * FROM chat_logs WHERE user_id=%s ORDER BY created_at ASC",
            (user_id,)
        )
        return self.cursor.fetchall()
    def get_user_chat_logs(self, conversation_id):

        self.cursor.execute(
            "SELECT * FROM chat_logs WHERE conversation_id=%s ORDER BY created_at ASC",
            (conversation_id,)
        )

        rows = self.cursor.fetchall()

        result = []

        import json

        for row in rows:

            d = dict(row)

            if d.get("chart_summary"):
                try:
                    d["chart_summary"] = json.loads(d["chart_summary"])
                except:
                    pass

            result.append(d)

        return result

    def delete_user_chat_logs(self, user_id):

        # 🔥 xóa chat logs
        self.cursor.execute(
            "DELETE FROM chat_logs WHERE user_id=%s",
            (user_id,)
        )

        # 🔥 xóa conversations
        self.cursor.execute(
            "DELETE FROM conversations WHERE user_id=%s",
            (user_id,)
        )
    def close(self):

        if self.conn:
            self.conn.close()

    # ===============================
    # 🧠 USER MEMORY
    # ===============================
    def get_user_memory(self, user_id):
        self.cursor.execute(
            "SELECT profile FROM user_memory WHERE user_id=%s",
            (user_id,)
        )
        row = self.cursor.fetchone()

        if row and row.get("profile"):
            import json
            return json.loads(row["profile"])

        return {}


    def update_user_memory(self, user_id, profile):
        import json

        self.cursor.execute(
            """
            INSERT INTO user_memory (user_id, profile)
            VALUES (%s, %s)
            ON DUPLICATE KEY UPDATE profile=%s
            """,
            (user_id, json.dumps(profile), json.dumps(profile))
        )



class UserDB(BaseDB):

    def get_all(self):

        self.cursor.execute("SELECT * FROM users")
        return self.cursor.fetchall()

    def get_by_username(self,username):

        self.cursor.execute(
            "SELECT * FROM users WHERE username=%s",
            (username,)
        )

        return self.cursor.fetchone()

    def get_by_email(self,email):

        self.cursor.execute(
            "SELECT * FROM users WHERE email=%s",
            (email,)
        )

        return self.cursor.fetchone()

    def add(self,username,password,email,is_admin=0):

        import hashlib

        email_hash=hashlib.md5(
            email.strip().lower().encode()
        ).hexdigest()

        picture_url=f"https://www.gravatar.com/avatar/{email_hash}?d=identicon"

        self.cursor.execute(
            """INSERT INTO users
            (username,password,email,is_admin,token_balance,picture_url)
            VALUES (%s,%s,%s,%s,%s,%s)""",
            (username,password,email,is_admin,10,picture_url)
        )

        return self.cursor.lastrowid

    def change_token_balance(self,user_id,amount,description,tx_type):

        self.cursor.execute(
            "UPDATE users SET token_balance=token_balance+%s WHERE id=%s",
            (amount if tx_type=='in' else -amount,user_id)
        )

        self.cursor.execute(
            """INSERT INTO token_history
            (user_id,type,amount,description)
            VALUES (%s,%s,%s,%s)""",
            (user_id,tx_type,amount,description)
        )

        self.cursor.execute(
            "SELECT token_balance FROM users WHERE id=%s",
            (user_id,)
        )

        row=self.cursor.fetchone()

        return row["token_balance"] if row else None
        # ---------------- TOKEN HISTORY ----------------

    def get_token_history(self, user_id):
        self.cursor.execute(
            "SELECT * FROM token_history WHERE user_id=%s ORDER BY created_at DESC",
            (user_id,)
        )
        return self.cursor.fetchall()


    def get_all_token_history(self):

        query = """
        SELECT th.*, u.username, u.email
        FROM token_history th
        JOIN users u ON th.user_id = u.id
        ORDER BY th.created_at DESC
        """

        self.cursor.execute(query)

        return self.cursor.fetchall()


    # ---------------- PACKAGES ----------------

    def get_packages(self):

        self.cursor.execute(
            "SELECT * FROM packages ORDER BY amount_vnd ASC"
        )

        return self.cursor.fetchall()


    def add_package(self, name, tokens, amount_vnd):

        self.cursor.execute(
            "INSERT INTO packages (name, tokens, amount_vnd) VALUES (%s,%s,%s)",
            (name, tokens, amount_vnd)
        )


    def delete_package(self, package_id):

        self.cursor.execute(
            "DELETE FROM packages WHERE id=%s",
            (package_id,)
        )


    def update_package(self, package_id, name, tokens, amount_vnd):

        self.cursor.execute(
            "UPDATE packages SET name=%s, tokens=%s, amount_vnd=%s WHERE id=%s",
            (name, tokens, amount_vnd, package_id)
        )


    # ---------------- PAYMENTS ----------------

    def create_payment(self, user_id, package_id, amount_vnd, tokens):

        self.cursor.execute(
            """INSERT INTO payments
            (user_id, package_id, amount_vnd, tokens)
            VALUES (%s,%s,%s,%s)""",
            (user_id, package_id, amount_vnd, tokens)
        )

        return self.cursor.lastrowid


    def get_payment(self, payment_id):

        self.cursor.execute(
            "SELECT * FROM payments WHERE id=%s",
            (payment_id,)
        )

        row = self.cursor.fetchone()

        return dict(row) if row else None


    def get_payment_by_sepay_id(self, sepay_id):

        self.cursor.execute(
            "SELECT * FROM payments WHERE sepay_id=%s",
            (sepay_id,)
        )

        row = self.cursor.fetchone()

        return dict(row) if row else None


    def update_payment_status(self, payment_id, status, sepay_id=None):

        if sepay_id:

            self.cursor.execute(
                "UPDATE payments SET status=%s, sepay_id=%s WHERE id=%s",
                (status, sepay_id, payment_id)
            )

        else:

            self.cursor.execute(
                "UPDATE payments SET status=%s WHERE id=%s",
                (status, payment_id)
            )


    def get_pending_payments(self):

        self.cursor.execute(
            "SELECT * FROM payments WHERE status='pending'"
        )

        return self.cursor.fetchall()


    def get_all_payments(self):

        query = """
        SELECT p.*, u.username, u.email
        FROM payments p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
        """

        self.cursor.execute(query)

        return self.cursor.fetchall()


    # ---------------- PAYMENT REPORT ----------------

    def create_payment_report(self, user_id, payment_id, description):

        self.cursor.execute(
            """INSERT INTO payment_reports
            (user_id, payment_id, description)
            VALUES (%s,%s,%s)""",
            (user_id, payment_id, description)
        )

        return self.cursor.lastrowid


    def get_all_payment_reports(self):

        query = """
        SELECT pr.*, u.username, u.email
        FROM payment_reports pr
        JOIN users u ON pr.user_id = u.id
        ORDER BY pr.created_at DESC
        """

        self.cursor.execute(query)

        return self.cursor.fetchall()


    def update_payment_report_status(self, report_id, status):

        self.cursor.execute(
            "UPDATE payment_reports SET status=%s WHERE id=%s",
            (status, report_id)
        )
    def delete_user(self, user_id):

        # xóa theo thứ tự FK

        self.cursor.execute("DELETE FROM user_memory WHERE user_id=%s", (user_id,))
        self.cursor.execute("DELETE FROM chat_logs WHERE user_id=%s", (user_id,))
        self.cursor.execute("DELETE FROM conversations WHERE user_id=%s", (user_id,))
        self.cursor.execute("DELETE FROM token_history WHERE user_id=%s", (user_id,))
        self.cursor.execute("DELETE FROM payments WHERE user_id=%s", (user_id,))
        self.cursor.execute("DELETE FROM payment_reports WHERE user_id=%s", (user_id,))
        self.cursor.execute("DELETE FROM login_logs WHERE user_id=%s", (user_id,))
        self.cursor.execute("DELETE FROM users WHERE id=%s", (user_id,))

    def update_user_info(self, user_id, username=None, email=None, is_admin=None, full_name=None, picture_url=None):

        fields = []
        values = []

        if username is not None:
            fields.append("username=%s")
            values.append(username)

        if email is not None:
            fields.append("email=%s")
            values.append(email)

        if full_name is not None:
            fields.append("full_name=%s")
            values.append(full_name)

        if picture_url is not None:
            fields.append("picture_url=%s")
            values.append(picture_url)

        if is_admin is not None:
            fields.append("is_admin=%s")
            values.append(int(is_admin))

        if not fields:
            return

        values.append(user_id)

        query = f"""
            UPDATE users
            SET {",".join(fields)}
            WHERE id=%s
        """

        self.cursor.execute(query, tuple(values))

    def update_user_password(self, user_id, hashed_password):

        self.cursor.execute(
            "UPDATE users SET password=%s WHERE id=%s",
            (hashed_password, user_id)
        ) 
    
    def update_or_create_google_user(self, email, name, picture):
        # 1. Check user theo email
        self.cursor.execute(
            "SELECT * FROM users WHERE email=%s",
            (email,)
        )
        user = self.cursor.fetchone()

        if user:
            # 2. Nếu đã tồn tại → update info
            self.cursor.execute("""
                UPDATE users
                SET full_name=%s, picture_url=%s
                WHERE email=%s
            """, (name, picture, email))

            # lấy lại user mới nhất
            self.cursor.execute(
                "SELECT * FROM users WHERE email=%s",
                (email,)
            )
            return self.cursor.fetchone()

        else:
            # 3. Nếu chưa có → tạo user mới
            username = email.split("@")[0]

            self.cursor.execute("""
                INSERT INTO users
                (username, email, full_name, picture_url, password, is_admin, token_balance)
                VALUES (%s,%s,%s,%s,%s,%s,%s)
            """, (
                username,
                email,
                name,
                picture,
                None,   # Google không cần password
                0,
                10      # cho sẵn 10 token luôn cho đẹp 😎
            ))

            # lấy user vừa tạo
            self.cursor.execute(
                "SELECT * FROM users WHERE email=%s",
                (email,)
            )
            return self.cursor.fetchone()

class ChatHistoryDB(BaseDB):
    def add_message(self, conversation_id, role, content, tokens_charged=0):
        """
        Lưu tin nhắn vào lịch sử chat. 
        Vì cấu trúc table chat_logs yêu cầu cả question và answer, 
        chúng ta sẽ lưu role='user' vào question và role='assistant' vào answer.
        """
        # Lấy user_id từ conversation_id
        self.cursor.execute("SELECT user_id FROM conversations WHERE id=%s", (conversation_id,))
        row = self.cursor.fetchone()
        if not row:
            return
            
        user_id = row['user_id']
        
        if role == 'user':
            self.save_chat_log(
                user_id=user_id,
                conversation_id=conversation_id,
                question=content,
                answer="",
                tokens_charged=tokens_charged,
                chart=None
            )
        else:
            # Tìm tin nhắn 'user' gần nhất chưa có câu trả lời để cập nhật hoặc tạo mới
            # Ở đây để đơn giản và phù hợp với logic 'add_message' gọi 2 lần, 
            # chúng ta sẽ cho phép answer trống hoặc question trống.
            self.save_chat_log(
                user_id=user_id,
                conversation_id=conversation_id,
                question="",
                answer=content,
                tokens_charged=tokens_charged,
                chart=None
            )