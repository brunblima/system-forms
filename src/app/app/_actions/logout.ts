"use server";

import { signOut } from "@/services/auth/auth";

export default async function logout() {
  try {
    await signOut();
  } catch (e) {
    throw e;
  }
}
