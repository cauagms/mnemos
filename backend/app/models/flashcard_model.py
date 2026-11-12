from sqlalchemy import Column, Integer, String, ForeignKey

from app.models.item_estudo_model import ItemEstudoModel


class FlashcardModel(ItemEstudoModel):
    __tablename__ = "flashcards"

    id = Column(
        Integer,
        ForeignKey("itens_estudo.id"),
        primary_key=True,
    )

    pergunta = Column(String(255), nullable=False)
    resposta = Column(String(255), nullable=False)

    __mapper_args__ = {
        "polymorphic_identity": "flashcard",
    }

    def descartar(self):
        # A implementação da regra de descarte será definida
        # na camada de serviços, conforme os requisitos do Mnemos.
        pass