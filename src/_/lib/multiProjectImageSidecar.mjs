import path from "path";
import { fileURLToPath } from "url";
import { loadProjectTagVariantsFromFile } from "./projectTagVariants.mjs";

/** Call from `photo.11tydata.js` as: `export default multiProjectImageSidecar(import.meta.url);` */
export default function multiProjectImageSidecar(moduleUrl) {
  const filename = fileURLToPath(moduleUrl);
  const stem = path.basename(filename, ".11tydata.js");
  const mdPath = path.join(path.dirname(filename), `${stem}.md`);
  return {
    projectTagVariants: loadProjectTagVariantsFromFile(mdPath),
  };
}
