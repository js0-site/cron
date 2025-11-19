#!/usr/bin/env bash

DIR=$(realpath $0) && DIR=${DIR%/*}
cd $DIR
set -ex

NAME=$(basename $(dirname $DIR))

case $(uname -s) in
Linux*)
  podman-compose -p $NAME up -d
  cleanup() {
    echo "正在执行清理操作..."
    podman-compose down
    echo "所有服务已关闭。"
  }
  trap cleanup EXIT
  podman-compose logs -f

  ;;
*)
  docker-compose -p $NAME up
  ;;
esac
