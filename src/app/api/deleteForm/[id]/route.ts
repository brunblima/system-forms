import { NextRequest, NextResponse } from "next/server";
import { db } from "@/services/database/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { error: "Formulário não especificado" },
      { status: 400 }
    );
  }

  try {
    // Verifica se o formulário existe antes de tentar deletar
    const formExists = await db.form.findUnique({
      where: { id: id },
    });

    if (!formExists) {
      return NextResponse.json(
        { error: "Formulário não encontrado" },
        { status: 404 }
      );
    }

    // Exclui o formulário
    await db.form.delete({
      where: { id: id },
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
