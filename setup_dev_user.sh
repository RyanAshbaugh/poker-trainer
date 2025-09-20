#!/usr/bin/env bash
set -euo pipefail

echo "Using USER_ID=$(id -u) GROUP_ID=$(id -g)"
USER_ID=$(id -u) GROUP_ID=$(id -g) docker compose up --build