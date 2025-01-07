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
          // Caso nenhuma resposta tenha sido fornecida
          responseData[question.id] = "Não respondido";
          return;
        }

        // Tratamento para perguntas do tipo "image"
        if (question.type === "image") {
          if (answer.answerImage) {
            responseData[question.id] = {
              image: answer.answerImage,
            };
          } else {
            responseData[question.id] = "Não foi respondido com uma imagem";
          }
        }

        // Tratamento para perguntas "long" ou "short" com allowImage
        else if (["long", "short"].includes(question.type)) {
          const textResponse =
            answer.answerText || "Não foi respondido com texto";

          if (question.allowImage) {
            const imageResponse =
              answer.answerImage || "Não foi respondido a imagem";
            responseData[question.id] = {
              text: textResponse,
              image: imageResponse,
            };
          } else {
            responseData[question.id] = textResponse;
          }
        }

        // Tratamento para perguntas "localização"
        else if (question.type === "location" && question.allowImage) {
          responseData[question.id] = {
            text: answer.answerText || "Não foi respondido com texto",
            image: answer.answerImage || "Não foi respondido a imagem",
          };
        }

        // Tratamento para outros tipos de perguntas
        else {
          if (answer.answerText) {
            responseData[question.id] = answer.answerText;
          } else if (answer.answerOption) {
            responseData[question.id] = answer.answerOption;
          } else {
            responseData[question.id] = "não respondido";
          }
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
