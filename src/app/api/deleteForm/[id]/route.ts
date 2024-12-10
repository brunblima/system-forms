import { NextResponse } from "next/server";
import { db } from "@/services/database/db";

// Lidar com requisição DELETE
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // Verifica se o formulário existe
    const form = await db.form.findUnique({
      where: { id: id },
    });

    if (!form) {
      return NextResponse.json(
        { message: "Formulário não encontrado" },
        { status: 404 }
      );
    }

    // Deleta o formulário
    await db.form.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Formulário excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir o formulário:", error);
    return NextResponse.json(
      { message: "Erro ao excluir o formulário" },
      { status: 500 }
    );
  }
}
