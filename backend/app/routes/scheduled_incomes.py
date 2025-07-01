from flask import Blueprint, request, jsonify
from app.models.scheduled_income import ScheduledIncome
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

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
    
    required_fields = ['income_name', 'income_date', 'description', 'category', 'next_income', 'amount', 'received_amount', 'pending_amount', 'account_id']
    if not all(field in data and data[field] not in [None, ''] for field in required_fields):
        return jsonify({'msg': 'Faltan campos obligatorios'}), 400

    try:
        income_date_obj = datetime.fromisoformat(data['income_date']).date()
        next_income_obj = datetime.fromisoformat(data['next_income']).date()
    except ValueError:
        return jsonify({'msg': 'Formato de fecha inválido. Usar YYYY-MM-DD.'}), 400

    income = ScheduledIncome(
        income_name=data['income_name'],
        income_date=income_date_obj,
        description=data['description'],
        category=data['category'],
        next_income=next_income_obj,
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

    try:
        if 'income_date' in data and data['income_date']:
            data['income_date'] = datetime.fromisoformat(data['income_date']).date()
        if 'next_income' in data and data['next_income']:
            data['next_income'] = datetime.fromisoformat(data['next_income']).date()
    except (ValueError, TypeError):
        return jsonify({'msg': 'Formato de fecha inválido en la actualización.'}), 400
    
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