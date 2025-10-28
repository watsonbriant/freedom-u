import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Initiates the OAuth flow by redirecting to MinistryPlatform's authorization endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.MINISTRYPLATFORM_BASE_URL;
    const clientId = process.env.MINISTRYPLATFORM_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/auth/ministryplatform/callback`;

    if (!baseUrl || !clientId || !redirectUri) {
      console.error('Missing required environment variables');
      return NextResponse.json(
        { error: 'OAuth configuration missing' },
        { status: 500 }
      );
    }

    // Generate state parameter for CSRF protection
    const state = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);
    
    // Store state in cookie for verification in callback
    const cookieStore = await cookies();
    cookieStore.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    // Build authorization URL using the correct OpenID Connect endpoint
    const authUrl = `${baseUrl}/ministryplatformapi/oauth/connect/authorize?` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=openid profile&` +
      `state=${state}`;

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating OAuth flow:', error);
    return NextResponse.json(
      { error: 'Failed to initiate authentication' },
      { status: 500 }
    );
  }
}

