from app import db

class Loan(db.Model):
    __tablename__ = 'loans'
    id = db.Column(db.Integer, primary_key=True)
    loan_name = db.Column(db.String(50), nullable=False)
    holder = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    description = db.Column(db.String(160), nullable=True)
    date = db.Column(db.Date, nullable=False)
    quota = db.Column(db.Integer, nullable=True)
    tea = db.Column(db.Float, nullable=True)
    # --- CORRECCIÓN DE TYPO ---
    reamining_price = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'))
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id', ondelete='CASCADE'))
    expiration_date = db.Column(db.Date, nullable=False)
    payments = db.relationship('LoanPayment', back_populates='loan', cascade="all, delete-orphan")