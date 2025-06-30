from flask import Blueprint, request, jsonify
from app.models.scheduled_income import ScheduledIncome
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity

scheduled_incomes_bp = Blueprint('scheduled_incomes_bp', __name__)

@scheduled_incomes_bp.route('/', methods=['GET'])
@jwt_required()
def get_scheduled_incomes():
    user_id = get_jwt_identity()
    incomes = ScheduledIncome.query.filter_by(user_id=user_id).all()
    return jsonify([
        {
            'id': i.id,
            'income_name': i.income_name,
            'income_date': i.income_date.isoformat() if i.income_date else None,
            'description': i.description,
            'category': i.category,
            'next_income': i.next_income.isoformat() if i.next_income else None,
            'amount': i.amount,
            'received_amount': i.received_amount,
            'pending_amount': i.pending_amount,
            'account_id': i.account_id
        } for i in incomes
    ])

@scheduled_incomes_bp.route('/', methods=['POST'])
@jwt_required()
def create_scheduled_income():
    user_id = get_jwt_identity()
    data = request.get_json()
    required = ['income_name', 'income_date', 'description', 'category', 'next_income', 'amount', 'received_amount', 'pending_amount', 'account_id']
    if not data or not all(k in data for k in required):
        return jsonify({'msg': 'Faltan datos'}), 400
    income = ScheduledIncome(
        income_name=data['income_name'],
        income_date=data['income_date'],
        description=data['description'],
        category=data['category'],
        next_income=data['next_income'],
        amount=data['amount'],
        received_amount=data['received_amount'],
        pending_amount=data['pending_amount'],
        user_id=user_id,
        account_id=data['account_id']
    )
    db.session.add(income)
    db.session.commit()
    return jsonify({'msg': 'Ingreso programado creado', 'id': income.id}), 201

@scheduled_incomes_bp.route('/<int:income_id>', methods=['PUT'])
@jwt_required()
def update_scheduled_income(income_id):
    user_id = get_jwt_identity()
    income = ScheduledIncome.query.filter_by(id=income_id, user_id=user_id).first()
    if not income:
        return jsonify({'msg': 'Ingreso programado no encontrado'}), 404
    data = request.get_json()
    for field in ['income_name', 'income_date', 'description', 'category', 'next_income', 'amount', 'received_amount', 'pending_amount', 'account_id']:
        if field in data:
            setattr(income, field, data[field])
    db.session.commit()
    return jsonify({'msg': 'Ingreso programado actualizado'})

@scheduled_incomes_bp.route('/<int:income_id>', methods=['DELETE'])
@jwt_required()
def delete_scheduled_income(income_id):
    user_id = get_jwt_identity()
    income = ScheduledIncome.query.filter_by(id=income_id, user_id=user_id).first()
    if not income:
        return jsonify({'msg': 'Ingreso programado no encontrado'}), 404
    db.session.delete(income)
    db.session.commit()
    return jsonify({'msg': 'Ingreso programado eliminado'})
