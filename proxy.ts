import { auth } from "@/auth"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const isAdmin = req.auth?.user?.role === "admin"

  const isAuthPage = nextUrl.pathname.startsWith("/auth/login")
  const isRedirectPage = nextUrl.pathname.startsWith("/auth/redirect")
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard")
  const isAccountRoute = nextUrl.pathname.startsWith("/account")
  const isProtectedRoute =
    isDashboardRoute || nextUrl.pathname.startsWith("/pameran/vote")

  if (isAuthPage) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/auth/redirect", nextUrl))
    }
    return null
  }

  // Role router must stay reachable while signed in.
  if (isRedirectPage) return null

  if (!isLoggedIn && (isProtectedRoute || isAccountRoute)) {
    return Response.redirect(new URL("/auth/login?expired=1", nextUrl))
  }

  // Dashboard is admin-only; regular users go to their account page.
  if (isDashboardRoute && !isAdmin) {
    return Response.redirect(new URL("/account", nextUrl))
  }
})

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|auth/(?:session|csrf|signin|signout|callback|providers|error|verify-request|new-user)).*)",
  ],
}
