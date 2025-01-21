import { NextResponse } from "next/server";
import { db } from "@/services/database/db";
import cloudinary from "@/services/cloudinary/config";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const formId = params.id;

    // Buscar formulário e perguntas relacionadas
    const form = await db.form.findUnique({
      where: { id: formId },
      include: { questions: true },
    });

    if (!form) {
      return NextResponse.json(
        { message: "Formulário não encontrado." },
        { status: 404 }
      );
    }

    const responses = await req.json();

    // Processar respostas
    const formattedAnswers = await Promise.all(
      form.questions.map(async (question) => {
        const response = responses[question.id];
        if (!response) return null;

        const { text, image, latitude, longitude } = response;
        const answerData: any = {};

        if (question.type === "checkbox" || question.type === "multiple") {
          answerData.answerText = text; // String com valores separados por vírgula
        } else if (typeof text === "string") {
          answerData.answerText = text;
        }
        // Upload da imagem, se aplicável
        if (image && question.allowImage) {
          try {
            const uploadResult = await cloudinary.uploader.upload(image, {
              folder: "form_uploads",
            });
            answerData.answerImage = uploadResult.secure_url;
          } catch (error) {
            console.error(`Erro ao fazer upload da imagem:`, error);
            throw new Error(
              `Falha ao processar a imagem para a pergunta "${question.title}".`
            );
          }
        }

        // Adicionar texto ou localização, se aplicável
        if (typeof text === "string") {
          answerData.answerText = text;
        } else if (latitude !== undefined && longitude !== undefined) {
          answerData.answerLocation = JSON.stringify({ latitude, longitude });
        }

        // Verificar tipos específicos de perguntas
        switch (question.type) {
          case "location":
            if (!answerData.answerLocation) {
              throw new Error(
                `Uma localização válida é necessária para a pergunta "${question.title}".`
              );
            }
            break;

          case "image":
            if (!answerData.answerImage) {
              throw new Error(
                `Uma imagem é necessária para a pergunta "${question.title}".`
              );
            }
            break;

          default:
            if (
              !answerData.answerText &&
              !answerData.answerImage &&
              !answerData.answerLocation
            ) {
              throw new Error(
                `Uma resposta válida é necessária para "${question.title}".`
              );
            }
            break;
        }

        return { questionId: question.id, ...answerData };
      })
    );

    // Criar nova resposta no banco
    const newResponse = await db.response.create({
      data: {
        formId,
        respondentId: "anonymous", // Usuário não autenticado
        answers: { create: formattedAnswers.filter(Boolean) },
      },
    });

    return NextResponse.json(
      { message: "Respostas salvas com sucesso.", responseId: newResponse.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao salvar respostas:", error);
    return NextResponse.json(
      { message: "Erro ao salvar respostas." },
      { status: 500 }
    );
  }
}
