import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const datetime = searchParams.get('datetime') || new Date().toISOString();
  const coordinates = searchParams.get('coordinates') || '28.6139,77.2090'; // Default: New Delhi
  const ayanamsa = searchParams.get('ayanamsa') || '1';

  try {
    const clientId = process.env.PROKERALA_CLIENT_ID;
    const clientSecret = process.env.PROKERALA_CLIENT_SECRET;

    if (!clientId || !clientSecret || clientId.includes('your_client')) {
      return NextResponse.json(
        { error: 'Prokerala credentials missing or invalid in environment variables.' }, 
        { status: 500 }
      );
    }

    // 1. Get OAuth Token
    const tokenRes = await fetch('https://api.prokerala.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      throw new Error(tokenData.errors?.[0]?.detail || 'Failed to authenticate with Prokerala API');
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch Advanced Kundli Data
    const kundliUrl = new URL('https://api.prokerala.com/v2/astrology/kundli/advanced');
    
    // Copy all query params
    searchParams.forEach((value, key) => {
        kundliUrl.searchParams.append(key, value);
    });

    // Ensure defaults are present if not provided
    if (!kundliUrl.searchParams.has('datetime')) kundliUrl.searchParams.append('datetime', datetime);
    if (!kundliUrl.searchParams.has('coordinates')) kundliUrl.searchParams.append('coordinates', coordinates);
    if (!kundliUrl.searchParams.has('ayanamsa')) kundliUrl.searchParams.append('ayanamsa', ayanamsa);

    const kundliRes = await fetch(kundliUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const kundliData = await kundliRes.json();
    if (!kundliRes.ok) {
      throw new Error(kundliData.errors?.[0]?.detail || 'Failed to fetch advanced kundli');
    }

    return NextResponse.json(kundliData);
  } catch (error: any) {
    console.error('Prokerala API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch astrology data' }, 
      { status: 500 }
    );
  }
}
