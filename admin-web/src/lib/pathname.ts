export function toInternalPathname(pathname: string): string {
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    return pathname.slice(3) || "/";
  }
  if (pathname === "/fa" || pathname.startsWith("/fa/")) {
    return pathname.slice(3) || "/";
  }
  return pathname;
}

export function pathnameFromHeaders(
  getHeader: (name: string) => string | null
): string {
  return toInternalPathname(getHeader("x-pathname") ?? "/");
}
