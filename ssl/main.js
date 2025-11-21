#!/usr/bin/env bun

// import { X509Certificate } from "crypto";
import Cf from "@3-/cf";
import Zone from "@3-/cf/Zone.js";
import retry from "@3-/retry";
import Freessl from "@3-/ssl/Freessl.js";
import { FREESSL } from "../conf/KEY.js";
import DOMAIN_LI from "../conf/DOMAIN_LI.js";
import R from "./R.js";

// ROOT = import.meta.dirname,
const { CF_KEY, CF_MAIL } = process.env,
  CF = Cf(CF_KEY, CF_MAIL),
  ssl = Freessl(...FREESSL),
  gen = retry(async (domain) => {
    console.log(domain);
    const { set, rmByName } = await Zone(CF, domain),
      [key, crt] = await ssl(
        domain,
        (prefix, val) => set("TXT", prefix, val, 60),
        rmByName,
      );
    await R.set("ssl:" + domain, JSON.stringify([key, crt]), { EX: 7776e3 });
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
