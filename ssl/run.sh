#!/usr/bin/env bash

set -e
DIR=$(realpath $0) && DIR=${DIR%/*}
cd $DIR
set -a
. ../conf/cf.env
PATH=$(dirname $DIR)/bin:$PATH
set +a
set -x

clone_or_pull.sh git@atomgit.com:js0-ol/ssl.git

bun main.js

./rsync.js

cd ssl

git add . && git commit -m. && git push || true
