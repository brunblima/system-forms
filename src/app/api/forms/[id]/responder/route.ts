import { NextResponse } from "next/server";
import { db } from "@/services/database/db";
import { auth } from "@/services/auth/auth";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    const respondentId = session?.user?.id || "anonymous";

    const formId = params.id;

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

    const formattedAnswers = form.questions.map((question) => {
      const answer = responses[question.id];
    
      // Ignorar validação se a pergunta não for obrigatória e estiver vazia
      if (!question.isRequired && !answer) {
        return null; // Não criar registro para perguntas não respondidas
      }
    
      const answerData: any = {};
      switch (question.type) {
        case "short":
        case "long":
          answerData.answerText = typeof answer === "string" ? answer : null;
          break;
        case "multiple":
          answerData.answerOption = typeof answer === "string" ? answer : null;
          break;
        case "checkbox":
          answerData.answerOption = Array.isArray(answer)
            ? JSON.stringify(answer)
            : null;
          break;
        case "location":
          if (
            typeof answer === "object" &&
            answer.latitude &&
            answer.longitude
          ) {
            answerData.answerLocation = `${answer.latitude},${answer.longitude}`;
          }
          break;
        case "file":
          answerData.answerImage = typeof answer === "string" ? answer : null;
          break;
        default:
          throw new Error(`Tipo de pergunta não suportado: ${question.type}.`);
      }
    
      // Validar apenas perguntas obrigatórias ou com respostas fornecidas
      if (
        question.isRequired &&
        !answerData.answerText &&
        !answerData.answerOption &&
        !answerData.answerImage &&
        !answerData.answerLocation
      ) {
        throw new Error(`Resposta inválida para a pergunta "${question.title}".`);
      }
    
      return { questionId: question.id, ...answerData };
    }).filter(Boolean); // Remove as perguntas não respondidas
    

    const newResponse = await db.response.create({
      data: {
        formId,
        respondentId,
        answers: { create: formattedAnswers },
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
