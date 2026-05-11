#!/bin/sh
# Run prisma db push to ensure database and tables exist
npx prisma db push

# Start the Next.js app
exec node server.js
