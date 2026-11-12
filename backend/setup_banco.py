"""Script para reinicializar banco com todos os modelos carregados"""

# Importa TODOS os modelos ANTES de criar as tabelas
from app.models.usuario_model import UsuarioModel
from app.models.disciplina_model import DisciplinaModel, TopicoModel
from app.models.arquivo_model import ArquivoModel, DocumentoChunkModel

# Agora cria as tabelas
from app.core.db import Base, engine

print("Criando todas as tabelas...")
Base.metadata.create_all(bind=engine)
print("✅ Todas as tabelas criadas com sucesso!")

# Agora cria o usuário de teste
from app.core.db import SessionLocal

db = SessionLocal()

# Verifica se usuário já existe
usuario_existente = db.query(UsuarioModel).filter(UsuarioModel.email == "teste@mnemos.com").first()

if usuario_existente:
    print(f"✅ Usuário já existe: ID {usuario_existente.id}")
else:
    # Cria novo usuário
    novo_usuario = UsuarioModel(
        email="teste@mnemos.com",
        nome="Aluno Teste"
    )
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    print(f"✅ Usuário criado com sucesso: ID {novo_usuario.id}")

db.close()
