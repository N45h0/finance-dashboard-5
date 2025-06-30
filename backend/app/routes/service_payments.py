from flask import Blueprint, request, jsonify
from app.models.service_payment import ServicePayment
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity

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
    required = ['amount', 'date', 'service_id']
    if not data or not all(k in data for k in required):
        return jsonify({'msg': 'Faltan datos'}), 400
    payment = ServicePayment(
        amount=data['amount'],
        date=data['date'],
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
