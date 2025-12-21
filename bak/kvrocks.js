#!/usr/bin/env bun

import Redis from "@3-/ioredis";
import int from "@3-/int";
import sleep from "@3-/sleep";
import { $ } from "zx";
import write from "@3-/write";
import ghbak from "@3-/ghbak";

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
  await ghbak("kvrocks", MASTER_HOST, "/var/lib/kvrocks/backup");
})();

process.exit();
