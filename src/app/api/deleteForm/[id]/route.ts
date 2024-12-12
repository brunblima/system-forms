import { NextRequest, NextResponse } from "next/server";
import { db } from "@/services/database/db";

export async function DELETE(
  req: NextRequest,
  context: { params: Record<string, string> } // Tipo ajustado
) {
  const { id } = context.params;

  if (!id) {
    return NextResponse.json(
      { error: "Formulário não especificado" },
      { status: 400 }
    );
  }

  try {
    const formExists = await db.form.findUnique({
      where: { id },
    });

    if (!formExists) {
      return NextResponse.json(
        { error: "Formulário não encontrado" },
        { status: 404 }
      );
    }

    await db.form.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Formulário excluído com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao excluir formulário:", error);
    return NextResponse.json(
      { error: "Erro ao excluir formulário" },
      { status: 500 }
    );
  }
}
