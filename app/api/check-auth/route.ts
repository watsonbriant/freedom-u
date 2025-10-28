import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('freedomu_session');

    if (!session?.value) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // Check if it's the old simple session format
    if (session.value === 'authenticated') {
      return NextResponse.json({ authenticated: true });
    }

    // Decrypt and validate OAuth token
    try {
      const decryptedToken = decryptToken(session.value);
      const tokenData = JSON.parse(decryptedToken);
      
      // Check if token is expired
      if (tokenData.expiresAt && tokenData.expiresAt < Date.now()) {
        return NextResponse.json(
          { authenticated: false },
          { status: 401 }
        );
      }

      // Token is valid
      return NextResponse.json({ 
        authenticated: true,
        user: {
          id: tokenData.userId,
          name: tokenData.userName,
        }
      });
    } catch (error) {
      // Token decryption or parsing failed
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { authenticated: false },
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
    // If decryption fails, assume it's unencrypted
    return encryptedToken;
  }
}

