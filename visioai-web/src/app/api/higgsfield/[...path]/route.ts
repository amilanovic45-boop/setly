import { NextRequest, NextResponse } from 'next/server';

const HIGGSFIELD_BASE = 'https://api.higgsfield.ai';

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const apiKey = request.headers.get('x-api-key');

  if (!apiKey) {
    return NextResponse.json({ error: 'API key required' }, { status: 401 });
  }

  const targetPath = '/' + path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const targetUrl = `${HIGGSFIELD_BASE}${targetPath}${searchParams ? `?${searchParams}` : ''}`;

  const contentType = request.headers.get('content-type') ?? '';
  const isMultipart = contentType.includes('multipart/form-data');

  const forwardHeaders: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    Accept: 'application/json',
  };

  if (!isMultipart) {
    forwardHeaders['Content-Type'] = 'application/json';
  }

  let body: BodyInit | null = null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    if (isMultipart) {
      body = await request.formData();
    } else {
      body = await request.text();
    }
  }

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: forwardHeaders,
      body,
    });

    const responseContentType = response.headers.get('content-type') ?? '';
    if (responseContentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      status: response.status,
      headers: {
        'Content-Type': responseContentType,
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Proxy request failed' }, { status: 502 });
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
