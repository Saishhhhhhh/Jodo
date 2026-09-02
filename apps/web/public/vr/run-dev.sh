#!/bin/bash
cd /home/z/my-project
while true; do
  bun --bun run dev </dev/null 2>&1 | tee -a dev.log
  echo "Server crashed, restarting in 3s..." >> dev.log
  sleep 3
done
