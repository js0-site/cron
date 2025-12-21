import Api from "./cdn/Api.js";
import all from "@3-/all";
import tencent from "@3-/tencent_ssl";
import ali from "@3-/alissl";

const LI = await Promise.all(Object.entries({ ali, tencent }).map(Api));

export default (domain, key_cert) =>
  all(LI.map((set) => set(domain, key_cert)));
