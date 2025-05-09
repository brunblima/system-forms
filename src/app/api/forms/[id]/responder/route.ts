import { NextResponse } from "next/server";
import { db } from "@/services/database/db";
import cloudinary from "@/services/cloudinary/config";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const formId = params.id;
    // Buscar formulário e perguntas
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

    const formattedAnswers = await Promise.all(
      form.questions.map(async (question) => {
        const resp = responses[question.id];
        if (!resp) return null;

        const answerData: any = {};
        const { text, latitude, longitude } = resp;

        // Processar imagem
        const imageFile = formData.get(`image-${question.id}`) as File | null;
        if (imageFile) {
          const buffer = Buffer.from(await imageFile.arrayBuffer());
          const base64 = `data:${imageFile.type};base64,${buffer.toString(
            "base64"
          )}`;
          try {
            const uploadResult = await cloudinary.uploader.upload(base64, {
              folder: "form_uploads",
            });
            answerData.answerImage = uploadResult.secure_url;
          } catch (err) {
            console.error("Erro ao fazer upload da imagem:", err);
            throw new Error(
              `Falha ao processar a imagem de "${question.title}".`
            );
          }
        }

        // Processar texto e outros tipos
        if (["short", "long", "checkbox", "multiple"].includes(question.type)) {
          if (text && text.toString().trim()) {
            answerData.answerText = Array.isArray(text)
              ? JSON.stringify(text)
              : text.toString();
          } else if (question.isRequired) {
            throw new Error(
              `A resposta para "${question.title}" é obrigatória.`
            );
          }
        }

        if (question.type === "date") {
          if (text) {
            answerData.answerText = text;
          } else if (question.isRequired) {
            throw new Error(`A data para "${question.title}" é obrigatória.`);
          }
        }

        if (question.type === "location") {
          if (latitude != null && longitude != null) {
            answerData.answerLocation = JSON.stringify({ latitude, longitude });
          } else if (question.isRequired) {
            throw new Error(
              `A localização para "${question.title}" é obrigatória.`
            );
          }
        }

        return { questionId: question.id, ...answerData };
      })
    );

    // Salvar no banco
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
