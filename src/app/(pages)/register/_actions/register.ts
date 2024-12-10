"use server";

import { db } from "@/services/database/db";
import { hashSync } from "bcrypt-ts";
import { redirect } from "next/navigation";

export default async function register(formData: FormData) {
  const entries = Array.from(formData.entries());
  const { name, email, password } = Object.fromEntries(entries) as {
    name: string;
    email: string;
    password: string;
  };

  if (!name || !email || !password) {
    throw new Error("Preencha todos os campos");
  }

  const userExists = await db.user.findUnique({
    where: { email },
  });

  if (userExists) {
    throw new Error("Usuário já existe");
  }

  await db.user.create({
    data: {
      name,
      email,
      password: hashSync(password, 10),
    },
  });

  redirect("/login");
}
