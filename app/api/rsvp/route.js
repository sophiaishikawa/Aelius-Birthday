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
  console.log('[rsvp POST] handler reached');
  try {
    const body   = await request.json();
    console.log('[rsvp POST] body received:', body);

    const adults = parseInt(body.adults, 10);
    const kids   = parseInt(body.kids,   10);

    console.log('[rsvp POST] parsed — adults:', adults, 'kids:', kids);

    if (isNaN(adults) || adults < 1 || adults > 10) {
      console.error('[rsvp POST] invalid adult count:', adults);
      return NextResponse.json({ error: 'Invalid adult count' }, { status: 400 });
    }
    if (isNaN(kids) || kids < 0 || kids > 10) {
      console.error('[rsvp POST] invalid kids count:', kids);
      return NextResponse.json({ error: 'Invalid kids count' }, { status: 400 });
    }

    const total = adults + kids;
    console.log('[rsvp POST] incrementing — total:', total, 'adults:', adults, 'kids:', kids);

    const redis = getRedis();

    const [newTotal, newAdults, newKids] = await Promise.all([
      redis.incrby(TOTAL_KEY,  total),
      redis.incrby(ADULTS_KEY, adults),
      redis.incrby(KIDS_KEY,   kids),
    ]);

    console.log('[rsvp POST] success — newTotal:', newTotal, 'newAdults:', newAdults, 'newKids:', newKids);

    return NextResponse.json({
      total:  Number(newTotal),
      adults: Number(newAdults),
      kids:   Number(newKids),
    });
  } catch (error) {
    console.error('[rsvp POST] error:', error);
    return NextResponse.json({ error: 'Failed to update count' }, { status: 500 });
  }
}
