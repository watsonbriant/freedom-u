import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

/**
 * Handles the OAuth callback from MinistryPlatform
 * Exchanges authorization code for access token
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Check for OAuth error
    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    // Verify state parameter for CSRF protection
    const cookieStore = await cookies();
    const storedState = cookieStore.get('oauth_state')?.value;
    cookieStore.delete('oauth_state'); // Clear state cookie

    if (!state || state !== storedState) {
      return NextResponse.redirect(
        new URL('/login?error=invalid_state', request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/login?error=no_code', request.url)
      );
    }

    // Exchange authorization code for access token
    const baseUrl = process.env.MINISTRYPLATFORM_BASE_URL;
    const clientId = process.env.MINISTRYPLATFORM_CLIENT_ID;
    const clientSecret = process.env.MINISTRYPLATFORM_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/auth/ministryplatform/callback`;

    if (!baseUrl || !clientId || !clientSecret) {
      console.error('Missing required environment variables');
      return NextResponse.redirect(
        new URL('/login?error=config_error', request.url)
      );
    }

    // Exchange code for tokens using the correct OpenID Connect token endpoint
    const tokenResponse = await fetch(`${baseUrl}/ministryplatformapi/oauth/connect/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return NextResponse.redirect(
        new URL('/login?error=token_exchange_failed', request.url)
      );
    }

    const tokenData = await tokenResponse.json();

    // Get user information using the correct OpenID Connect userinfo endpoint
    const userResponse = await fetch(`${baseUrl}/ministryplatformapi/oauth/connect/userinfo`, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      console.error('Failed to fetch user info');
      // Continue anyway, we have the token
    }

    let userInfo = null;
    if (userResponse.ok) {
      userInfo = await userResponse.json();
    }

    // Store tokens securely in httpOnly cookie
    const tokenString = JSON.stringify({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      userId: userInfo?.sub || userInfo?.id,
      userName: userInfo?.name || userInfo?.userName,
      expiresAt: Date.now() + (tokenData.expires_in * 1000),
    });

    // Encrypt token data (optional additional security)
    const encryptedToken = encryptToken(tokenString);

    // Set secure cookie with token
    const expiresAt = new Date();
    expiresAt.setTime(Date.now() + (43200 * 60 * 1000)); // 30 days (refresh token lifetime)

    cookieStore.set('freedomu_session', encryptedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    // Redirect to home page
    return NextResponse.redirect(new URL('/home', request.url));
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/login?error=callback_error', request.url)
    );
  }
}

/**
 * Simple encryption for token storage (additional security layer)
 */
function encryptToken(token: string): string {
  // For production, use a proper encryption key from environment
  const key = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
  
  try {
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  } catch (error) {
    // If encryption fails, store as-is (development only)
    console.warn('Encryption failed, storing token without encryption');
    return token;
  }
}

/**
 * Decrypt token for use
 */
export function decryptToken(encryptedToken: string): string {
  const key = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
  
  try {
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encryptedToken, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    // If decryption fails, assume it's unencrypted
    return encryptedToken;
  }
}

