import { NextRequest, NextResponse } from 'next/server';
import {
  MinecraftCompatibilityChecker,
  SUPPORTED_VERSIONS,
} from '@/lib/minecraft-compat';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const edition = (url.searchParams.get('edition') as any) || 'CROSSPLAY';
  const version = url.searchParams.get('version') || '1.21.1';
  const software = (url.searchParams.get('software') as any) || 'PURPUR';

  const result = MinecraftCompatibilityChecker.check(edition, version, software);

  return NextResponse.json({
    result,
    allVersions: Object.values(SUPPORTED_VERSIONS),
  });
}
