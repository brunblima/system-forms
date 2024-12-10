import { NextResponse } from "next/server";
import { db } from "@/services/database/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const form = await db.form.findUnique({
      where: { id },
      include: {
        questions: true, 
        responses: {
          include: {
            answers: true,
          },
        },
      },
    });

    if (!form) {
      return NextResponse.json(
        { error: "Formulário não encontrado." },
        { status: 404 }
      );
    }

    const mappedResponses = form.responses.map((response) => {
      const responseData: { [key: string]: any } = {
        id: response.id,
        date: response.submittedAt.toISOString(),
      };

      response.answers.forEach((answer) => {
        if (answer.answerText)
          responseData[answer.questionId] = answer.answerText;
        if (answer.answerImage)
          responseData[answer.questionId] = answer.answerImage;
        if (answer.answerOption)
          responseData[answer.questionId] = answer.answerOption;
        if (answer.answerLocation)
          responseData[answer.questionId] = answer.answerLocation;
      });

      return responseData;
    });

    // Estrutura final dos dados retornados
    const responseData = {
      id: form.id,
      title: form.title,
      questions: form.questions.map((q) => ({
        id: q.id,
        title: q.title,
        type: q.type,
      })),
      responses: mappedResponses,
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Erro ao buscar os dados do formulário:", error);
    return NextResponse.json(
      { error: "Erro ao buscar os dados do formulário." },
      { status: 500 }
    );
  }
}
