import os
from flask import Blueprint, request, jsonify, redirect, url_for, current_app, session
from app.models.user import User
from app.models.account import Account
from app import db
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from google_auth_oauthlib.flow import Flow
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

auth_bp = Blueprint('auth_bp', __name__)

# --- INICIO DE LA IMPLEMENTACIÓN DE GOOGLE OAUTH ---
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1' # Solo para desarrollo en http

def get_google_flow():
    return Flow.from_client_secrets_file(
        client_secrets_file='client_secret_FD-5-746869307344-soosvtten2fl7lv7vsde5rpgu1grs84q.apps.googleusercontent.com.json',
        scopes=[
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email",
            "openid"
        ],
        redirect_uri=url_for('auth_bp.google_callback', _external=True)
    )

@auth_bp.route('/google/login')
def google_login():
    flow = get_google_flow()
    authorization_url, state = flow.authorization_url()
    session['state'] = state
    return redirect(authorization_url)

@auth_bp.route('/google/callback')
def google_callback():
    flow = get_google_flow()
    flow.fetch_token(authorization_response=request.url)

    credentials = flow.credentials
    id_info = id_token.verify_oauth2_token(
        id_token=credentials.id_token,
        request=google_requests.Request(),
        audience=current_app.config['GOOGLE_CLIENT_ID']
    )

    # Lógica para encontrar o crear el usuario
    user = User.query.filter_by(email=id_info.get('email')).first()
    if user is None:
        # Crear nuevo usuario
        user = User(
            username=id_info.get('name', id_info.get('email')),
            email=id_info.get('email'),
        )
        # Crear la cuenta "Efectivo" por defecto
        default_account = Account(account_name="Efectivo", card="N/A", balance=0, user=user)
        db.session.add(user)
        db.session.add(default_account)
        db.session.commit()

    # Crear un token de nuestra aplicación para el usuario
    access_token = create_access_token(identity=str(user.id))

    # Redirigir al frontend con el token
    # Esta URL debe coincidir con tu app de frontend
    frontend_url = "https://tu-app.vercel.app" # O http://localhost:5173 para desarrollo
    return redirect(f"{frontend_url}/#token={access_token}")

# --- FIN DE LA IMPLEMENTACIÓN DE GOOGLE OAUTH ---

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
