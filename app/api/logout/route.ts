import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('freedomu_session');
    
    // Clear the session cookie
    cookieStore.delete('freedomu_session');
    cookieStore.delete('oauth_state');

    // If it's an OAuth session, also logout from MinistryPlatform
    if (session?.value && session.value !== 'authenticated') {
      try {
        const decryptedToken = decryptToken(session.value);
        const tokenData = JSON.parse(decryptedToken);
        
        const baseUrl = process.env.MINISTRYPLATFORM_BASE_URL;
        if (baseUrl && tokenData.accessToken) {
          // Call MinistryPlatform logout endpoint using the correct OpenID Connect session end endpoint
          await fetch(`${baseUrl}/ministryplatformapi/oauth/connect/endsession`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${tokenData.accessToken}`,
            },
          }).catch(() => {
            // Ignore errors - we've already cleared the local session
          });
        }
      } catch (error) {
        // Ignore token errors
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

/**
 * Decrypt token for use
 */
function decryptToken(encryptedToken: string): string {
  const key = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
  
  try {
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encryptedToken, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    return encryptedToken;
  }
}

