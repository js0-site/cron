#!/usr/bin/env bun

import sshConfig from "@3-/ssh_config";
import RSYNC from "../conf/RSYNC.js";
import { $ } from "zx";

$.verbose = true;

await (async () => {
  const ssh_config = sshConfig(RSYNC);
  let err_count = 0;

  for (const [name] of RSYNC) {
    try {
      await $`rsync -avz --exclude='.*' -e 'ssh -F ${ssh_config}' ssl ${name}:/opt/`;
    } catch (e) {
      ++err_count;
      console.error(name, e);
    }
  }
  process.exit(err_count);
})();
