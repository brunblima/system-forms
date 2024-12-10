import { NextResponse } from "next/server";
import { db } from "@/services/database/db";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { error: "ID do formulário não fornecido" },
      { status: 400 },
    );
  }

  try {
    const data = await request.json();
    const updatedForm = await db.form.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedForm);
  } catch (error) {
    console.error("Erro ao atualizar formulário:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar o formulário" },
      { status: 500 },
    );
  }
}
