import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
	const token = request.cookies.get('token');
	const { pathname } = request.nextUrl;

	const publicRoutes = ['/login', '/signup', '/accept-invite'];
	const isPublicRoute = publicRoutes.some((route) =>
		pathname.startsWith(route)
	);

	if (isPublicRoute && token) {
		return NextResponse.redirect(new URL('/dashboard', request.url));
	}

	if (!isPublicRoute && !token) {
		return NextResponse.redirect(new URL('/login', request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
