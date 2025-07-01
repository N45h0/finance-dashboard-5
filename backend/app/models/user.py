from app import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), nullable=False)
    email = db.Column(db.String(320), unique=True, nullable=False)
    password_hash = db.Column(db.String(255))
    balance = db.Column(db.Integer, default=0)
    email_conf = db.Column(db.Boolean, default=False)
    
    # --- LÍNEA AÑADIDA ---
    # Esto crea la relación inversa para poder usar `user.accounts`
    accounts = db.relationship('Account', back_populates='user', cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)