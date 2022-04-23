import { build } from "esbuild";
import fs from "fs";
import path from "path";

const rootPath = "./src/";
const distDir = "./dist";
const outDir = distDir + "/simple-lootsheet-5e";
const outDirStyles = outDir + "/styles";
const outDirScripts = outDir + "/scripts";
const outDirTemplates = outDir + "/templates";

// create dist directories
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir);
}

// create module structure for dist
if (!fs.existsSync(outDirStyles)) {
  fs.mkdirSync(outDirStyles);
}
if (!fs.existsSync(outDirScripts)) {
  fs.mkdirSync(outDirScripts);
}
if (!fs.existsSync(outDirTemplates)) {
  fs.mkdirSync(outDirTemplates);
}

// copy css
fs.copyFileSync(rootPath + "styles/main.css", outDir + "/styles/main.css");

// copy module.json
fs.copyFileSync(rootPath + "module.json", outDir + "/module.json");

// todo is this necessary? won't they be bundled by esbuild if they are imported?
// copy HTML templates
fs.copyFileSync(
  rootPath + "templates" + "/main.html",
  outDirTemplates + "/main.html"
);

// copy license
fs.copyFileSync("./LICENSE", outDir + "/LICENSE");

// build
const entry = path.join(rootPath, "scripts", "main.js");
build({
  entryPoints: [entry],
  bundle: true,
  minify: true,
  outdir: outDir + "/scripts",
}).catch(() => process.exit(1));
