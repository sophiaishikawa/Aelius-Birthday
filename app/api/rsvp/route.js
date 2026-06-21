import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const COUNTER_KEY = 'aelius_birthday_rsvp_total';

function getRedis() {
  return new Redis({
    url:   process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

function getIP(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? null;
}

export async function GET() {
  try {
    const redis = getRedis();
    const count = await redis.get(COUNTER_KEY);
    return NextResponse.json({ total: Number(count ?? 0) });
  } catch (error) {
    console.error('Redis GET error:', error);
    console.error('Redis GET error detail:', {
      message:  error?.message,
      status:   error?.status ?? error?.statusCode,
      response: error?.response ?? error?.body,
      envUrl:   process.env.UPSTASH_REDIS_REST_URL   ? 'SET' : 'MISSING',
      envToken: process.env.UPSTASH_REDIS_REST_TOKEN ? 'SET' : 'MISSING',
    });
    return NextResponse.json({ error: 'Failed to fetch count' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const guests = parseInt(body.guests, 10);

    if (isNaN(guests) || guests < 1 || guests > 20) {
      return NextResponse.json({ error: 'Invalid guest count' }, { status: 400 });
    }

    const redis = getRedis();

    // IP rate limiting — one RSVP per IP per 24 hours
    const ip = getIP(request);
    if (ip) {
      const ipKey = `rsvp_ip:${ip}`;
      const set = await redis.set(ipKey, 1, { nx: true, ex: 86400 });
      if (set === null) {
        return NextResponse.json({ error: 'Already counted!' }, { status: 429 });
      }
    }

    const newTotal = await redis.incrby(COUNTER_KEY, guests);
    return NextResponse.json({ total: Number(newTotal) });
  } catch (error) {
    console.error('Redis POST error:', error);
    return NextResponse.json({ error: 'Failed to update count' }, { status: 500 });
  }
}
