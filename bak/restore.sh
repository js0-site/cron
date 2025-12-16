#!/usr/bin/env bash

set -e
DIR=$(realpath $0) && DIR=${DIR%/*}
cd $DIR
set -a
. ../conf/bak.env
set +a
set -o pipefail
set -x

rm -rf restore/data

TAG=$(gh release list --limit 1 --json tagName --jq '.[].tagName')

TMP=$(mktemp -d)

gh release download $TAG --dir $TMP

find $TMP -type f -name "*.tar.zst.enc" | while read -r file; do
  out="${file%.tar.zst.enc}"
  rm -rf "$out"
  mkdir -p "$out"
  openssl enc -d -aes-256-cbc -pbkdf2 -pass env:PASSWORD -in "$file" |
    zstd -d |
    tar -xf - -C "$out"
  rm -f $file
done

mv $TMP restore/data
