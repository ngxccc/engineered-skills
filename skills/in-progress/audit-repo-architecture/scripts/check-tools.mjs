#!/usr/bin/env node

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function isCommandAvailable(cmd) {
	try {
		execSync(`which ${cmd} 2>/dev/null`, { stdio: "ignore" });
		return true;
	} catch {
		return false;
	}
}

function checkExecutablePath(p) {
	return fs.existsSync(p);
}

console.log("===============================================================");
console.log(" AUDIT REPO ARCHITECTURE - TOOL PRE-FLIGHT CAPABILITY CHECK");
console.log(
	"===============================================================\n",
);

const homedir = process.env.HOME || "/home/ngxc";
const cbmPath = path.join(homedir, ".local/bin/codebase-memory-mcp");

const toolSuite = [
	{
		name: "Codebase Memory MCP (CBM)",
		cmd: isCommandAvailable("codebase-memory-mcp")
			? "codebase-memory-mcp"
			: checkExecutablePath(cbmPath)
				? cbmPath
				: null,
		suite: "Suite A: Semantic Graph & Cross-Service",
		npxAlternative:
			"npx -y codebase-memory-mcp cli <tool> <args> (or bunx codebase-memory-mcp)",
		installCmd:
			"npm i -g codebase-memory-mcp   OR   pip install -U codebase-memory-mcp",
		bundledFallback:
			"Fallback to: ast-grep + madge + bundled scripts (audit-shared-gravity.mjs & detect-coupling.mjs)",
	},
	{
		name: "ast-grep (sg)",
		cmd: isCommandAvailable("ast-grep")
			? "ast-grep"
			: isCommandAvailable("sg")
				? "sg"
				: null,
		suite: "Suite A: Structural AST Seam Scanner",
		npxAlternative: "npx @ast-grep/cli <args> (or bunx @ast-grep/cli)",
		installCmd: "cargo install ast-grep --locked   OR   npm i -g @ast-grep/cli",
		bundledFallback: "node <skill-path>/scripts/audit-shared-gravity.mjs",
	},
	{
		name: "madge",
		cmd: isCommandAvailable("madge") ? "madge" : null,
		suite: "Suite A: Circular Dependency Detection",
		npxAlternative: "npx madge --circular --extensions ts,tsx,js,jsx <dir>",
		installCmd: "npm i -g madge   OR   bun add -g madge",
		bundledFallback: "Use CBM cycles aspect or dependency-cruiser",
	},
	{
		name: "dependency-cruiser (depcruise)",
		cmd: isCommandAvailable("depcruise")
			? "depcruise"
			: isCommandAvailable("dependency-cruiser")
				? "dependency-cruiser"
				: null,
		suite: "Suite A: Deep Module & Entry Point Linting",
		npxAlternative: "npx depcruise <target-dir>",
		installCmd:
			"npm i -D dependency-cruiser   OR   npm i -g dependency-cruiser",
		bundledFallback:
			"Trigger skill setup-ts-deep-modules to install with local config",
	},
	{
		name: "depcheck",
		cmd: isCommandAvailable("depcheck") ? "depcheck" : null,
		suite: "Suite B: Unused / Phantom Dependencies",
		npxAlternative: "npx depcheck",
		installCmd: "npm i -g depcheck",
		bundledFallback: "node <skill-path>/scripts/cross-check-triangulation.mjs",
	},
	{
		name: "syncpack",
		cmd: isCommandAvailable("syncpack") ? "syncpack" : null,
		suite: "Suite B: Monorepo Dependency Version Drift",
		npxAlternative: "npx syncpack list-mismatches",
		installCmd: "npm i -g syncpack",
		bundledFallback: "Inspect package.json files across workspace root",
	},
];

let installedCount = 0;
let missingCount = 0;

for (const tool of toolSuite) {
	if (tool.cmd) {
		installedCount++;
		console.log(`[OK] ${tool.name}`);
		console.log(`     Location: ${tool.cmd}`);
		console.log(`     Role:     ${tool.suite}\n`);
	} else {
		missingCount++;
		console.log(`[MISSING] ${tool.name}`);
		console.log(`     Role:         ${tool.suite}`);
		if (tool.npxAlternative) {
			console.log(`     NPX Shortcut: ${tool.npxAlternative}`);
		}
		console.log(`     Install:      ${tool.installCmd}`);
		console.log(`     Fallback:     ${tool.bundledFallback}\n`);
	}
}

console.log("---------------------------------------------------------------");
console.log(`Summary: ${installedCount} installed, ${missingCount} missing.`);
if (missingCount > 0) {
	console.log("Tip: You do NOT need to install missing tools globally.");
	console.log(
		"     Run via `npx <tool>` or rely on the zero-dependency bundled scripts.",
	);
}
console.log(
	"---------------------------------------------------------------\n",
);
