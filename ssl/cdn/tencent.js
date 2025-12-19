#!/usr/bin/env bun

import ROOT from "../../ROOT.js";
import confLi from "@3-/conf_li";
import { join } from "node:path";
import TencentSsl from "@3-/tencent_ssl";

const SITE_API = new Map();

await confLi(join(ROOT, "conf/tencent"), (conf) => {
  const site_li = conf.pop(),
    api = TencentSsl(...conf);

  site_li.forEach((site) => {
    SITE_API.set(site, api);
  });
});

export default (domain, [key, cert]) => {
  const set = SITE_API.get(domain);
  if (!set) return;
  return set(domain, key, cert);
};
