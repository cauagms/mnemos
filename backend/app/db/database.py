
# Importa ferramentas para acessar caminhos de arquivos.
from pathlib import Path

# Lê as variáveis definidas no arquivo .env.
from dotenv import load_dotenv

# Lê variáveis de ambiente.
import os

# Ferramentas de conexão do SQLAlchemy.
from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import declarative_base, sessionmaker


# Caminho da pasta backend.
# database.py fica em backend/app/db/.
BACKEND_DIR = Path(__file__).resolve().parents[2]

# Carrega as configurações de backend/.env.
load_dotenv(BACKEND_DIR / ".env")


# Lê as configurações do MySQL.
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_USER = os.getenv("DB_USER","root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "123mudar")
DB_NAME = os.getenv("DB_NAME", "mnemos")


# Verifica se as credenciais necessárias foram configuradas.
if not DB_USER or DB_PASSWORD is None:
    raise RuntimeError(
        "Configure DB_USER e DB_PASSWORD no arquivo .env"
    )


# Monta o endereço de conexão com o MySQL.
# URL.create trata corretamente senhas com caracteres especiais.
DATABASE_URL = URL.create(
    drivername="mysql+pymysql",
    username=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST,
    port=DB_PORT,
    database=DB_NAME,
    query={"charset": "utf8mb4"},
)


# Cria o mecanismo que gerencia as conexões.
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)


# Cria uma sessão para executar consultas no banco.
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# Base que os Models do SQLAlchemy utilizarão.
Base = declarative_base()


# Fornece uma sessão para as rotas do FastAPI.
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        # Fecha a sessão mesmo quando ocorre um erro.
        db.close()
