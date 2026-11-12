from fastapi import FastAPI
from app.api.v1.routers import disciplina_router, arquivo_router, user_router, auth_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Mnemos API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.1:4200",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir os routers na aplicação
app.include_router(disciplina_router.router, prefix="/api/v1", tags=["Disciplinas"])
app.include_router(arquivo_router.router, prefix="/api/v1", tags=["Arquivos"])
app.include_router(user_router.router, prefix='/api/v1', tags=["Usuarios"])
app.include_router(auth_router.router, prefix='/api/v1', tags=['Auth'])

@app.get("/")
def read_root():
    return {"message": "Bem-vindo ao Mnemos!"}
@app.get("/test-db")
def test_db():
    from app.core.db import get_db
    db = next(get_db())
    print(db)
    return {"message": "Conexão com o banco de dados estabelecida com sucesso!"}
