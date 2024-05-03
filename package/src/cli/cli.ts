#!/usr/bin/env node

import { camelCase, kebabCase, pascalCase } from "change-case";
import { Command, Option } from "commander";
import { existsSync, realpathSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import path, { dirname, join, relative } from "path";
import packageJson from "../../package.json";
import { createEjsTransformer } from "./ejs-transformer";
import { patchDIRegistration } from "./patch-di-registartions";
import { removeExtension } from "./utils";

if (!process.argv[1]) {
  console.error("Wrong script path", process.argv[1]);
  process.exit(1);
}

const scriptPath = realpathSync(process.argv[1]);

// Determine the nearest package.json path starting from process.cwd()
let projectRoot = process.cwd();
while (!existsSync(join(projectRoot, "package.json"))) {
  projectRoot = dirname(projectRoot);
  if (projectRoot === "/") {
    console.error("Cannot determine project root directory");
    process.exit(1);
  }
}

const program = new Command();
program
  .name("jet-blaze-cli")
  .description("Jet Blaze application CLI")
  .version(packageJson.version);

program
  .command("create")
  .addCommand(
    new Command("service")
      .description("Create a service")
      .argument("<ServiceName>", "Service name")
      .addOption(
        new Option(
          "-p, --path <servicesPath>",
          "Directory to create service in",
        ),
      )
      .action(async (serviceName, ops) => {
        const inputServiceName = serviceName;
        const dashServiceName = kebabCase(inputServiceName);
        const pascalCaseServiceName = pascalCase(inputServiceName);
        const camelCaseServiceName = camelCase(inputServiceName);
        const transformer = createEjsTransformer({
          serviceName: pascalCaseServiceName,
          serviceNameCamelCase: camelCaseServiceName,
        });
        const templatesPath = join(dirname(scriptPath), "templates", "service");
        const mainTemplate = join(templatesPath, "service.ejs");

        if (ops.path) {
          await mkdir(ops.path, { recursive: true });
        }
        const servicesPath = ops.path || join(projectRoot, "src", "services");
        const srcPath = ops.path || join(projectRoot, "src");
        const targetDir = existsSync(servicesPath)
          ? servicesPath
          : existsSync(srcPath)
            ? srcPath
            : projectRoot;
        await mkdir(targetDir, { recursive: true });
        const targetFilePath = join(targetDir, `${dashServiceName}.ts`);
        await writeFile(
          targetFilePath,
          transformer({ content: await readFile(mainTemplate, "utf-8") }),
        );
        console.log(
          `Service '${pascalCaseServiceName}' has created at '${targetFilePath}'`,
        );
      }),
  )
  .addCommand(
    new Command("component")
      .description("Create a component")
      .argument("<ComponentName>", "Component name")
      .addOption(
        new Option(
          "-p, --path <componentsPath>",
          "Directory to create component in",
        ),
      )
      .addOption(
        new Option(
          "-m, --module-file-path <moduleFilePath>",
          "File with DI module that should contain the component registration",
        ),
      )
      .action(async (componentName, ops) => {
        const inputComponentName = componentName;
        const pascalCaseComponentName = pascalCase(inputComponentName);
        const camelCaseComponentName = camelCase(inputComponentName);
        const kebabCaseComponentName = kebabCase(inputComponentName);
        const transformer = createEjsTransformer({
          componentName: pascalCaseComponentName,
          componentNameCamelCase: camelCaseComponentName,
          kebabCaseComponentName: kebabCaseComponentName,
        });
        const templatesPath = join(
          dirname(scriptPath),
          "templates",
          "component",
        );
        const mainTemplate = join(templatesPath, "main.ejs");
        const viewTemplate = join(templatesPath, "view.ejs");
        const testTemplate = join(templatesPath, "test.ejs");
        const keyTemplate = join(templatesPath, "controller-key.ejs");

        const moduleFilename =
          ops.moduleFilePath ||
          join(projectRoot, "src", "composition-root", "main-module.ts");
        if (!existsSync(moduleFilename)) {
          console.error(
            `Module file '${moduleFilename}' does not exist. Use -m option to specify the file`,
          );
          process.exit(1);
        }

        if (ops.path) {
          await mkdir(ops.path, { recursive: true });
        }
        const componentsPath =
          ops.path || join(projectRoot, "src", "components");
        const componentsDir = existsSync(componentsPath)
          ? componentsPath
          : projectRoot;

        const targetDir = join(componentsDir, pascalCaseComponentName);
        await mkdir(targetDir, { recursive: true });
        const targetViewFilePath = join(
          targetDir,
          `${pascalCaseComponentName}View.tsx`,
        );
        const targetComponentFilePath = join(
          targetDir,
          `${pascalCaseComponentName}.ts`,
        );
        const targetTestsFilePath = join(
          targetDir,
          `${pascalCaseComponentName}.test.ts`,
        );
        const targetComponentKeyFilePath = join(
          targetDir,
          `${kebabCaseComponentName}-controller-key.ts`,
        );
        await writeFile(
          targetComponentFilePath,
          transformer({ content: await readFile(mainTemplate, "utf-8") }),
        );
        await writeFile(
          targetViewFilePath,
          transformer({ content: await readFile(viewTemplate, "utf-8") }),
        );
        await writeFile(
          targetTestsFilePath,
          transformer({ content: await readFile(testTemplate, "utf-8") }),
        );
        await writeFile(
          targetComponentKeyFilePath,
          transformer({ content: await readFile(keyTemplate, "utf-8") }),
        );

        const code = await patchDIRegistration({
          code: await readFile(moduleFilename, "utf-8"),
          targetComponentFilePath: removeExtension(
            relative(path.dirname(moduleFilename), targetComponentFilePath),
          ),
          targetComponentKeyFilePath: removeExtension(
            relative(path.dirname(moduleFilename), targetComponentKeyFilePath),
          ),
          componentNameCamelCase: camelCaseComponentName,
          pascalCaseComponentName,
        });

        await writeFile(moduleFilename, code);

        console.log(
          `Component '${pascalCaseComponentName}' has created at '${targetDir}'`,
        );
      }),
  );

program.parse(process.argv);
