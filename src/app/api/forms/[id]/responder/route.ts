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

        // Validar tipos específicos de perguntas
        if (question.type === "image") {
          if (!image) {
            throw new Error(
              `Uma imagem é necessária para a pergunta "${question.title}".`
            );
          }

          try {
            // Upload da imagem para o Cloudinary
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
        } else if (question.allowImage && image) {
          // Se `allowImage` for verdadeiro e uma imagem foi enviada, fazer upload
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

        // Tratar outros tipos de respostas
        if (["short", "long", "checkbox", "multiple"].includes(question.type)) {
          if (!text || text.trim() === "") {
            throw new Error(
              `Uma resposta de texto é necessária para a pergunta "${question.title}".`
            );
          }
          answerData.answerText = text;
        }

        if (question.type === "location") {
          if (latitude === null || longitude === null) {
            throw new Error(
              `Uma localização válida é necessária para a pergunta "${question.title}".`
            );
          }
          answerData.answerLocation = JSON.stringify({ latitude, longitude });
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
  } catch (error: any) {
    console.error("Erro ao salvar respostas:", error);
    return NextResponse.json(
      { message: `Erro ao salvar respostas: ${error.message}` },
      { status: 500 }
    );
  }
}
