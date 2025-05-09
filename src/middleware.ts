import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get(
    process.env.NODE_ENV === "production"
      ? "__Secure-authjs.session-token"
      : "authjs.session-token"
  );

  const pathname = request.nextUrl.pathname;

  // Permite acesso público à página de responder formulários
  if (pathname.startsWith("/app/forms") && pathname.includes("/responder") || pathname.endsWith("/success")) {
    return NextResponse.next();
  }

  // Redireciona para login se o usuário não estiver autenticado
  if (pathname.startsWith("/app") && !token) {
    return NextResponse.redirect(new URL("/", request.url)); // Redireciona para a página de login
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
