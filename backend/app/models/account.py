from app import db

class Account(db.Model):
    __tablename__ = 'accounts'
    id = db.Column(db.Integer, primary_key=True)
    account_name = db.Column(db.String(50), nullable=False)
    card = db.Column(db.String(50), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    balance = db.Column(db.Float, nullable=False, default=0)

    # --- LÍNEA AÑADIDA ---
    # Esto crea la relación para poder usar `account.user` y que el constructor acepte `user=...`
    user = db.relationship('User', back_populates='accounts')