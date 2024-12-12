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

    // Atualize o formulário no banco de dados
    const updatedForm = await db.form.update({
      where: { id },
      data: {
        title,
        description,
        questions: {
          update: questions.map((question: any) => ({
            where: { id: question.id },
            data: {
              title: question.title,
              type: question.type,
              isRequired: question.isRequired,
              options: { set: question.options || [] },
            },
          })),
        },
      },
    });

    return NextResponse.json(updatedForm, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar o formulário:", error);
    return NextResponse.json(
      { message: "Erro ao atualizar o formulário" },
      { status: 500 }
    );
  }
}
