#!/usr/bin/env bun

import cdn from "./cdn.js";
import { X509Certificate } from "crypto";
import Cf from "@3-/cf";
import Zone from "@3-/cf/Zone.js";
import retry from "@3-/retry";
import Freessl from "@3-/ssl/Freessl.js";
import { FREESSL } from "../conf/KEY.js";
import DOMAIN_LI from "../conf/DOMAIN_LI.js";
import R from "./R.js";

const NOW = new Date(),
  { CF_KEY, CF_MAIL } = process.env,
  CF = Cf(CF_KEY, CF_MAIL),
  ssl = Freessl(...FREESSL),
  gen = retry(async (domain) => {
    const r_key = "ssl:" + domain,
      exist = await R.get(r_key);
    if (exist) {
      try {
        const expire = new Date(
          new X509Certificate(JSON.parse(exist)[1]).validTo,
        );
        if ((expire - NOW) / 864e5 > 30) {
          console.log(domain, "expire", expire.toISOString().slice(0, 10));
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }
    console.log(domain);
    const { set, rmByName } = await Zone(CF, domain),
      key_crt = await ssl(
        domain,
        (prefix, val) => set("TXT", prefix, val, 60),
        rmByName,
      );
    await R.set(r_key, JSON.stringify(key_crt), { EX: 7776e3 });
    await cdn(domain, key_crt);
  }),
  genAll = async () => {
    let err_count = 0;
    for (const domain of DOMAIN_LI) {
      try {
        await gen(domain);
      } catch (e) {
        ++err_count;
        console.error(domain, e);
      }
    }
    return err_count;
  };

await (async () => {
  try {
    process.exit(await genAll());
  } finally {
    await R.close();
  }
})();
