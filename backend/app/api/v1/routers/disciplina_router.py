from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.db import get_db
from app.models.disciplina_model import DisciplinaModel, TopicoModel
from app.schemas.disciplina_schema import DisciplinaCreate, TopicoCreate

router = APIRouter(prefix="/disciplinas", tags=["Disciplinas"])

@router.post("", status_code=status.HTTP_201_CREATED)
def criar_disciplina(dados: DisciplinaCreate, db: Session = Depends(get_db)):
    nova_disciplina = DisciplinaModel(nome=dados.nome, descricao=dados.descricao)
    db.add(nova_disciplina)
    db.commit()
    db.refresh(nova_disciplina)
    return {"mensagem": "Disciplina criada com sucesso!", "disciplina": nova_disciplina}

@router.get("", response_model=List[dict])
def listar_disciplinas(db: Session = Depends(get_db)):
    disciplinas = db.query(DisciplinaModel).all()
    return disciplinas

@router.post("/{disciplina_id}/topicos", status_code=status.HTTP_201_CREATED)
def criar_topico(disciplina_id: int, dados: TopicoCreate, db: Session = Depends(get_db)):
    disciplina = db.query(DisciplinaModel).filter(DisciplinaModel.id == disciplina_id).first()
    if not disciplina:
        raise HTTPException(status_code=404, detail="Disciplina não encontrada.")
    
    novo_topico = TopicoModel(nome=dados.nome, disciplina_id=disciplina_id)
    db.add(novo_topico)
    db.commit()
    db.refresh(novo_topico)
    return {"mensagem": "Tópico criado com sucesso!", "topico": novo_topico}
    