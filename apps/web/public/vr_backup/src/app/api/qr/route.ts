import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

import { networkInterfaces } from 'os';

function getLocalIp() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const size = parseInt(searchParams.get('size') || '300');

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    // Determine base URL from:
    // 1. NEXT_PUBLIC_SITE_URL env var (for production)
    // 2. Referer/Origin header from the requesting browser
    // 3. Fall back to the host header of this request
    let baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

    if (!baseUrl) {
      // Try to derive from request headers
      const referer = request.headers.get('referer');
      const origin = request.headers.get('origin');
      const host = request.headers.get('host') || 'localhost:3000';

      if (origin) {
        baseUrl = origin;
      } else if (referer) {
        try {
          const parsed = new URL(referer);
          baseUrl = `${parsed.protocol}//${parsed.host}`;
        } catch {
          baseUrl = `http://${host}`;
        }
      } else {
        // Use host header - detect if HTTPS from x-forwarded-proto
        const proto = request.headers.get('x-forwarded-proto') || 'http';
        baseUrl = `${proto}://${host}`;
      }
    }

    // Remove trailing slash
    baseUrl = baseUrl.replace(/\/+$/, '');

    // Replace localhost with local network IP so mobile devices can access it
    if (baseUrl.includes('localhost')) {
      baseUrl = baseUrl.replace('localhost', getLocalIp());
    }

    // Build deep link URL using query params (since this is a SPA with only / route)
    const url = `${baseUrl}/?product=${encodeURIComponent(slug)}&ar=true`;

    const qrDataUrl = await QRCode.toDataURL(url, {
      width: size,
      margin: 2,
      color: {
        dark: '#059669',  // emerald-600 to match brand
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });

    const base64Data = qrDataUrl.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';