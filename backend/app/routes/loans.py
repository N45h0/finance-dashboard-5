from flask import Blueprint, request, jsonify
from app.models.loan import Loan
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

loans_bp = Blueprint('loans_bp', __name__)

@loans_bp.route('/', methods=['GET'])
@jwt_required()
def get_loans():
    user_id = get_jwt_identity()
    loans = Loan.query.filter_by(user_id=user_id).all()
    return jsonify([{'id': l.id, 'loan_name': l.loan_name, 'holder': l.holder, 'price': l.price, 'description': l.description, 'date': l.date.isoformat() if l.date else None, 'quota': l.quota, 'tea': l.tea, 'remaining_price': l.remaining_price, 'account_id': l.account_id, 'expiration_date': l.expiration_date.isoformat() if l.expiration_date else None} for l in loans])

@loans_bp.route('/', methods=['POST'])
@jwt_required()
def create_loan():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    required_fields = ['loan_name', 'holder', 'price', 'date', 'remaining_price', 'account_id', 'expiration_date']
    if not all(field in data and data[field] not in [None, ''] for field in required_fields):
        return jsonify({'msg': 'Faltan campos obligatorios'}), 400

    try:
        date_obj = datetime.fromisoformat(data['date']).date()
        expiration_date_obj = datetime.fromisoformat(data['expiration_date']).date()
    except ValueError:
        return jsonify({'msg': 'Formato de fecha inválido. Usar YYYY-MM-DD.'}), 400

    loan = Loan(
        loan_name=data['loan_name'],
        holder=data['holder'],
        price=data['price'],
        description=data.get('description'),
        date=date_obj,
        quota=data.get('quota'),
        tea=data.get('tea'),
        remaining_price=data['remaining_price'],
        user_id=user_id,
        account_id=data['account_id'],
        expiration_date=expiration_date_obj
    )
    db.session.add(loan)
    db.session.commit()
    return jsonify({'msg': 'Préstamo creado', 'id': loan.id}), 201

@loans_bp.route('/<int:loan_id>', methods=['PUT'])
@jwt_required()
def update_loan(loan_id):
    user_id = get_jwt_identity()
    loan = Loan.query.filter_by(id=loan_id, user_id=user_id).first()
    if not loan:
        return jsonify({'msg': 'Préstamo no encontrado'}), 404
    data = request.get_json()
    
    try:
        if 'date' in data and data['date']:
            data['date'] = datetime.fromisoformat(data['date']).date()
        if 'expiration_date' in data and data['expiration_date']:
            data['expiration_date'] = datetime.fromisoformat(data['expiration_date']).date()
    except (ValueError, TypeError):
        return jsonify({'msg': 'Formato de fecha inválido en la actualización.'}), 400

    for field in ['loan_name', 'holder', 'price', 'description', 'date', 'quota', 'tea', 'remaining_price', 'account_id', 'expiration_date']:
        if field in data:
            setattr(loan, field, data[field])
    db.session.commit()
    return jsonify({'msg': 'Préstamo actualizado'})

@loans_bp.route('/<int:loan_id>', methods=['DELETE'])
@jwt_required()
def delete_loan(loan_id):
    user_id = get_jwt_identity()
    loan = Loan.query.filter_by(id=loan_id, user_id=user_id).first()
    if not loan:
        return jsonify({'msg': 'Préstamo no encontrado'}), 404
    db.session.delete(loan)
    db.session.commit()
    return jsonify({'msg': 'Préstamo eliminado'})