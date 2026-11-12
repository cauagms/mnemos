from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    DateTime,
    ForeignKey,
    func,
)
from sqlalchemy.orm import relationship

from app.db.database import Base


class HistoricoRevisaoModel(Base):
    __tablename__ = "historico_revisoes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    item_estudo_id = Column(
        Integer,
        ForeignKey("itens_estudo.id"),
        nullable=False,
        index=True,
    )

    tempo_resposta = Column(Float, nullable=True)
    nota = Column(Float, nullable=True)
    resposta = Column(String(500), nullable=True)

    data_revisao = Column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )

    item_estudo = relationship(
        "ItemEstudoModel",
        back_populates="historicos",
    )