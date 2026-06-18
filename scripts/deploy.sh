#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/home/vf_ldce/PP-VF-App-Portal}"
BRANCH="${BRANCH:-main}"
PM2_APP="${PM2_APP:-vf-ldce}"
NGINX_SITE="${NGINX_SITE:-/etc/nginx/sites-available/default}"

cd "$APP_DIR"

git pull origin "$BRANCH"
npm install
npm run build
pm2 restart "$PM2_APP"

if ! sudo cmp -s nginx/default.conf "$NGINX_SITE"; then
    sudo cp nginx/default.conf "$NGINX_SITE"
    sudo nginx -t
    sudo systemctl reload nginx
else
    echo "Nginx config unchanged; skipping reload."
fi

sudo chmod o+x /home/vf_ldce
