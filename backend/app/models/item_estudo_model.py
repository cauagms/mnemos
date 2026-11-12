from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    Date,
    ForeignKey,
)
from sqlalchemy.orm import relationship

from app.db.database import Base


class ItemEstudoModel(Base):
    __tablename__ = "itens_estudo"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    topico_id = Column(
        Integer,
        ForeignKey("topicos.id"),
        nullable=False,
        index=True,
    )

    dificuldade = Column(Float, nullable=True)
    estabilidade = Column(Float, nullable=True)
    probabilidade = Column(Float, nullable=True)
    proxima_revisao = Column(Date, nullable=True)

    status = Column(String(30), nullable=True)
    nivel_complexidade = Column(String(30), nullable=True)

    # Indica qual subtipo será carregado pelo SQLAlchemy.
    tipo = Column(String(30), nullable=False)

    topico = relationship("TopicoModel", back_populates="itens_estudo")

    historicos = relationship(
        "HistoricoRevisaoModel",
        back_populates="item_estudo",
        cascade="all, delete-orphan",
    )

    __mapper_args__ = {
        "polymorphic_on": tipo,
        "polymorphic_abstract": True,
    }