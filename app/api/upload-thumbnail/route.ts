import { NextRequest, NextResponse } from 'next/server';
import { utapi } from '@/server/uploadthing';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 });
    }

    const uploadResult = await utapi.uploadFiles(file);

    if (!uploadResult.data) {
      return NextResponse.json({ success: false, error: uploadResult.error?.message || 'Upload failed' }, { status: 500 });
    }

    const url = (uploadResult.data as any).ufsUrl || uploadResult.data.url;

    return NextResponse.json({ success: true, url, name: uploadResult.data.name });
  } catch (err) {
    console.error('❌ Thumbnail upload failed:', err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Upload thumbnail endpoint ready' });
}


