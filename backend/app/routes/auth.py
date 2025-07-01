from flask import Blueprint, request, jsonify
from app.models.user import User
# --- INICIO DE LA CORRECIÓN ---
from app.models.account import Account # 1. Importar el modelo Account
# --- FIN DE LA CORRECIÓN ---
from app import db
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not all(k in data for k in ('username', 'email', 'password')):
        return jsonify({'msg': 'Faltan datos'}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'msg': 'El email ya está registrado'}), 409
    
    # Crear el nuevo usuario
    user = User(username=data['username'], email=data['email'])
    user.set_password(data['password'])
    db.session.add(user)
    
    # --- INICIO DE LA CORRECIÓN ---
    # 2. Crear la cuenta por defecto y asociarla al nuevo usuario
    default_account = Account(
        account_name="Efectivo",
        card="N/A",  # O algún otro valor por defecto
        balance=0,
        user=user # Asocia la cuenta directamente al objeto de usuario
    )
    db.session.add(default_account)
    # --- FIN DE LA CORRECIÓN ---

    db.session.commit()
    return jsonify({'msg': 'Usuario registrado correctamente'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not all(k in data for k in ('email', 'password')):
        return jsonify({'msg': 'Faltan datos'}), 400
    user = User.query.filter_by(email=data['email']).first()
    if user and user.check_password(data['password']):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({'access_token': access_token, 'user': {'id': user.id, 'username': user.username, 'email': user.email}})
    return jsonify({'msg': 'Credenciales incorrectas'}), 401

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'msg': 'Usuario no encontrado'}), 404
    return jsonify({'id': user.id, 'username': user.username, 'email': user.email})
