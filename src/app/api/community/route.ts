import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const photos = db.prepare("SELECT * FROM community_gallery WHERE status = 'APPROVED' ORDER BY id DESC").all();
    return NextResponse.json({ success: true, photos });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authorName, authorHandle, imageUrl, caption, productTagged } = await req.json();

    if (!authorName || !imageUrl) {
      return NextResponse.json({ error: 'Vyplňte jméno a URL fotografie.' }, { status: 400 });
    }

    const result = db.prepare(`
      INSERT INTO community_gallery (author_name, author_handle, image_url, caption, product_tagged, status)
      VALUES (?, ?, ?, ?, ?, 'PENDING')
    `).run(authorName.trim(), authorHandle ? authorHandle.trim() : null, imageUrl.trim(), caption || null, productTagged || null);

    return NextResponse.json({
      success: true,
      id: result.lastInsertRowid,
      message: 'Fotografie byla odeslána k moderaci. Děkujeme, že tvoříte komunitu RUN!',
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
