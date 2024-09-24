// middleware.ts
import { authMiddleware } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

// Use Clerk's built-in authMiddleware
export default authMiddleware({
  publicRoutes: ['/api/:path*', '/auth/signin', '/unauthorized'],
})

// Middleware configuration
export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
