#!/usr/bin/env bun

import ROOT from "../../ROOT.js";
import confLi from "@3-/conf_li";
import { join } from "node:path";

export default async ([name, Api]) => {
  const site_api = new Map();

  await confLi(join(ROOT, "conf/" + name), ([conf, site_li]) => {
    const api = Api(conf);

    site_li.forEach((site) => {
      site_api.set(site, api);
    });
  });

  return (domain, key_crt) => {
    const set = site_api.get(domain);

    if (!set) return;

    return set(key_crt);
  };
};
