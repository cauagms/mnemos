from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.disciplina_model import DisciplinaModel, TopicoModel
from app.schemas.disciplina_schema import DisciplinaCreate, TopicoCreate, TopicoResponse

router = APIRouter(prefix="/disciplinas", tags=["Disciplinas"])


@router.post("", status_code=status.HTTP_201_CREATED)
def criar_disciplina(
    dados: DisciplinaCreate,
    db: Session = Depends(get_db)
):
    nova_disciplina = DisciplinaModel(
        usuario_id=dados.usuario_id,
        nome=dados.nome,
        descricao=dados.descricao
    )

    db.add(nova_disciplina)
    db.commit()
    db.refresh(nova_disciplina)

    return {
        "mensagem": "Disciplina criada com sucesso!",
        "disciplina": nova_disciplina
    }

@router.get("")
def listar_disciplinas(db: Session = Depends(get_db)):
    disciplinas = db.query(DisciplinaModel).all()
    print(disciplinas)
    return {
        "disciplinas": [
            {
                "id": disciplina.id,
                "usuario_id": disciplina.usuario_id,
                "nome": disciplina.nome,
                "descricao": disciplina.descricao,
                "criado_em": disciplina.criado_em
            }
            for disciplina in disciplinas
        ]
    }


@router.post(
    "/{disciplina_id}/topicos",
    status_code=status.HTTP_201_CREATED,
)
def criar_topico(
    disciplina_id: int,
    dados: TopicoCreate,
    db: Session = Depends(get_db),
):
    disciplina = (
        db.query(DisciplinaModel)
        .filter(DisciplinaModel.id == disciplina_id)
        .first()
    )

    if not disciplina:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Disciplina não encontrada.",
        )

    novo_topico = TopicoModel(
        nome=dados.nome,
        disciplina_id=disciplina_id,
        formato=dados.formato
    )

    db.add(novo_topico)
    db.commit()
    db.refresh(novo_topico)

    return {
        "mensagem": "Tópico criado com sucesso!",
        "topico": novo_topico,
        "formato": dados.formato,
    }


@router.get(
    "/{disciplina_id}/topicos",
    status_code=status.HTTP_200_OK,
    response_model=list[TopicoResponse],
)
def listar_topicos(
    disciplina_id: int,
    db: Session = Depends(get_db),
):
    disciplina = (
        db.query(DisciplinaModel)
        .filter(DisciplinaModel.id == disciplina_id)
        .first()
    )

    if not disciplina:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Disciplina não encontrada.",
        )

    topicos = (
        db.query(TopicoModel)
        .filter(TopicoModel.disciplina_id == disciplina_id)
        .all()
    )

    return topicos


#Fazer Deletar disciplina (lembrar de colocar um "Tem Certeza?" no Front)

#Fazer o Editar Disciplina