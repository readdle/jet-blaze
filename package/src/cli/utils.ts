import { mkdir, readdir, readFile, writeFile } from "fs/promises";
import { join, parse } from "path";
import { existsSync } from "fs";

export type FileTransformationContext = {
  content: string;
};

export type Transformer = (context: FileTransformationContext) => string;

const fileNameMaps: Record<string, string> = {
  "gitignore.txt": ".gitignore",
};

// Function to copy directory recursively
export async function copyDirectoryWithTransformation(
  src: string,
  dest: string,
  transformer: Transformer,
): Promise<void> {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, fileNameMaps[entry.name] || entry.name);

    if (entry.isDirectory()) {
      await copyDirectoryWithTransformation(srcPath, destPath, transformer);
    } else {
      const content = await readFile(srcPath, "utf-8");
      const context: FileTransformationContext = {
        content,
      };
      const newContent = transformer(context);
      await writeFile(destPath, newContent);
    }
  }
}

export function removeExtension(filename: string) {
  const pathParsed = parse(filename);
  return join(pathParsed.dir, pathParsed.name);
}

export function getModuleFilePath(
  projectRoot: string,
  ops: { readonly moduleFilePath?: string },
) {
  const moduleFilename =
    ops.moduleFilePath ||
    join(projectRoot, "src", "composition-root", "main-module.ts");

  if (!existsSync(moduleFilename)) {
    console.error(
      `Module file '${moduleFilename}' does not exist. Use -m option to specify the file`,
    );
    process.exit(1);
  } else {
    return moduleFilename;
  }
}
