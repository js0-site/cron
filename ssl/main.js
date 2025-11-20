#!/usr/bin/env bun

import int from "@3-/int";
import { X509Certificate } from "crypto";
import { existsSync } from "node:fs";
import { join } from "node:path";
import Cf from "@3-/cf";
import Zone from "@3-/cf/Zone.js";
import retry from "@3-/retry";
import Freessl from "@3-/ssl/Freessl.js";
import { FREESSL } from "../conf/KEY.js";
import write from "@3-/write";
import read from "@3-/read";
import DOMAIN_LI from "../conf/DOMAIN_LI.js";

const { CF_KEY, CF_MAIL } = process.env,
  CF = Cf(CF_KEY, CF_MAIL),
  ROOT = import.meta.dirname,
  ssl = Freessl(...FREESSL),
  gen = retry(async (domain, ssl_dir) => {
    console.log(domain);
    const { set, rmByName } = await Zone(CF, domain),
      [key, crt] = await ssl(
        domain,
        (prefix, val) => set("TXT", prefix, val, 60),
        rmByName,
      );
    Object.entries({ key, crt }).forEach(([k, v]) => {
      write(join(ssl_dir, k), v);
    });
  });

await (async () => {
  let err_count = 0;
  for (const domain of DOMAIN_LI) {
    try {
      const ssl_dir = join(ROOT, "ssl", domain),
        pk_fp = join(ssl_dir, "crt");
      if (existsSync(pk_fp)) {
        const pk = new X509Certificate(read(pk_fp)),
          remain = int((pk.validToDate - new Date()) / 864e5);
        if (remain > 81) {
          console.log(domain, "证书将在", remain, "天后过期");
        }
        continue;
      }
      await gen(domain, ssl_dir);
    } catch (e) {
      ++err_count;
      console.error(domain, e);
    }
  }
  process.exit(err_count);
})();
