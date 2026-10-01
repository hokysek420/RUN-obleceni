import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const session = getAdminSession();
  if (!session) return NextResponse.json({ error: 'Neoprávněný přístup' }, { status: 401 });

  try {
    const publicDir = path.join(process.cwd(), 'public/images');
    const files: any[] = [];

    const scan = (subDir: string, category: string) => {
      const fullPath = path.join(publicDir, subDir);
      if (fs.existsSync(fullPath)) {
        const entries = fs.readdirSync(fullPath);
        entries.forEach((f) => {
          if (f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.webp')) {
            const stat = fs.statSync(path.join(fullPath, f));
            files.push({
              name: f,
              url: `/images/${subDir}/${f}`,
              category,
              size: Math.round(stat.size / 1024) + ' KB',
            });
          }
        });
      }
    };

    scan('products', 'Produkty');
    scan('editorial', 'Kampaň');
    scan('details', 'Detaily & Makro');
    scan('branding', 'Branding & Logo');

    return NextResponse.json({ success: true, media: files });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
