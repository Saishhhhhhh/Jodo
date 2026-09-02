import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, slug, eventType, deviceType, browser, userAgent } = body;

    await db.analyticsEvent.create({
      data: {
        productId: productId || null,
        slug: slug || null,
        eventType,
        deviceType: deviceType || 'unknown',
        browser: browser || null,
        userAgent: userAgent || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging analytics:', error);
    return NextResponse.json({ error: 'Failed to log analytics' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const totalScans = await db.analyticsEvent.count({
      where: { eventType: 'qr_scan' },
    });

    const totalPageViews = await db.analyticsEvent.count({
      where: { eventType: 'page_view' },
    });

    const totalARClicks = await db.analyticsEvent.count({
      where: { eventType: 'ar_clicked' },
    });

    const totalEnquiries = await db.analyticsEvent.count({
      where: { eventType: 'enquiry_clicked' },
    });

    // Device breakdown
    const deviceBreakdown = await db.analyticsEvent.groupBy({
      by: ['deviceType'],
      _count: { id: true },
    });

    // Product-wise scans
    const productScans = await db.analyticsEvent.groupBy({
      by: ['slug'],
      where: { eventType: 'qr_scan', slug: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    // Event type breakdown
    const eventBreakdown = await db.analyticsEvent.groupBy({
      by: ['eventType'],
      _count: { id: true },
    });

    // Recent events
    const recentEvents = await db.analyticsEvent.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      totalScans,
      totalPageViews,
      totalARClicks,
      totalEnquiries,
      deviceBreakdown: deviceBreakdown.map((d) => ({
        device: d.deviceType,
        count: d._count.id,
      })),
      productScans: productScans.map((p) => ({
        slug: p.slug,
        count: p._count.id,
      })),
      eventBreakdown: eventBreakdown.map((e) => ({
        event: e.eventType,
        count: e._count.id,
      })),
      recentEvents: recentEvents.map((e) => ({
        id: e.id,
        productId: e.productId,
        slug: e.slug,
        eventType: e.eventType,
        deviceType: e.deviceType,
        timestamp: e.timestamp.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
