#!/usr/bin/env bash
set -euo pipefail

export USER_ID=$(id -u)
export GROUP_ID=$(id -g)
echo "Using USER_ID=${USER_ID} GROUP_ID=${GROUP_ID}"
docker compose build --no-cache