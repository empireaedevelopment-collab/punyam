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

    // 2. Fetch Dosha Data
    const doshaUrl = new URL('https://api.prokerala.com/v2/astrology/mangal-dosha');
    doshaUrl.searchParams.append('datetime', datetime);
    doshaUrl.searchParams.append('coordinates', coordinates);
    doshaUrl.searchParams.append('ayanamsa', ayanamsa);

    const doshaRes = await fetch(doshaUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const doshaData = await doshaRes.json();
    if (!doshaRes.ok) {
      throw new Error(doshaData.errors?.[0]?.detail || 'Failed to fetch dosha info');
    }

    return NextResponse.json(doshaData);
  } catch (error: any) {
    console.error('Prokerala API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch astrology data' }, 
      { status: 500 }
    );
  }
}
