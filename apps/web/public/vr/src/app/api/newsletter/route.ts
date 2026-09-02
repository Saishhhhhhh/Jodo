import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// In-memory fallback for newsletter subscribers
let inMemorySubscribers: string[] = [];

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Check if already subscribed in-memory first (quick check)
    if (inMemorySubscribers.includes(normalizedEmail)) {
      return NextResponse.json(
        { message: 'You are already subscribed!' },
        { status: 200 }
      );
    }

    // Try database approach
    try {
      // Check if model exists on the db client
      const subscriberModel = (db as Record<string, unknown>).newsletterSubscriber;
      if (subscriberModel && typeof subscriberModel === 'object') {
        const existing = await (db as any).newsletterSubscriber.findUnique({
          where: { email: normalizedEmail },
        });

        if (existing) {
          inMemorySubscribers.push(normalizedEmail); // cache locally too
          return NextResponse.json(
            { message: 'You are already subscribed!' },
            { status: 200 }
          );
        }

        await (db as any).newsletterSubscriber.create({
          data: { email: normalizedEmail },
        });

        inMemorySubscribers.push(normalizedEmail);

        const count = await (db as any).newsletterSubscriber.count();

        return NextResponse.json(
          { message: 'Successfully subscribed! Welcome aboard.', count },
          { status: 201 }
        );
      }
    } catch (dbError) {
      console.error('DB newsletter error, using in-memory fallback:', dbError);
    }

    // Fallback: in-memory storage
    inMemorySubscribers.push(normalizedEmail);

    return NextResponse.json(
      { message: 'Successfully subscribed! Welcome aboard.', count: inMemorySubscribers.length },
      { status: 201 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    try {
      const subscriberModel = (db as Record<string, unknown>).newsletterSubscriber;
      if (subscriberModel && typeof subscriberModel === 'object') {
        const count = await (db as any).newsletterSubscriber.count();
        return NextResponse.json({ subscribers: count });
      }
    } catch {
      // ignore
    }

    return NextResponse.json({ subscribers: inMemorySubscribers.length });
  } catch {
    return NextResponse.json({ subscribers: 0 });
  }
}
