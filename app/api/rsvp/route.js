import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const TOTAL_KEY  = 'aelius_birthday_rsvp_total';
const ADULTS_KEY = 'aelius_birthday_rsvp_adults';
const KIDS_KEY   = 'aelius_birthday_rsvp_kids';

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
    const [total, adults, kids] = await Promise.all([
      redis.get(TOTAL_KEY),
      redis.get(ADULTS_KEY),
      redis.get(KIDS_KEY),
    ]);
    return NextResponse.json({
      total:  Number(total  ?? 0),
      adults: Number(adults ?? 0),
      kids:   Number(kids   ?? 0),
    });
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
    const body   = await request.json();
    const adults = parseInt(body.adults, 10);
    const kids   = parseInt(body.kids,   10);

    if (isNaN(adults) || adults < 1 || adults > 10) {
      return NextResponse.json({ error: 'Invalid adult count' }, { status: 400 });
    }
    if (isNaN(kids) || kids < 0 || kids > 10) {
      return NextResponse.json({ error: 'Invalid kids count' }, { status: 400 });
    }

    const total = adults + kids;
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

    const [newTotal, newAdults, newKids] = await Promise.all([
      redis.incrby(TOTAL_KEY,  total),
      redis.incrby(ADULTS_KEY, adults),
      redis.incrby(KIDS_KEY,   kids),
    ]);

    return NextResponse.json({
      total:  Number(newTotal),
      adults: Number(newAdults),
      kids:   Number(newKids),
    });
  } catch (error) {
    console.error('Redis POST error:', error);
    return NextResponse.json({ error: 'Failed to update count' }, { status: 500 });
  }
}
