#!/usr/bin/env bun

import Redis from "@3-/ioredis";
import int from "@3-/int";
import sleep from "@3-/sleep";
import { $ } from "zx";
import { join } from "node:path";
import { mkdtemp, rm } from "node:fs/promises";
import write from "@3-/write";

const { R_NODE, R_SENTINEL_NAME, R_PASSWORD, R_SENTINEL_PASSWORD, PASSWORD } =
    process.env,
  redisConn = (conf = {}) =>
    Redis({
      sentinels: R_NODE.split(" ").map((i) => {
        const [host, port] = i.split(":");
        return { host, port: int(port) };
      }),
      password: R_PASSWORD,
      sentinelPassword: R_SENTINEL_PASSWORD,
      name: R_SENTINEL_NAME,
      ...conf,
    }),
  MASTER_HOST = new Map(
    (await redisConn({ role: "slave" }).info("replication"))
      .trimEnd()
      .split("\n")
      .slice(1)
      .map((i) => i.trim().split(":")),
  ).get("master_host");

await (async () => {
  const redis = redisConn();
  let retry = 0,
    p = redis.pipeline();
  p.lastsave();
  p.bgsave();
  const [[_, lastsave]] = await p.exec();
  while (++retry < 900) {
    if ((await redis.lastsave()) > lastsave) break;
    await sleep(1e3);
    console.log(retry, "wait for bgsave");
  }

  await redis.bgsave();

  const ssh_config = "/tmp/kvrocks.ssh_config",
    fname = "/tmp/kvrocks.tar.zst.enc",
    today = new Date().toISOString().slice(0, 10);
  write(
    ssh_config,
    `
Host *
StrictHostKeyChecking accept-new

Host kvrocks
HostName ${MASTER_HOST}
User root`,
  );

  await $`ssh -F ${ssh_config} -o ConnectTimeout=10 -o BatchMode=yes kvrocks bash -c '"nix-shell -p openssl zstd gnutar --run \\"export PASSWORD=${PASSWORD} && set -ex && cd /var/lib/kvrocks && tar --remove-files -C backup -cf - . | zstd -18 -T0 | openssl enc -aes-256-cbc -pbkdf2 -salt -pass env:PASSWORD -out ${fname} && set +x\\""'`.pipe(
    process.stdout,
  );
  $.verbose = 1;
  await $`rsync --remove-source-files -e 'ssh -F ${ssh_config}' -avz kvrocks:${fname} ${fname} && gh release create bak.${today} --notes . && gh release upload bak.${today} ${fname}`;
})();

process.exit();
