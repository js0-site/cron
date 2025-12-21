#!/usr/bin/env bun

import CONF from "../conf/HW.js";
import Hw from "@js0.site/edns/Hw.js";
import LI from "../conf/cname_flatten.js";
const set = Hw(CONF);

for (const args of LI) {
  console.log(args[0]);
  await set(...args);
}
