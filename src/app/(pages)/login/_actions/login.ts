"use server";

import { signIn } from "@/services/auth/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export default async function login(formData: FormData) {
  const entries = Array.from(formData.entries());
  const { email, password } = Object.fromEntries(entries) as {
    email: string;
    password: string;
  };

  try {
    await signIn("credentials", {
      email,
      password,
    });
  } catch (e) {
    if (e instanceof AuthError) {
      console.error(e.message);
      throw new Error(e.message.replace(/Read more at .*/, "").trim());
    }
  }

  redirect("/app");
}
