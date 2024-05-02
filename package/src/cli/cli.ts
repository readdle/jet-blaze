#!/usr/bin/env node

import { camelCase, kebabCase, pascalCase } from "change-case";
import { Command, Option } from "commander";
import { existsSync, realpathSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import path, { dirname } from "path";
import packageJson from "../../package.json";
import { createEjsTransformer } from "./ejs-transformer";

if (!process.argv[1]) {
  console.error("Wrong script path", process.argv[1]);
  process.exit(1);
}

const scriptPath = realpathSync(process.argv[1]);

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
        const templatesPath = path.join(
          dirname(scriptPath),
          "templates",
          "service",
        );
        const mainTemplate = path.join(templatesPath, "service.ejs");

        if (ops.path) {
          await mkdir(ops.path, { recursive: true });
        }
        const servicesPath =
          ops.path || path.join(process.cwd(), "src", "services");
        const srcPath = ops.path || path.join(process.cwd(), "src");
        const targetDir = existsSync(servicesPath)
          ? servicesPath
          : existsSync(srcPath)
            ? srcPath
            : process.cwd();
        await mkdir(targetDir, { recursive: true });
        const targetFilePath = path.join(targetDir, `${dashServiceName}.ts`);
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
        const templatesPath = path.join(
          dirname(scriptPath),
          "templates",
          "component",
        );
        const mainTemplate = path.join(templatesPath, "main.ejs");
        const viewTemplate = path.join(templatesPath, "view.ejs");
        const testTemplate = path.join(templatesPath, "test.ejs");
        const keyTemplate = path.join(templatesPath, "controller-key.ejs");

        if (ops.path) {
          await mkdir(ops.path, { recursive: true });
        }
        const componentsPath =
          ops.path || path.join(process.cwd(), "src", "components");
        const componentsDir = existsSync(componentsPath)
          ? componentsPath
          : process.cwd();

        const targetDir = path.join(componentsDir, pascalCaseComponentName);
        await mkdir(targetDir, { recursive: true });
        const targetViewFilePath = path.join(
          targetDir,
          `${pascalCaseComponentName}View.tsx`,
        );
        const targetComponentFilePath = path.join(
          targetDir,
          `${pascalCaseComponentName}.ts`,
        );
        const targetTestsFilePath = path.join(
          targetDir,
          `${pascalCaseComponentName}.test.ts`,
        );
        const targetComponentKeyFilePath = path.join(
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

        console.log(
          `Component '${pascalCaseComponentName}' has created at '${targetDir}'`,
        );
      }),
  );

program.parse(process.argv);
