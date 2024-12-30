import { NextResponse } from "next/server";
import { db } from "@/services/database/db";
import { auth } from "@/services/auth/auth";
import cloudinary from "@/services/cloudinary/config";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const respondentId = session?.user?.id || "anonymous";
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
    
        const { text, image } = response;
        const answerData: any = {};
    
        // Upload da imagem, se aplicável
        if (image) {
          try {
            const uploadResult = await cloudinary.uploader.upload(image, {
              folder: "form_uploads",
            });
            answerData.answerImage = uploadResult.secure_url;
          } catch (error) {
            console.error(`Erro ao fazer upload da imagem: ${error.message}`);
            throw new Error(`Falha ao processar a imagem para a pergunta "${question.title}".`);
          }
        }
    
        // Adicionar texto, se aplicável
        if (text) {
          answerData.answerText = text;
        }
    
        // Verificar tipos específicos de perguntas
        switch (question.type) {
          case "image":
            if (!answerData.answerImage) {
              throw new Error(`Uma imagem é necessária para a pergunta "${question.title}".`);
            }
            break;
    
          default:
            if (!answerData.answerText && !answerData.answerImage) {
              if (question.type === "image" && !answerData.answerImage) {
                throw new Error(`Uma imagem é necessária para a pergunta "${question.title}".`);
              }
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
        respondentId,
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
      { message: error.message || "Erro ao salvar respostas." },
      { status: 500 }
    );
  }
}
