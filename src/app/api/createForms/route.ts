import { NextResponse } from "next/server";
import { db } from "@/services/database/db";
import { auth } from "@/services/auth/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: "Usuário não autenticado." },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { title, description, questions } = body;

    // Validação básica
    if (!title || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { message: "Campos obrigatórios faltando." },
        { status: 400 },
      );
    }

    console.log("Dados recebidos no servidor:", JSON.stringify(body, null, 2));

    // Criação do formulário no banco
    const newForm = await db.form.create({
      data: {
        title,
        description: description || null,
        creatorId: session.user.id,
        questions: {
          create: questions.map((question: any, index: number) => ({
            title: question.title.trim(),
            type: question.type,
            isRequired: question.isRequired || false,
            allowImage: question.allowImage || false,
            order: question.order || index,
            options: question.options?.length ? question.options : null,
          })),
        },
      },
    });

    console.log("Formulário criado com sucesso:", newForm);

    return NextResponse.json(
      { message: "Formulário criado com sucesso.", id: newForm.id },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao criar formulário:", error);
    return NextResponse.json(
      { message: "Erro ao criar formulário.", error: String(error) },
      { status: 500 },
    );
  }
}
