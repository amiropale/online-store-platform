#!/usr/bin/env bash

host="$1"
port="$2"
shift 2

while ! nc -z "$host" "$port"; do
  echo "⌛ Waiting for $host:$port..."
  sleep 5
done

echo "✅ $host:$port is ready — running command"
exec "$@"

chmod +x user-service/wait-for-it.sh