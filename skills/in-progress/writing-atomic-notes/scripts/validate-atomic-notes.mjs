#!/usr/bin/env bun
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const targetArg = process.argv[2];
const currentDir = process.cwd();

// Find root of the vault (containing 99_Meta/Scripts/validate_notes.mjs)
let vaultRoot = currentDir;
while (
	vaultRoot !== "/" &&
	!fs.existsSync(path.join(vaultRoot, "99_Meta/Scripts/validate_notes.mjs"))
) {
	vaultRoot = path.dirname(vaultRoot);
}

const validatorScript = path.join(
	vaultRoot,
	"99_Meta/Scripts/validate_notes.mjs",
);

if (!fs.existsSync(validatorScript)) {
	console.error(
		`\x1b[31mError: Could not locate 99_Meta/Scripts/validate_notes.mjs starting from ${currentDir}\x1b[0m`,
	);
	process.exit(1);
}

const args = targetArg ? [validatorScript, targetArg] : [validatorScript];
const result = spawnSync("bun", args, {
	cwd: vaultRoot,
	stdio: "inherit",
});

process.exit(result.status ?? 0);
