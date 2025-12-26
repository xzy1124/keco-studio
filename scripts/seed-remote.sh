#!/bin/bash
# Seed remote Supabase database with test users
# This script executes supabase/seed-remote.sql on the remote database

set -e

# Check if SUPABASE_DB_URL is set
if [ -z "$SUPABASE_DB_URL" ]; then
  echo "Error: SUPABASE_DB_URL environment variable must be set"
  echo "Format: postgresql://postgres:[password]@[host]:[port]/postgres"
  exit 1
fi

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SEED_FILE="$PROJECT_ROOT/supabase/seed-remote.sql"

if [ ! -f "$SEED_FILE" ]; then
  echo "Error: Seed file not found at $SEED_FILE"
  exit 1
fi

echo "Seeding remote Supabase database..."
echo "Using seed file: $SEED_FILE"

# Extract hostname from the connection URL
DB_HOST=$(echo "$SUPABASE_DB_URL" | sed -E 's|.*@([^:]+):.*|\1|')

# Force IPv4 resolution to avoid IPv6 connectivity issues in GitHub Actions
echo "Resolving $DB_HOST to IPv4..."

# Try multiple methods to get IPv4 address
if command -v dig > /dev/null 2>&1; then
  IPV4_ADDR=$(dig +short A "$DB_HOST" | grep -E '^[0-9.]+$' | head -n1)
elif command -v nslookup > /dev/null 2>&1; then
  IPV4_ADDR=$(nslookup "$DB_HOST" | grep -A1 "Name:" | grep "Address:" | awk '{print $2}' | grep -E '^[0-9.]+$' | head -n1)
elif command -v host > /dev/null 2>&1; then
  IPV4_ADDR=$(host -t A "$DB_HOST" | grep "has address" | awk '{print $4}' | head -n1)
fi

if [ -z "$IPV4_ADDR" ]; then
  echo "Warning: Could not resolve to IPv4, trying with original hostname..."
else
  echo "Resolved to IPv4: $IPV4_ADDR"
  # Replace hostname with IPv4 address in the connection URL
  SUPABASE_DB_URL=$(echo "$SUPABASE_DB_URL" | sed "s|@$DB_HOST:|@$IPV4_ADDR:|")
fi

# Execute the seed SQL file using psql
psql "$SUPABASE_DB_URL" -f "$SEED_FILE"

echo "Seed data applied successfully!"

