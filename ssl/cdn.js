import tencent from "./cdn/tencent.js";
import all from "@3-/all";

const LI = [tencent];

export default (domain, key_cert) =>
  all(LI.map((set) => set(domain, key_cert)));
