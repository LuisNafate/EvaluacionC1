import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Validar acceso a APIs
  if (request.nextUrl.pathname.startsWith("/api")) {
    const origin = request.headers.get("origin");
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(",");

    // En desarrollo, permitir localhost
    if (process.env.NODE_ENV === "development") {
      return NextResponse.next();
    }

    // En producción, validar origen
    if (origin && !allowedOrigins.includes(origin)) {
      return new NextResponse(
        JSON.stringify({ 
          error: "Acceso denegado", 
          message: "Origen no permitido" 
        }),
        { 
          status: 403, 
          headers: { "Content-Type": "application/json" } 
        }
      );
    }

    // Validar role header (opcional, descomenta si lo necesitas)
    // const role = request.headers.get("x-role");
    // if (!role || !["admin", "user"].includes(role)) {
    //   return new NextResponse(
    //     JSON.stringify({ error: "No autorizado", message: "Header x-role requerido" }),
    //     { status: 401, headers: { "Content-Type": "application/json" } }
    //   );
    // }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
