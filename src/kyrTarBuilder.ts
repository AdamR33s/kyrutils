import { Dirent } from "fs";
import { zstdCompress } from "node:zlib";
import { promisify } from "node:util";
import * as tar from "tar";
import fs from "fs/promises";
import path from "path";

/**
 * The options object for config of 'buildTar'
 */
export type TarBuildOptions = {
  dataDir?: string;
  prismaDir?: string;
  webServerDir?: string;
  additionalDirs?: string[];
  overrideEnv: boolean;
};

const baseDir = "./";
const distDir = "./dist";
const sudoArchDir = "./sudoTarZst";

async function walkDir(
  dir: string,
  filter?: (relativePath: string, dirEnt: Dirent<string>) => boolean,
  fileList: string[] = [],
): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const relativePath = path.join(dir, entry.name);
    if (filter && !filter(relativePath, entry)) continue;
    if (entry.isDirectory()) {
      await walkDir(relativePath, filter, fileList);
    } else {
      fileList.push(relativePath);
    }
  }
  return fileList;
}

/**
 * Build a .tar and .tar.zst archive for "typical" npm/node projects for server uploads (suggested project structure found in readme.md). Use the 'TarBuildOptions' class to walk a list of dirs (some preset, and an optional list arguement). The walkDir function will accept an arrow filter of type boolean.
 * @param dataDir Suggested additional dir for static project data files such as YAML
 * @param prismaDir Suggested additional dir for static prisma data files such as schema
 * @param webServerDir Suggested additional dir for static WebServer data files such as css, templates etc.
 * @param additionalDirs List any extra dirs for filterless collection of everything contained
 * @param overrideEnv Collect any .env file from the project base dir
 * @returns Void - A .tar and a .tar.zst will be written into the base project dir as `project.tar` & `project.tar.zst` respectively
 */
export async function buildTar(buildTarOptions: TarBuildOptions): Promise<void> {
  await fs.rm(sudoArchDir, { recursive: true, force: true });
  await fs.mkdir(sudoArchDir, { recursive: true });

  const projFiles = await walkDir(baseDir, (path, dirEnt) => {
    if (dirEnt.isDirectory() && dirEnt.name === "node_modules") return false;
    if (dirEnt.name.toLowerCase().includes(`deploy`)) return false;
    if (dirEnt.isFile() && dirEnt.name.toLocaleLowerCase().includes(`package`)) return true;
    if (buildTarOptions.overrideEnv) {
      if (dirEnt.isFile() && dirEnt.name.includes(`.env`)) return true;
    }
    return false;
  });
  for (const filePath of projFiles) {
    const fileName = path.relative(baseDir, filePath);
    const targetPath = path.join(sudoArchDir, fileName);
    await fs.cp(filePath, targetPath);
  }

  const distFiles = await walkDir(distDir, (path, dirEnt) => !dirEnt.name.toLowerCase().includes(`deploy`));
  for (const filePath of distFiles) {
    const fileName = path.relative(distDir, filePath);
    const targetPath = path.join(sudoArchDir, fileName);
    await fs.cp(filePath, targetPath);
  }
  if (buildTarOptions.dataDir !== undefined) {
    const dataFiles = await walkDir(buildTarOptions.dataDir);
    for (const filePath of dataFiles) {
      const fileName = path.relative(buildTarOptions.dataDir, filePath);
      const targetPath = path.join(sudoArchDir, `data`, fileName);
      await fs.cp(filePath, targetPath);
    }
  }
  if (buildTarOptions.prismaDir !== undefined) {
    const prismaFiles = await walkDir(buildTarOptions.prismaDir);
    for (const filePath of prismaFiles) {
      const fileName = path.relative(buildTarOptions.prismaDir, filePath);
      const targetPath = path.join(sudoArchDir, `prisma`, fileName);
      await fs.cp(filePath, targetPath);
    }
  }
  if (buildTarOptions.webServerDir !== undefined) {
    const webServerFiles = await walkDir(
      buildTarOptions.webServerDir,
      (path, dirEnt) => !dirEnt.name.toLowerCase().endsWith(`.ts`),
    );
    for (const filePath of webServerFiles) {
      const sectionFileName = path.relative(buildTarOptions.webServerDir, filePath);
      const targetPath = path.join(sudoArchDir, sectionFileName);
      await fs.cp(filePath, targetPath);
    }
  }
  if (buildTarOptions.additionalDirs !== undefined) {
    for (const dir of buildTarOptions.additionalDirs) {
      const additionalCollection = await walkDir(dir);
      for (const filePath of additionalCollection) {
        const sectionFileName = path.relative(baseDir, filePath);
        const targetPath = path.join(sudoArchDir, sectionFileName);
        await fs.cp(filePath, targetPath);
      }
    }
  }

  await walkDir(sudoArchDir);
  await tar.create(
    {
      file: "project.tar",
      cwd: sudoArchDir,
    },
    ["."],
  );
  const tarFile = await fs.readFile(`./project.tar`);
  const tarZstFile = await promisify(zstdCompress)(tarFile);
  await fs.writeFile(`project.tar.zst`, tarZstFile);
}
