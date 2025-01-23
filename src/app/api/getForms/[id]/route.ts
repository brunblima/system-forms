import { NextRequest, NextResponse } from "next/server";
import { db } from "@/services/database/db";
import { auth } from "@/services/auth/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formId = params.id;

    if (!formId) {
      return NextResponse.json(
        { error: "ID do formulário não foi fornecido" },
        { status: 400 }
      );
    }

    // Busca o formulário específico do usuário
    const form = await db.form.findFirst({
      where: {
        id: formId, // Apenas verifica o ID do formulário
      },
      include: {
        questions: {
          orderBy: {
            order: "asc", // Garante que as perguntas sejam ordenadas pela coluna "order"
          },
        },
      },
    });

    if (!form) {
      return NextResponse.json(
        { error: "Formulário não encontrado" },
        { status: 404 }
      );
    }

    // Verifica se as perguntas estão na ordem correta (de 0 em diante)
    const isOrdered = form.questions.every(
      (question, index) => question.order === index
    );

    if (!isOrdered) {
      return NextResponse.json(
        {
          error:
            "As perguntas do formulário não seguem a sequência esperada (de 0 em diante)",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
