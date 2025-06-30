from app import db

class Service(db.Model):
    __tablename__ = 'services'
    id = db.Column(db.Integer, primary_key=True)
    service_name = db.Column(db.String(60), nullable=False)
    description = db.Column(db.String(160), nullable=True)
    date = db.Column(db.Date, nullable=False)
    category = db.Column(db.String(30), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    reamining_price = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'))
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id', ondelete='CASCADE'))
    expiration_date = db.Column(db.Date, nullable=False)
