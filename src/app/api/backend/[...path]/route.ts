import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://punyam.pythonanywhere.com';

export async function POST(request: NextRequest, ctx: RouteContext<'/api/backend/[...path]'>) {
  const { path } = await ctx.params;
  const pathStr = path.join('/');
  // Preserve trailing slash for Django REST Framework
  const url = `${BACKEND_URL}/api/${pathStr}/`;

  try {
    const body = await request.json();
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to reach backend server' }, { status: 502 });
  }
}

export async function GET(request: NextRequest, ctx: RouteContext<'/api/backend/[...path]'>) {
  const { path } = await ctx.params;
  const pathStr = path.join('/');
  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();
  const url = `${BACKEND_URL}/api/${pathStr}/${queryString ? `?${queryString}` : ''}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to reach backend server' }, { status: 502 });
  }
}
