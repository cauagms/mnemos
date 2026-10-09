"""
Configuração de banco de dados: engine SQLAlchemy, sessões e declaração de modelos.

Fluxo:
1. Carrega URL do BD de .env (DATABASE_URL)
2. Cria engine com pool de conexões
3. Define factory SessionLocal para cada requisição
4. Exporta Base para herança de modelos
5. Fornece get_db() como dependência FastAPI para injetar sessão nas rotas
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import QueuePool
import os
from dotenv import load_dotenv

# Carrega variáveis de .env
load_dotenv()

# URL da conexão MySQL
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:senha@localhost:3306/mnemos"
)

# Engine: cria pool de conexões e configura comportamento
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,  # Gerencia pool de conexões (reutiliza)
    pool_size=5,          # Máximo 5 conexões simultaneamente
    max_overflow=10,      # Pode criar até 10 conexões adicionais se necessário
    pool_pre_ping=True,   # Testa conexão antes de usar (evita "gone away")
    echo=False,           # echo=True para ver SQL no console (debugar)
)

# SessionLocal: factory que cria uma nova sessão por requisição
SessionLocal = sessionmaker(
    autocommit=False,    # Exige commit() explícito
    autoflush=False,     # Não flush automático (mais controle)
    bind=engine,         # Vinculado a este engine
)

# Base: classe mãe de todos os modelos (ORM mapping)
Base = declarative_base()


def get_db():
    """
    Dependência FastAPI: fornece sessão ao endpoint.
    
    Uso em rotas:
        @router.get("/disciplinas")
        def listar(db: Session = Depends(get_db)):
            disciplinas = db.query(DisciplinaModel).all()
            return disciplinas
    
    FastAPI:
    1. Chama get_db() antes de processar a rota
    2. Injecta 'db' no endpoint
    3. Após a rota retornar, fecha a sessão (finally)
    """
    db = SessionLocal()
    try:
        yield db  # Fornece ao endpoint
    finally:
        db.close()  # Limpa conexão (volta ao pool ou fecha)


def init_db():
    """
    Cria todas as tabelas no BD (baseado nos modelos).
    
    Executar uma única vez após definir os modelos:
        python -c "from app.core.db import init_db; init_db()"
    """
    Base.metadata.create_all(bind=engine)
