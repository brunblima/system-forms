import { NextRequest, NextResponse } from "next/server";
import { db } from "@/services/database/db";
import { auth } from "@/services/auth/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Autenticação do usuário
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 },
      );
    }

    const formId = params.id;

    if (!formId) {
      return NextResponse.json(
        { error: "ID do formulário não foi fornecido" },
        { status: 400 },
      );
    }

    // Busca o formulário específico do usuário
    const form = await db.form.findFirst({
      where: {
        id: formId,
        creatorId: session.user.id, // Garante que pertence ao usuário autenticado
      },
      include: {
        questions: true,
      },
    });

    if (!form) {
      return NextResponse.json(
        { error: "Formulário não encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
