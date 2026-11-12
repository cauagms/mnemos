from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import Base


class AlternativaModel(Base):
    __tablename__ = "alternativas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    quiz_id = Column(
        Integer,
        ForeignKey("quizzes.id"),
        nullable=False,
        index=True,
    )

    texto = Column(String(255), nullable=False)
    correta = Column(Boolean, nullable=False, default=False)
    explicacao = Column(String(500), nullable=True)

    quiz = relationship("QuizModel", back_populates="alternativas")