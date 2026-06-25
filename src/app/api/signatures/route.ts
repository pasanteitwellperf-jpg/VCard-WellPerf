import { NextResponse } from 'next/server';
import { createClient } from '@vercel/postgres';

export async function GET() {
  try {
    const client = createClient();
    await client.connect();
    const result = await client.query('SELECT sharepoint_id, blob_url FROM attendance_signatures');
    await client.end();
    
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
