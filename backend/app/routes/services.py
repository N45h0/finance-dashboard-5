from flask import Blueprint, request, jsonify
from app.models.service import Service
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity

services_bp = Blueprint('services_bp', __name__)

@services_bp.route('/', methods=['GET'])
@jwt_required()
def get_services():
    user_id = get_jwt_identity()
    services = Service.query.filter_by(user_id=user_id).all()
    return jsonify([{'id': s.id, 'service_name': s.service_name, 'description': s.description, 'date': s.date.isoformat() if s.date else None, 'category': s.category, 'price': s.price, 'reamining_price': s.reamining_price, 'account_id': s.account_id, 'expiration_date': s.expiration_date.isoformat() if s.expiration_date else None} for s in services])

@services_bp.route('/', methods=['POST'])
@jwt_required()
def create_service():
    user_id = get_jwt_identity()
    data = request.get_json()
    required = ['service_name', 'date', 'category', 'price', 'reamining_price', 'account_id', 'expiration_date']
    if not data or not all(k in data for k in required):
        return jsonify({'msg': 'Faltan datos'}), 400
    service = Service(
        service_name=data['service_name'],
        description=data.get('description'),
        date=data['date'],
        category=data['category'],
        price=data['price'],
        reamining_price=data['reamining_price'],
        user_id=user_id,
        account_id=data['account_id'],
        expiration_date=data['expiration_date']
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
    for field in ['service_name', 'description', 'date', 'category', 'price', 'reamining_price', 'account_id', 'expiration_date']:
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
