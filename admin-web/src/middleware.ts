import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { accessTokenExpired } from "@takvpn/shared/lib/auth-session";
import { userAppUrl } from "@takvpn/shared/lib/app-urls";

const intlMiddleware = createMiddleware(routing);

function requestWithPathname(request: NextRequest): NextRequest {
  const headers = new Headers(request.headers);
  headers.set("x-pathname", request.nextUrl.pathname);
  return new NextRequest(request.url, { headers });
}

function runIntl(request: NextRequest): NextResponse {
  return intlMiddleware(requestWithPathname(request));
}

function adminPath(pathname: string): string | null {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return pathname;
  }
  if (pathname === "/en/admin" || pathname.startsWith("/en/admin/")) {
    return pathname;
  }
  return null;
}

function localeFromPath(pathname: string): string {
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    return "en";
  }
  return routing.defaultLocale;
}

function loginPath(pathname: string): string {
  const locale = localeFromPath(pathname);
  const base = "/admin/login";
  const login = locale === routing.defaultLocale ? base : `/${locale}${base}`;
  return `${login}?next=${encodeURIComponent(pathname)}`;
}

function isPublicAdminPath(pathname: string): boolean {
  return (
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/login/") ||
    pathname === "/en/admin/login" ||
    pathname.startsWith("/en/admin/login/")
  );
}

function clearAuthCookies(res: NextResponse) {
  res.cookies.set("takvpn_access", "", { path: "/", maxAge: 0 });
  res.cookies.set("takvpn_refresh", "", { path: "/api/v1/auth", maxAge: 0 });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const access = request.cookies.get("takvpn_access")?.value;
  const accessValid = !!access && !accessTokenExpired(access);
  const locale = localeFromPath(pathname);

  if (pathname === "/fa" || pathname.startsWith("/fa/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/fa" ? "/" : pathname.slice(3) || "/";
    return NextResponse.redirect(url, 301);
  }

  if (pathname === "/" || pathname === "/en") {
    const url = request.nextUrl.clone();
    url.pathname = locale === "en" ? "/en/admin/login" : "/admin/login";
    return NextResponse.redirect(url);
  }

  const admin = adminPath(pathname);
  if (!admin) {
    const target = userAppUrl(pathname, locale);
    return NextResponse.redirect(target);
  }

  if (isPublicAdminPath(pathname)) {
    return runIntl(request);
  }

  if (!accessValid) {
    const login = new URL(loginPath(pathname), request.url);
    const res = NextResponse.redirect(login);
    if (access) {
      clearAuthCookies(res);
    }
    return res;
  }

  return runIntl(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
