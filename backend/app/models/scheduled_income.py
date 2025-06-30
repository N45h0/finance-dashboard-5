from app import db

class ScheduledIncome(db.Model):
    __tablename__ = 'scheduled_incomes'
    id = db.Column(db.Integer, primary_key=True)
    income_name = db.Column(db.String(50), nullable=False)
    income_date = db.Column(db.DateTime, nullable=False)
    description = db.Column(db.String(150), nullable=False)
    category = db.Column(db.String(30), nullable=False)
    next_income = db.Column(db.DateTime, nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    received_amount = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'))
    pending_amount = db.Column(db.Integer, nullable=False)
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id', ondelete='CASCADE'))
