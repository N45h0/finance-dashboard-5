from app import db

class LoanPayment(db.Model):
    __tablename__ = 'loan_payments'
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Integer, nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    description = db.Column(db.Text, nullable=True)
    loan_id = db.Column(db.Integer, db.ForeignKey('loans.id', ondelete='CASCADE'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'))
    loan = db.relationship('Loan', back_populates='payments')