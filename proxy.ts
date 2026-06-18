import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth/login');
  
  if (isAuthPage) {
    if (isLoggedIn) {
      return Response.redirect(new URL('/dashboard', req.nextUrl));
    }
    return null;
  }

  const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/pameran-iot/vote');

  if (!isLoggedIn && isProtectedRoute) {
    return Response.redirect(new URL('/auth/login', req.nextUrl));
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
