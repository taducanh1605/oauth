#!/bin/bash

# Stop and remove existing container
docker stop oauth-server 2>/dev/null
docker rm oauth-server 2>/dev/null

# Create db directory if not exists
mkdir -p ./db/oauth

# Run container
docker run -d \
  --name oauth-server \
  -p 2444:2444 \
  -e NODE_ENV=production \
  -e PORT=2444 \
  -v ./db/oauth:/app/db \
  -v ./.env_oauth:/app/.env:ro \
  --restart unless-stopped \
  oauth-oauth-server:latest

echo "Container started. Access: http://localhost:2444"
