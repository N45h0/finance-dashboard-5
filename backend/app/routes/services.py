from flask import Blueprint, request, jsonify
from app.models.service import Service
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

services_bp = Blueprint('services_bp', __name__)

@services_bp.route('/', methods=['GET'])
@jwt_required()
def get_services():
    user_id = get_jwt_identity()
    services = Service.query.filter_by(user_id=user_id).all()
    # --- CORRECCIÓN DE TYPO ---
    return jsonify([{'id': s.id, 'service_name': s.service_name, 'description': s.description, 'date': s.date.isoformat() if s.date else None, 'category': s.category, 'price': s.price, 'remaining_price': s.remaining_price, 'account_id': s.account_id, 'expiration_date': s.expiration_date.isoformat() if s.expiration_date else None} for s in services])

@services_bp.route('/', methods=['POST'])
@jwt_required()
def create_service():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # --- CORRECCIÓN DE TYPO ---
    required_fields = ['service_name', 'date', 'category', 'price', 'remaining_price', 'account_id', 'expiration_date']
    if not all(field in data and data[field] not in [None, ''] for field in required_fields):
        return jsonify({'msg': 'Faltan campos obligatorios'}), 400

    try:
        date_obj = datetime.fromisoformat(data['date']).date()
        expiration_date_obj = datetime.fromisoformat(data['expiration_date']).date()
    except ValueError:
        return jsonify({'msg': 'Formato de fecha inválido. Usar YYYY-MM-DD.'}), 400

    service = Service(
        service_name=data['service_name'],
        description=data.get('description'),
        date=date_obj,
        category=data['category'],
        price=data['price'],
        remaining_price=data['remaining_price'], # --- CORRECCIÓN DE TYPO ---
        user_id=user_id,
        account_id=data['account_id'],
        expiration_date=expiration_date_obj
    )
    db.session.add(service)
    db.session.commit()
    return jsonify({'msg': 'Servicio creado', 'id': service.id}), 201

@services_bp.route('/<int:service_id>', methods=['PUT'])
@jwt_required()
def update_service(service_id):
    user_id = get_jwt_identity()
    service = Service.query.filter_by(id=service_id, user_id=user_id).first()
    if not service:
        return jsonify({'msg': 'Servicio no encontrado'}), 404
    data = request.get_json()

    try:
        if 'date' in data and data['date']:
            data['date'] = datetime.fromisoformat(data['date']).date()
        if 'expiration_date' in data and data['expiration_date']:
            data['expiration_date'] = datetime.fromisoformat(data['expiration_date']).date()
    except (ValueError, TypeError):
        return jsonify({'msg': 'Formato de fecha inválido en la actualización.'}), 400

    # --- CORRECCIÓN DE TYPO ---
    for field in ['service_name', 'description', 'date', 'category', 'price', 'remaining_price', 'account_id', 'expiration_date']:
        if field in data:
            setattr(service, field, data[field])
    db.session.commit()
    return jsonify({'msg': 'Servicio actualizado'})

@services_bp.route('/<int:service_id>', methods=['DELETE'])
@jwt_required()
def delete_service(service_id):
    user_id = get_jwt_identity()
    service = Service.query.filter_by(id=service_id, user_id=user_id).first()
    if not service:
        return jsonify({'msg': 'Servicio no encontrado'}), 404
    db.session.delete(service)
    db.session.commit()
    return jsonify({'msg': 'Servicio eliminado'})