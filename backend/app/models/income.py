from app import db

class Income(db.Model):
    __tablename__ = 'incomes'
    id = db.Column(db.Integer, primary_key=True)
    income_name = db.Column(db.String(50), nullable=False)
    income_date = db.Column(db.DateTime, nullable=False)
    description = db.Column(db.String(150), nullable=True)
    category = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'))
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id', ondelete='CASCADE'))
