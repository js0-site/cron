#!/usr/bin/env bash

set -e
DIR=$(realpath $0) && DIR=${DIR%/*}
cd $DIR
set -x

gh release list --limit 100 --json tagName --jq '.[].tagName' | awk 'NR > 90 {print $1}' | while read -r tag; do
  if [ -n "$tag" ]; then
    gh release delete "$tag" --yes
  fi
done
