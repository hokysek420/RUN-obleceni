import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json({ error: 'Zadejte hledaný výraz' }, { status: 400 });
    }

    const order = db.prepare(`
      SELECT * FROM orders 
      WHERE order_number = ? OR tracking_number = ?
    `).get(query.trim(), query.trim()) as any;

    if (!order) {
      return NextResponse.json({ error: 'Objednávka nebyla nalezena.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Chyba serveru' }, { status: 500 });
  }
}
