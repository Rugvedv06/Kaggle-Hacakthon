import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT NOW() as time, COUNT(*) as chunks FROM chunks`
    );
    return NextResponse.json({
      db: 'ok',
      provider: 'supabase',
      time: result.rows[0].time,
      chunks: result.rows[0].chunks,
    });
  } catch (e) {
    return NextResponse.json(
      { db: 'error', message: String(e) },
      { status: 500 }
    );
  }
}
