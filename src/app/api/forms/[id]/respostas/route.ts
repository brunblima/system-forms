// API para retornar respostas do banco de dados
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

      form.questions.forEach((question) => {
        const answer = response.answers.find(
          (a) => a.questionId === question.id
        );

        if (!answer) {
          responseData[question.id] = "Não respondido";
          return;
        }

        if (question.type === "image") {
          responseData[question.id] = answer.answerImage || "Não respondido";
        } else if (question.type === "location") {
          responseData[question.id] = {
            location: answer.answerLocation || "Não foi respondido com localização",
            image: answer.answerImage || "Não foi respondido com imagem",
          };
        } else {
          responseData[question.id] = {
            text: answer.answerText || "Não respondido com texto",
            image: question.allowImage
              ? answer.answerImage || "Não foi respondido com imagem"
              : undefined,
          };
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
  } catch (error: any) {
    console.error("Erro ao buscar os dados do formulário:", error);
    return NextResponse.json(
      { error: "Erro ao buscar os dados do formulário." },
      { status: 500 }
    );
  }
}
