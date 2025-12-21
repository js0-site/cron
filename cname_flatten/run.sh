#!/usr/bin/env bash

set -e
DIR=$(realpath $0) && DIR=${DIR%/*}
cd $DIR
set -a
. ../conf/cf.env
PATH=$(dirname $DIR)/bin:$PATH
set +a
set -x

bun i

bun main.js
