import { NextRequest, NextResponse } from 'next/server'

// Temporary debug endpoint to check Vercel headers for subdomain routing
// DELETE THIS after debugging is complete
export async function GET(request: NextRequest) {
  const headers: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    headers[key] = value
  })

  return NextResponse.json({
    hostname: request.nextUrl.hostname,
    host_header: request.headers.get('host'),
    x_forwarded_host: request.headers.get('x-forwarded-host'),
    pathname: request.nextUrl.pathname,
    url: request.url,
    all_headers: headers,
  })
}
