import React from 'react';
import db from '@/lib/db';
import CommunityClient from './CommunityClient';

export const dynamic = 'force-dynamic';

export default function CommunityPage() {
  const photos = db.prepare("SELECT * FROM community_gallery WHERE status = 'APPROVED' ORDER BY id DESC").all() as any[];

  return <CommunityClient initialPhotos={photos} />;
}
