import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

const protectedRoutes = ["/dashboard"];

function getDashboardForRole(role: string | undefined, requestUrl: string): URL | null {
    if (role === "ORGANIZATION_ADMIN") return new URL("/dashboard/admin", requestUrl);
    if (role === "TEACHER") return new URL("/dashboard/teacher", requestUrl);
    if (role === "STUDENT") return new URL("/dashboard/student", requestUrl);
    return null;
}

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const token = request.cookies.get("accessToken")?.value;
    const role = request.cookies.get("role")?.value;
    const isProtected = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    if (pathname === "/login" && token) {
        return NextResponse.redirect(
            getDashboardForRole(role, request.url) ?? new URL("/dashboard", request.url)
        );
    }

    if (!isProtected) 
        return NextResponse.next();

    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (pathname === "/dashboard") {
        const dashboardUrl = getDashboardForRole(role, request.url);
        if (dashboardUrl) return NextResponse.redirect(dashboardUrl);
    }

    if (pathname.startsWith("/dashboard/admin") && role !== "ORGANIZATION_ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (pathname.startsWith("/dashboard/teacher") && role !== "TEACHER") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (pathname.startsWith("/dashboard/student") && role !== "STUDENT") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/login"],
};
