import { NextResponse } from "next/server";
import { db } from "@/services/database/db";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { title, description, questions } = body;

    // Validação básica
    if (!title || !Array.isArray(questions)) {
      return NextResponse.json(
        { message: "Título e perguntas são obrigatórios." },
        { status: 400 }
      );
    }

    // Obter as IDs das perguntas enviadas pelo frontend
    const questionIdsFromFrontend = questions
      .filter((q: any) => q.id)
      .map((q: any) => q.id);

    console.log("Question IDs from frontend:", questionIdsFromFrontend);

    // Remover perguntas que não estão no payload do frontend
    await db.question.deleteMany({
      where: {
        formId: id,
        NOT: {
          id: { in: questionIdsFromFrontend },
        },
      },
    });

    // Obter as perguntas existentes no banco para validação
    const existingQuestions = await db.question.findMany({
      where: {
        formId: id,
        id: { in: questionIdsFromFrontend },
      },
      select: { id: true },
    });

    const existingQuestionIds = new Set(existingQuestions.map((q) => q.id));
    console.log("Existing question IDs in DB:", Array.from(existingQuestionIds));

    // Atualizar ou criar as perguntas enviadas
    for (const question of questions) {
      if (question.id && existingQuestionIds.has(question.id)) {
        // Atualizar pergunta existente
        console.log(`Updating question with ID: ${question.id}`);
        await db.question.update({
          where: { id: question.id },
          data: {
            title: question.title,
            type: question.type,
            isRequired: question.isRequired,
            allowImage: question.allowImage,
            order: question.order,
            options: question.options || [], // Array simples, sem set
          },
        });
      } else {
        // Criar nova pergunta
        console.log(`Creating new question: ${question.title}`);
        await db.question.create({
          data: {
            id: question.id && !existingQuestionIds.has(question.id) ? undefined : question.id,
            title: question.title,
            type: question.type,
            isRequired: question.isRequired,
            allowImage: question.allowImage,
            order: question.order,
            options: question.options || [], // Array simples
            formId: id,
          },
        });
      }
    }

    // Atualizar o formulário com título e descrição
    const updatedForm = await db.form.update({
      where: { id },
      data: {
        title,
        description,
      },
    });

    return NextResponse.json(updatedForm, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar o formulário:", error);
    return NextResponse.json(
      { message: "Erro ao atualizar o formulário", error: String(error) },
      { status: 500 }
    );
  }
}