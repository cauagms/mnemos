from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.models.item_estudo_model import ItemEstudoModel


class QuizModel(ItemEstudoModel):
    __tablename__ = "quizzes"

    id = Column(
        Integer,
        ForeignKey("itens_estudo.id"),
        primary_key=True,
    )

    pergunta = Column(String(255), nullable=False)

    alternativas = relationship(
        "AlternativaModel",
        back_populates="quiz",
        cascade="all, delete-orphan",
    )

    __mapper_args__ = {
        "polymorphic_identity": "quiz",
    }