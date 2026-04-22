import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

// Rute care necesita autentificare
const protectedRoutes = ["/dashboard"];
const token = "token-test";
const role = "STUDENT";

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Citim token-ul si rolul din cookies (proxy NU are acces la localStorage)
    const token = request.cookies.get("accessToken")?.value;
    const role = request.cookies.get("role")?.value;

    // Daca user-ul este deja logat si incearca sa intre pe /login
    if (pathname === "/login" && token) {
        const dashboardUrl = new URL("/dashboard", request.url);
        return NextResponse.redirect(dashboardUrl);
    }

    // Redirect automat in functie de rol cand intra pe /dashboard
    if (pathname === "/dashboard" && role) {
        if (role === "ORGANIZATION_ADMIN") {
            return NextResponse.redirect(new URL("/dashboard/admin", request.url));
        }

        if (role === "TEACHER") {
            return NextResponse.redirect(new URL("/dashboard/teacher", request.url));
        }

        if (role === "STUDENT") {
            return NextResponse.redirect(new URL("/dashboard/student", request.url));
        }
    }

    // Blocam accesul la dashboard-ul altui rol
    // if (pathname.startsWith("/dashboard/admin") && role !== "ORGANIZATION_ADMIN") {
    //     return NextResponse.redirect(new URL("/dashboard", request.url));
    // }

    // if (pathname.startsWith("/dashboard/teacher") && role !== "TEACHER") {
    //     return NextResponse.redirect(new URL("/dashboard", request.url));
    // }

    // if (pathname.startsWith("/dashboard/student") && role !== "STUDENT") {
    //     return NextResponse.redirect(new URL("/dashboard", request.url));
    // }

    // Verificam daca ruta este protejata
    const isProtected = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    // Daca ruta nu este protejata -> permitem accesul
    if (!isProtected) 
        return NextResponse.next();

    // Daca nu exista token -> redirect la login
    // if (!token) {
    //     const loginUrl = new URL("/login", request.url);
    //     return NextResponse.redirect(loginUrl);
    // }

    // Daca exista token -> acces permis
    return NextResponse.next();
}

// Definim rutele pe care proxy-ul le asculta
export const config = {
    matcher: ["/dashboard/:path*"],
};