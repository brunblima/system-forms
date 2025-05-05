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

    const formData = await req.formData();
    const responses = JSON.parse(formData.get("responses") as string);

    // Processar respostas
    const formattedAnswers = await Promise.all(
      form.questions.map(async (question) => {
        const response = responses[question.id];
        if (!response) return null;

        const { text, latitude, longitude } = response;
        const image = formData.get(`image-${question.id}`) as File | null;
        const answerData: any = {};

        if (question.isRequired && !text && !image && !latitude && !longitude) {
          throw new Error(`A pergunta "${question.title}" é obrigatória.`);
        }

        if (question.type === "image" || (question.allowImage && image)) {
          if (image) {
            const arrayBuffer = await image.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64Image = `data:${image.type};base64,${buffer.toString("base64")}`;
            try {
              const uploadResult = await cloudinary.uploader.upload(base64Image, {
                folder: "form_uploads",
              });
              answerData.answerImage = uploadResult.secure_url;
            } catch (error) {
              console.error(`Erro ao fazer upload da imagem:`, error);
              throw new Error(`Falha ao processar a imagem para "${question.title}".`);
            }
          } else if (question.type === "image") {
            throw new Error(`Uma imagem é necessária para "${question.title}".`);
          }
        }

        if (question.type === "date") {
          if (text && text.trim()) {
            answerData.answerText = text;
          } else if (question.isRequired) {
            throw new Error(`Uma data é necessária para "${question.title}".`);
          }
        }

        if (["short", "long"].includes(question.type)) {
          if (text && text.trim()) {
            answerData.answerText = text;
          } else if (question.isRequired) {
            throw new Error(`Uma resposta é necessária para "${question.title}".`);
          }
        }

        if (["checkbox", "multiple"].includes(question.type)) {
          if (text) {
            answerData.answerText = Array.isArray(text) ? JSON.stringify(text) : text;
          } else if (question.isRequired) {
            throw new Error(`Uma seleção é necessária para "${question.title}".`);
          }
        }

        if (question.type === "location") {
          if (latitude !== null && longitude !== null) {
            answerData.answerLocation = JSON.stringify({ latitude, longitude });
          } else if (question.isRequired) {
            throw new Error(`Uma localização é necessária para "${question.title}".`);
          }
        }

        return { questionId: question.id, ...answerData };
      })
    );

    // Criar nova resposta no banco
    const newResponse = await db.response.create({
      data: {
        formId,
        respondentId: "anonymous",
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