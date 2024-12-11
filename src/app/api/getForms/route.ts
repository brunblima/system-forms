import { NextRequest, NextResponse } from "next/server";
import { db } from "@/services/database/db";
import { auth } from "@/services/auth/auth";

export async function GET(req: NextRequest) {
  try {
    // Autenticação do usuário
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 },
      );
    }

    const creatorId = session.user.id;

    // Busca todos os formulários do usuário
  const forms = await db.form.findMany({
      where: { creatorId }, // Filtra por usuário, se necessário
      include: {
        _count: {
          select: { responses: true }, // Conta as respostas relacionadas ao formulário
        },
      },
    });

    const formattedForms = forms.map((form) => ({
      id: form.id,
      title: form.title,
      createdAt: form.createdAt,
      responses: form._count.responses || 0, // Número de respostas ou 0 se não houver
    }));

    return NextResponse.json(formattedForms);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
