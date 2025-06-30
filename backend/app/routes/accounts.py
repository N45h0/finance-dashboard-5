from flask import Blueprint, request, jsonify
from app.models.account import Account
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity

accounts_bp = Blueprint('accounts_bp', __name__)

@accounts_bp.route('/', methods=['GET'])
@jwt_required()
def get_accounts():
    user_id = get_jwt_identity()
    accounts = Account.query.filter_by(user_id=user_id).all()
    return jsonify([{'id': a.id, 'account_name': a.account_name, 'card': a.card, 'balance': a.balance} for a in accounts])

@accounts_bp.route('/', methods=['POST'])
@jwt_required()
def create_account():
    user_id = get_jwt_identity()
    data = request.get_json()
    if not data or not all(k in data for k in ('account_name', 'card', 'balance')):
        return jsonify({'msg': 'Faltan datos'}), 400
    account = Account(account_name=data['account_name'], card=data['card'], balance=data['balance'], user_id=user_id)
    db.session.add(account)
    db.session.commit()
    return jsonify({'msg': 'Cuenta creada', 'id': account.id}), 201

@accounts_bp.route('/<int:account_id>', methods=['PUT'])
@jwt_required()
def update_account(account_id):
    user_id = get_jwt_identity()
    account = Account.query.filter_by(id=account_id, user_id=user_id).first()
    if not account:
        return jsonify({'msg': 'Cuenta no encontrada'}), 404
    data = request.get_json()
    for field in ['account_name', 'card', 'balance']:
        if field in data:
            setattr(account, field, data[field])
    db.session.commit()
    return jsonify({'msg': 'Cuenta actualizada'})

@accounts_bp.route('/<int:account_id>', methods=['DELETE'])
@jwt_required()
def delete_account(account_id):
    user_id = get_jwt_identity()
    account = Account.query.filter_by(id=account_id, user_id=user_id).first()
    if not account:
        return jsonify({'msg': 'Cuenta no encontrada'}), 404
    db.session.delete(account)
    db.session.commit()
    return jsonify({'msg': 'Cuenta eliminada'})
