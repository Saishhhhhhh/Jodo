import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  context: { params: { slug: string } }
) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const slug = context.params.slug;
  try {
    const res = await fetch(`${apiUrl}/api/storefront/blogs/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(`Failed to proxy blog "${slug}":`, error);
    return NextResponse.json(
      { success: false, message: 'Failed to load blog post' },
      { status: 502 }
    );
  }
}
