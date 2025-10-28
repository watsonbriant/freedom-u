# MinistryPlatform OAuth Setup

## Environment Variables

Add these to your `.env.local` file:

```env
# Supabase Configuration (existing)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# MinistryPlatform OAuth Configuration (NEW)
MINISTRYPLATFORM_BASE_URL=https://yourorg.ministryplatform.com
MINISTRYPLATFORM_CLIENT_ID=freedomu
MINISTRYPLATFORM_CLIENT_SECRET=.\JQipDse1%pj-!%-MpA
NEXT_PUBLIC_APP_BASE_URL=http://freedomu.netlify.app

# Security
ENCRYPTION_KEY=your-strong-random-secret-key-here-change-this
```

**Important:** Replace these values:
- `https://yourorg.ministryplatform.com` → Your actual MinistryPlatform organization URL
- `your-strong-random-secret-key-here-change-this` → A strong random string for token encryption (use a password generator)

## Setup Instructions

1. Set `MINISTRYPLATFORM_BASE_URL` to your organization's base URL
   - Example: `https://freedomhouse.ministryplatform.com`
2. The Client ID and Secret are already configured from your API Client
3. Update `NEXT_PUBLIC_APP_BASE_URL`:
   - For local development: `http://localhost:3000`
   - For production: `https://freedomu.netlify.app`

## Finding Your OAuth Endpoints

Your MinistryPlatform OAuth endpoints follow this pattern:
```
https://[yourorg].ministryplatform.com/ministryplatformapi/oauth/.well-known/openid-configuration
```

Visit that URL to get all the correct endpoint paths for your organization.

## How It Works

1. User clicks "Sign In with MinistryPlatform" on the login page
2. User is redirected to MinistryPlatform's authorization endpoint
3. User enters their MinistryPlatform credentials
4. MinistryPlatform redirects back with authorization code
5. Our server exchanges code for access token using the Client Secret
6. Access token encrypted and stored in secure, httpOnly cookie
7. User authenticated for 30 days (refresh token lifetime)
8. After 60 minutes (access token lifetime), app can refresh the token automatically

## Token Storage

- Access tokens stored in httpOnly cookies (server-side only)
- Tokens expire after configured lifetime
- Refresh tokens used to get new access tokens when needed

