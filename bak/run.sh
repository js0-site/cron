#!/usr/bin/env bash

set -e
DIR=$(realpath $0) && DIR=${DIR%/*}
cd $DIR
set -x

bun i

if [ -d nix.vps ]; then
  cd nix.vps
  git pull
  cd ..
else
  git clone --depth=1 $(dirname $(git config --get remote.origin.url) | sed 's#https://github.com/#git@github.com:#')/nix.vps.git
  chmod 600 ./nix.vps/ssh/*
fi

set +x
set -a
. ./nix.vps/disk/etc/kvrocks/conf.sh
. ../conf/bak.env
set +a
set -x

TODAY=$(date +%F)

ghnew() {
  gh release create $TODAY -n .
}

ghnew || (gh release delete $TODAY -y && ghnew)

bun kvrocks.js

./clear_bak.sh
