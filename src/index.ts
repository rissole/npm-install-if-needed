import { execSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { readdir } from "fs/promises";
import { join } from "path";

const HASH_FILE = ".npm-install-hash";

function calculateFileHash(filePath: string): string {
  const content = readFileSync(filePath);
  return createHash("sha256").update(content).digest("hex");
}

async function calculateMetaHash(): Promise<string> {
  const hashes: string[] = [];

  // Add package.json hash
  if (existsSync("package.json")) {
    hashes.push(calculateFileHash("package.json"));
  }

  // Add package-lock.json hash
  if (existsSync("package-lock.json")) {
    hashes.push(calculateFileHash("package-lock.json"));
  }

  // Add all patch files hashes
  if (existsSync("patches")) {
    const patchFiles = await readdir("patches");
    for (const file of patchFiles) {
      const filePath = join("patches", file);
      hashes.push(calculateFileHash(filePath));
    }
  }

  // Create meta-hash from all individual hashes
  return createHash("sha256").update(hashes.sort().join("")).digest("hex");
}

async function writePackagesHash() {
  const currentHash = await calculateMetaHash();
  writeFileSync(HASH_FILE, currentHash);
  process.stdout.write(`Updated ${HASH_FILE} file\n`);
}

async function checkPackagesHash() {
  const currentHash = await calculateMetaHash();
  let shouldInstall = false;

  if (!existsSync(HASH_FILE)) {
    process.stdout.write("No hash file found, running npm install...\n");
    shouldInstall = true;
  } else {
    const storedHash = readFileSync(HASH_FILE, "utf-8").trim();
    if (storedHash !== currentHash) {
      process.stdout.write(
        "Package or patch files have changed, running npm install...\n",
      );
      shouldInstall = true;
    } else {
      process.stdout.write(
        "Package and patch files unchanged, skipping npm install\n",
      );
    }
  }

  if (shouldInstall) {
    execSync("npm install", { stdio: "inherit" });
  }
}

async function main() {
  try {
    const command = process.argv[2];

    switch (command) {
      case "check":
        await checkPackagesHash();
        break;
      case "write":
        await writePackagesHash();
        break;
      default:
        process.stderr.write(
          "Usage: packages-hash [check|write]\n" +
            "  check: Check if packages need to be reinstalled\n" +
            "  write: Write current package hash to file\n",
        );
        process.exit(1);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Error: ${errorMessage}\n`);
    process.exit(1);
  }
}

void main();
