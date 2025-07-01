from flask import Blueprint, request, jsonify
from app.models.service_payment import ServicePayment
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

service_payments_bp = Blueprint('service_payments_bp', __name__)

@service_payments_bp.route('/', methods=['GET'])
@jwt_required()
def get_service_payments():
    user_id = get_jwt_identity()
    payments = ServicePayment.query.filter_by(user_id=user_id).all()
    return jsonify([
        {
            'id': p.id,
            'amount': p.amount,
            'date': p.date.isoformat() if p.date else None,
            'description': p.description,
            'service_id': p.service_id
        } for p in payments
    ])

@service_payments_bp.route('/', methods=['POST'])
@jwt_required()
def create_service_payment():
    user_id = get_jwt_identity()
    data = request.get_json()

    required_fields = ['amount', 'date', 'service_id']
    if not all(field in data and data[field] not in [None, ''] for field in required_fields):
        return jsonify({'msg': 'Faltan campos obligatorios'}), 400
    
    try:
        date_obj = datetime.fromisoformat(data['date']).date()
    except ValueError:
        return jsonify({'msg': 'Formato de fecha inválido. Usar YYYY-MM-DD.'}), 400

    payment = ServicePayment(
        amount=data['amount'],
        date=date_obj,
        description=data.get('description'),
        service_id=data['service_id'],
        user_id=user_id
    )
    db.session.add(payment)
    db.session.commit()
    return jsonify({'msg': 'Pago de servicio creado', 'id': payment.id}), 201

@service_payments_bp.route('/<int:payment_id>', methods=['PUT'])
@jwt_required()
def update_service_payment(payment_id):
    user_id = get_jwt_identity()
    payment = ServicePayment.query.filter_by(id=payment_id, user_id=user_id).first()
    if not payment:
        return jsonify({'msg': 'Pago de servicio no encontrado'}), 404
    data = request.get_json()

    try:
        if 'date' in data and data['date']:
            data['date'] = datetime.fromisoformat(data['date']).date()
    except (ValueError, TypeError):
        return jsonify({'msg': 'Formato de fecha inválido en la actualización.'}), 400

    for field in ['amount', 'date', 'description', 'service_id']:
        if field in data:
            setattr(payment, field, data[field])
    db.session.commit()
    return jsonify({'msg': 'Pago de servicio actualizado'})

@service_payments_bp.route('/<int:payment_id>', methods=['DELETE'])
@jwt_required()
def delete_service_payment(payment_id):
    user_id = get_jwt_identity()
    payment = ServicePayment.query.filter_by(id=payment_id, user_id=user_id).first()
    if not payment:
        return jsonify({'msg': 'Pago de servicio no encontrado'}), 404
    db.session.delete(payment)
    db.session.commit()
    return jsonify({'msg': 'Pago de servicio eliminado'})