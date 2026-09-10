#!/bin/bash
cd /home/z/my-project
while true; do
  bun --bun run dev >/dev/null 2>&1
  sleep 1
done
