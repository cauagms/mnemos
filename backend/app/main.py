from fastapi import FastAPI
from app.api.v1.routers import disciplina_router, arquivo_router

app = FastAPI(title="Mnemos API", version="0.1.0")

# Incluir os routers na aplicação
app.include_router(disciplina_router.router, prefix="/api/v1", tags=["Disciplinas"])
app.include_router(arquivo_router.router, prefix="/api/v1", tags=["Arquivos"])

@app.get("/")
def read_root():
    return {"message": "Bem-vindo ao Mnemos!"}


