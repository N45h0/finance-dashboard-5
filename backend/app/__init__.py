from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config

# Inicialización de extensiones

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    from app.routes.accounts import accounts_bp
    app.register_blueprint(accounts_bp, url_prefix="/api/accounts")

    from app.routes.incomes import incomes_bp
    app.register_blueprint(incomes_bp, url_prefix="/api/incomes")

    from app.routes.loans import loans_bp
    app.register_blueprint(loans_bp, url_prefix="/api/loans")

    from app.routes.services import services_bp
    app.register_blueprint(services_bp, url_prefix="/api/services")

    from app.routes.scheduled_incomes import scheduled_incomes_bp
    app.register_blueprint(scheduled_incomes_bp, url_prefix="/api/scheduled-incomes")

    from app.routes.loan_payments import loan_payments_bp
    app.register_blueprint(loan_payments_bp, url_prefix="/api/loan-payments")

    from app.routes.service_payments import service_payments_bp
    app.register_blueprint(service_payments_bp, url_prefix="/api/service-payments")

    # Importar y registrar blueprints aquí (se agregarán luego)
    # from .routes import api_bp
    # app.register_blueprint(api_bp, url_prefix="/api")

    return app
