const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");

async function copyDirectory(src: string, dest: string): Promise<void> {
  if (!fsSync.existsSync(dest)) {
    await fs.mkdir(dest, { recursive: true });
  }

  let entries = await fs.readdir(src, { withFileTypes: true });

  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);

    entry.isDirectory()
      ? await copyDirectory(srcPath, destPath)
      : await fs.copyFile(srcPath, destPath);
  }
}

async function main(): Promise<void> {
  console.log("post-build.ts");

  const packageJson = JSON.parse(await fs.readFile("./package.json", "utf-8"));
  const version = packageJson["version"];
  packageJson["main"] = "./lib/index.js";
  packageJson["module"] = "./es6/index.js";
  packageJson["typings"] = "./lib/index.d.ts";

  delete packageJson["scripts"];
  delete packageJson["devDependencies"];

  await fs.writeFile(
    "./dist/package.json",
    JSON.stringify(packageJson, null, 4),
  );
  await fs.copyFile("../LICENSE", "./dist/LICENSE");
  await fs.mkdir("./dist/di");
  await fs.copyFile("./src/core/di/package.json", "./dist/di/package.json");
  await fs.mkdir("./dist/di-react");
  await fs.copyFile(
    "./src/core/di-react/package.json",
    "./dist/di-react/package.json",
  );
  await fs.mkdir("./dist/connector");
  await fs.copyFile(
    "./src/core/connector/package.json",
    "./dist/connector/package.json",
  );
  await copyDirectory(
    "./src/cli/templates/component",
    "./dist/cli/templates/component",
  );
  await copyDirectory(
    "./src/cli/templates/service",
    "./dist/cli/templates/service",
  );

  const packageJsonCreateApp = JSON.parse(
    await fs.readFile("./src/cli/package.create-app.json", "utf-8"),
  );
  packageJsonCreateApp["version"] = version;
  await fs.writeFile(
    "./dist-create-app/package.json",
    JSON.stringify(packageJsonCreateApp, null, 4),
  );
  await fs.copyFile("../LICENSE", "./dist-create-app/LICENSE");
  await copyDirectory(
    "./src/cli/templates/simple",
    "./dist-create-app/templates/simple",
  );
  await copyDirectory(
    "./src/cli/templates/general",
    "./dist-create-app/templates/general",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
