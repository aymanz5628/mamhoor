#!/bin/sh

# Set DATABASE_URL for prisma if not already set
export DATABASE_URL="${DATABASE_URL:-file:./prisma/prod.db}"

echo "==> Running prisma db push to ensure database exists..."
npx prisma db push --skip-generate
echo "==> Database ready!"

# Start the Next.js app
exec node server.js
