# Environment Setup

## Required Environment Variables

Create a `.env.local` file in the root of the project with the following variables:

### For Development & Testing

```bash
# Supabase Configuration
# Required for both development and testing
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### For Seeding Test Users (Recommended for CI)

```bash
# Supabase Service Role Key (Admin API)
# Required for seeding test users via API
# ⚠️ KEEP THIS SECRET! Never commit this to version control
# Find it in: Supabase Dashboard → Project Settings → API → Service Role Key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## GitHub Actions Secrets

For CI/CD, add these secrets to your GitHub repository:

1. Go to your repository settings → **Secrets and variables** → **Actions**
2. Add the following secrets:

| Secret Name | Description | Where to Find |
|------------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anonymous/public key | Supabase Dashboard → Project Settings → API → Project API keys → `anon` `public` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (admin) | Supabase Dashboard → Project Settings → API → Project API keys → `service_role` ⚠️ |

⚠️ **Important**: The `service_role` key has admin privileges. Keep it secret!

## Seeding Test Users

### Option 1: Via API (Recommended for CI)

```bash
npm run seed:api
```

This method:
- ✅ Works reliably in CI environments
- ✅ No database connection issues
- ✅ Uses official Supabase Admin API

### Option 2: Direct Database Connection (Local only)

```bash
# Add to .env.local
SUPABASE_DB_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres

# Run
./scripts/seed-remote.sh
```

⚠️ This method may fail in GitHub Actions due to network/IPv6 issues.

## Test Users

After seeding, these users will be available:

| Email | Password | Description |
|-------|----------|-------------|
| `seed-empty@mailinator.com` | `Password123!` | Empty account (no data) |
| `seed-empty-2@mailinator.com` | `Password123!` | Empty account (for parallel tests) |
| `seed-empty-3@mailinator.com` | `Password123!` | Empty account (for parallel tests) |
| `seed-empty-4@mailinator.com` | `Password123!` | Empty account (for parallel tests) |
| `seed-project@mailinator.com` | `Password123!` | Has one empty project |
| `seed-library@mailinator.com` | `Password123!` | Has one project with one library |

## Why mailinator.com?

We use `@mailinator.com` instead of `@example.com` because:
- Some CI environments (including GitHub Actions) reject invalid email domains
- Mailinator is a real disposable email service that passes validation
- Test emails can be verified if needed at https://www.mailinator.com/

## Troubleshooting

### "Cannot connect to Supabase" in CI

✅ Solution: Use the API seeding method (`seed-via-api.ts`) instead of direct database connection

### "Invalid email domain" errors

✅ Solution: Use `@mailinator.com` or another real domain instead of `@example.com`

### "Service role key invalid"

1. Double-check you copied the correct key from Supabase Dashboard
2. Ensure you're using `service_role` not `anon` key
3. Check the key doesn't have extra spaces or line breaks

