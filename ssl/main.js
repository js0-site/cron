#!/usr/bin/env bun

import cdn from "./cdn.js";
import { X509Certificate } from "crypto";
import retry from "@3-/retry";
import Freessl from "@3-/ssl/Freessl.js";
import { FREESSL } from "../conf/KEY.js";
import DOMAIN from "../conf/DOMAIN.js";
import R from "./R.js";
import DNS from "./DNS.js";

const NOW = new Date(),
  ssl = Freessl(...FREESSL),
  gen = retry(async (dns, domain) => {
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
    console.log(dns, domain);
    const { set, rm } = await DNS[dns](domain),
      key_crt = await ssl(
        domain,
        (prefix, val) => set("TXT", prefix, val, 60),
        rm,
      );
    await R.set(r_key, JSON.stringify(key_crt), { EX: 7776e3 });
    await cdn(domain, key_crt);
  }),
  genAll = async () => {
    let err_count = 0;
    for (const [dns, domain_li] of Object.entries(DOMAIN)) {
      for (const domain of domain_li) {
        try {
          await gen(dns, domain);
        } catch (e) {
          ++err_count;
          console.error(dns, domain, e);
        }
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
