from fastapi import FastAPI

app = FastAPI(title="Mnemos API")


@app.get("/")
def read_root():
    return {"status": "Mnemos API rodando"}