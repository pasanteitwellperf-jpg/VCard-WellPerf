import { NextResponse } from 'next/server';
import { createClient } from '@vercel/postgres';

export async function GET() {
  try {
    const client = createClient();
    await client.connect();
    
    const result = await client.query('SELECT * FROM meetings ORDER BY created_at DESC');
    await client.end();
    
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ error: 'Falta el nombre de la reunión' }, { status: 400 });
    }

    const client = createClient();
    await client.connect();
    
    const result = await client.query(
      'INSERT INTO meetings (name) VALUES ($1) RETURNING *',
      [name]
    );
    await client.end();
    
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
