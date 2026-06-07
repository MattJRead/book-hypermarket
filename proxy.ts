import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  // 1. Grab the security headers from the user's browser
  const basicAuth = req.headers.get('authorization');

  // 2. Check if they have provided the correct Lock and Key
  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    // 🚨 CHANGE THESE VALUES LATER: This is your master username and password
    if (user === 'MatthewRead' && pwd === 'Willow8820') {
      return NextResponse.next(); // Access Granted
    }
  }

  // 3. Access Denied: Force the browser to show the login popup
  return new NextResponse('Command Center Access Denied. State your credentials, trespasser.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Hypermarket Secure Vault"' }
  });
}

// 4. Tell the engine exactly which rooms in the building need to be locked
export const config = {
  matcher: ['/admin/:path*'], 
};