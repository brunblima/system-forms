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
        questions: { orderBy: { order: "asc" } },
        responses: { include: { answers: true } },
      },
    });

    if (!form) {
      return NextResponse.json({ error: "Formulário não encontrado." }, { status: 404 });
    }

    const mappedResponses = form.responses.map((response) => {
      const responseData: FormResponse = {
        id: response.id,
        date: response.submittedAt.toISOString(),
        answers: {},
      };

      form.questions.forEach((question) => {
        const answer = response.answers.find((a) => a.questionId === question.id);
        responseData.answers[question.id] = {};

        if (!answer) {
          responseData.answers[question.id] = { text: "Não respondido" };
          if (question.allowImage || question.type === "image") {
            responseData.answers[question.id].image = "Sem imagem";
          }
          return;
        }

        if (["short", "long", "date"].includes(question.type)) {
          responseData.answers[question.id].text = answer.answerText || "Não respondido";
          if (question.allowImage) {
            responseData.answers[question.id].image = answer.answerImage || "Sem imagem";
          }
        } else if (question.type === "location") {
          responseData.answers[question.id].location = answer.answerLocation || "Sem localização";
          responseData.answers[question.id].image = answer.answerImage || "Sem imagem";
        } else if (["checkbox", "multiple"].includes(question.type)) {
          responseData.answers[question.id].text = answer.answerText || "Nenhuma opção selecionada";
          if (question.allowImage) {
            responseData.answers[question.id].image = answer.answerImage || "Sem imagem";
          }
        } else if (question.type === "image") {
          responseData.answers[question.id].image = answer.answerImage || "Sem imagem";
        }
      });

      return responseData;
    });

    const responseData = {
      id: form.id,
      title: form.title,
      questions: form.questions.map((q) => ({
        id: q.id,
        title: q.title,
        type: q.type,
        allowImage: q.allowImage,
        isRequired: q.isRequired,
        options: q.options,
      })),
      responses: mappedResponses,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Erro ao buscar respostas:", error);
    return NextResponse.json({ error: "Erro ao buscar respostas." }, { status: 500 });
  }
}

interface FormResponse {
  id: string;
  date: string;
  answers: Record<string, { text?: string; image?: string; location?: string }>;
}