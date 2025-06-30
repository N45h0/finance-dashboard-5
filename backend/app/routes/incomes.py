from flask import Blueprint, request, jsonify
from app.models.income import Income
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity

incomes_bp = Blueprint('incomes_bp', __name__)

@incomes_bp.route('/', methods=['GET'])
@jwt_required()
def get_incomes():
    user_id = get_jwt_identity()
    incomes = Income.query.filter_by(user_id=user_id).all()
    return jsonify([{'id': i.id, 'income_name': i.income_name, 'income_date': i.income_date.isoformat(), 'description': i.description, 'category': i.category, 'amount': i.amount, 'account_id': i.account_id} for i in incomes])

@incomes_bp.route('/', methods=['POST'])
@jwt_required()
def create_income():
    user_id = get_jwt_identity()
    data = request.get_json()
    if not data or not all(k in data for k in ('income_name', 'income_date', 'amount', 'category', 'account_id')):
        return jsonify({'msg': 'Faltan datos'}), 400
    income = Income(
        income_name=data['income_name'],
        income_date=data['income_date'],
        description=data.get('description'),
        category=data['category'],
        amount=data['amount'],
        user_id=user_id,
        account_id=data['account_id']
    )
    db.session.add(income)
    db.session.commit()
    return jsonify({'msg': 'Ingreso creado', 'id': income.id}), 201

@incomes_bp.route('/<int:income_id>', methods=['PUT'])
@jwt_required()
def update_income(income_id):
    user_id = get_jwt_identity()
    income = Income.query.filter_by(id=income_id, user_id=user_id).first()
    if not income:
        return jsonify({'msg': 'Ingreso no encontrado'}), 404
    data = request.get_json()
    for field in ['income_name', 'income_date', 'description', 'category', 'amount', 'account_id']:
        if field in data:
            setattr(income, field, data[field])
    db.session.commit()
    return jsonify({'msg': 'Ingreso actualizado'})

@incomes_bp.route('/<int:income_id>', methods=['DELETE'])
@jwt_required()
def delete_income(income_id):
    user_id = get_jwt_identity()
    income = Income.query.filter_by(id=income_id, user_id=user_id).first()
    if not income:
        return jsonify({'msg': 'Ingreso no encontrado'}), 404
    db.session.delete(income)
    db.session.commit()
    return jsonify({'msg': 'Ingreso eliminado'})
