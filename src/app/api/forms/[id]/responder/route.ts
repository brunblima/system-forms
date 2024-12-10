import { NextResponse } from "next/server";
import { db } from "@/services/database/db";
import { auth } from "@/services/auth/auth";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    // Autenticação opcional
    const session = await auth();
    const respondentId = session?.user?.id || "anonymous"; // Define um ID padrão para anônimos

    // Obtendo o ID do formulário
    const formId = params.id;

    // Verificando se o formulário existe
    const form = await db.form.findUnique({
      where: { id: formId },
      include: { questions: true },
    });

    if (!form) {
      return NextResponse.json(
        { message: "Formulário não encontrado." },
        { status: 404 },
      );
    }

    const responses = await req.json();

    // Validação das respostas
    const missingAnswers = form.questions.filter(
      (question) => question.isRequired && !responses[question.id],
    );

    if (missingAnswers.length > 0) {
      return NextResponse.json(
        {
          message: "Respostas obrigatórias ausentes.",
          missingQuestions: missingAnswers.map((q) => q.title),
        },
        { status: 400 },
      );
    }

    // Criando uma nova resposta geral (Response)
    const newResponse = await db.response.create({
      data: {
        formId,
        respondentId,
        answers: {
          create: Object.entries(responses).map(([questionId, answer]) => {
            const question = form.questions.find((q) => q.id === questionId);

            if (!question) {
              throw new Error(`Pergunta com ID ${questionId} não encontrada.`);
            }

            // Diferenciando o tipo de resposta com base no tipo da pergunta
            const answerData: any = {};
            if (typeof answer === "string") {
              if (question.type === "short" || question.type === "long") {
                answerData.answerText = answer;
              } else if (question.type === "multiple") {
                answerData.answerOption = answer;
              }
            } else if (Array.isArray(answer)) {
              if (question.type === "checkbox") {
                answerData.answerOption = JSON.stringify(answer); // Salva múltiplas opções como JSON
              }
            } else if (
              typeof answer === "object" &&
              answer.latitude &&
              answer.longitude
            ) {
              if (question.type === "location") {
                answerData.answerLocation = `${answer.latitude}, ${answer.longitude}`;
              }
            } else if (question.type === "file" && typeof answer === "string") {
              answerData.answerImage = answer; // Supondo que o frontend envia o caminho da imagem
            } else if (question.allowImage && answer?.imageData) {
              answerData.answerImage = answer.imageData;
            }

            return {
              questionId,
              ...answerData,
            };
          }),
        },
      },
    });

    return NextResponse.json(
      {
        message: "Respostas salvas com sucesso.",
        responseId: newResponse.id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao salvar respostas:", error);
    return NextResponse.json(
      { message: "Erro ao salvar respostas.", error: error.message },
      { status: 500 },
    );
  }
}
