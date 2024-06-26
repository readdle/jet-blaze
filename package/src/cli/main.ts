#!/usr/bin/env node

import { Option, program } from "commander";
import enquirer from "enquirer";
import { dirname, join } from "path";
import { realpath } from "fs/promises";
import { createEjsTransformer } from "./ejs-transformer";
import { copyDirectoryWithTransformation } from "./utils";

program
  .argument("[appName]", "App name")
  .addOption(
    new Option("-t, --template <template>", "Project template")
      .choices(["simple", "general"])
      .default("general"),
  )
  .action((appName, ops) => {
    main(appName, ops.template).catch((err) => console.error(err));
  });

program.parse(process.argv);

function isValidNpmPackageName(name: string): boolean {
  const validNpmNameRegex =
    /^(?![_\.])(?!.*[\/\\])([a-z0-9][a-z0-9\._-]{0,213})$/;
  return validNpmNameRegex.test(name);
}

type PromptResponse = {
  readonly appName: string;
};

async function promptForAppName(): Promise<string> {
  const response = await enquirer.prompt<PromptResponse>({
    type: "input",
    name: "appName",
    message: "What is the name of your app?",
    validate(value) {
      if (value.length === 0) {
        return "App name cannot be empty.";
      } else if (!isValidNpmPackageName(value)) {
        return "Invalid app name. Follow npm package naming conventions.";
      }
      return true;
    },
  });

  return response.appName;
}

async function main(projectName: string, template: string): Promise<void> {
  if (!process.argv[1]) {
    console.error("Wrong script path", process.argv[1]);
    process.exit(1);
  }
  const scriptPath = await realpath(process.argv[1]);

  if (!projectName || !isValidNpmPackageName(projectName)) {
    projectName = await promptForAppName();
  }

  const templatesPath = join(dirname(scriptPath), "templates", template);
  const projectDir = join(process.cwd(), projectName);
  console.log(
    `Creating application '${projectName}' based on template ${templatesPath} in ${projectDir}...`,
  );
  await copyDirectoryWithTransformation(
    templatesPath,
    projectDir,
    createEjsTransformer({ projectName }),
  );
}
