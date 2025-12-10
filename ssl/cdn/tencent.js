#!/usr/bin/env bun

import ROOT from "../../ROOT.js";
import confLi from "@3-/conf_li";
import { join } from "node:path";
import TencentSsl from "@3-/tencent_ssl";
import all from "@3-/all";

const LI = await confLi(join(ROOT, "conf/tencent"), (conf) =>
  TencentSsl(...conf),
);

export default (domain, [key, cert]) =>
  all(LI.map((set) => set(domain, key, cert)));
