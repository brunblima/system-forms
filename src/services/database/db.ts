/* eslint-disable no-var */
import { PrismaClient } from "@prisma/client";

// Declaração global para armazenar o prisma no ambiente de desenvolvimento
declare global {
  // Especifica que o global pode ter um cachedPrisma do tipo PrismaClient
  var cachedPrisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  // Em produção, cria uma nova instância
  prisma = new PrismaClient();
} else {
  // Em desenvolvimento, usa a instância em cache ou cria uma nova
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient();
  }
  prisma = global.cachedPrisma;
}

export const db = prisma;
