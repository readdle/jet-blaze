import { mkdir, readdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

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
