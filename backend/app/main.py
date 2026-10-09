from fastapi import FastAPI
from app.api.v1.routers import disciplina_router  # Certifica-te de importar o teu router

app = FastAPI(title="Mnemos API", version="0.1.0")

# Incluir o router na aplicação
app.include_router(disciplina_router.router, prefix="/api/v1", tags=["Disciplinas"])

@app.get("/")
def read_root():
    return {"message": "Bem-vindo ao Mnemos!"}


