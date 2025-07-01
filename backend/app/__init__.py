# Contenido para backend/app/__init__.py

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

def create_app(config_class=Config):
    """
    Fábrica de la aplicación Flask.
    """
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(config_class)

    # Configurar CORS para permitir peticiones desde el frontend
#    CORS(app, resources={r"/api/*": {"origins": "*"}}) # Puedes ajustar origins para producción
    CORS(app, resources={r"/api/*": {"origins": "finance-dashboard-5.vercel.app"}}) 

    # Inicializar extensiones con la app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    with app.app_context():
        # Importar modelos para que Alembic (Migrate) los detecte
        from .models import user, account, income, loan, service, service_payment, loan_payment, scheduled_income

        # --- Registrar Blueprints de la API ---
        # Importa todos los blueprints que has creado
        from .routes.auth import auth_bp
        from .routes.accounts import accounts_bp
        from .routes.incomes import incomes_bp
        from .routes.services import services_bp
        from .routes.loans import loans_bp
        from .routes.service_payments import service_payments_bp
        from .routes.loan_payments import loan_payments_bp
        from .routes.scheduled_incomes import scheduled_incomes_bp

        # Registra cada blueprint con un prefijo de URL
        app.register_blueprint(auth_bp, url_prefix='/api/auth')
        app.register_blueprint(accounts_bp, url_prefix='/api/accounts')
        app.register_blueprint(incomes_bp, url_prefix='/api/incomes')
        app.register_blueprint(services_bp, url_prefix='/api/services')
        app.register_blueprint(loans_bp, url_prefix='/api/loans')
        app.register_blueprint(service_payments_bp, url_prefix='/api/service_payments')
        app.register_blueprint(loan_payments_bp, url_prefix='/api/loan_payments')
        app.register_blueprint(scheduled_incomes_bp, url_prefix='/api/scheduled_incomes')

        return app