#!/usr/bin/env bun
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const colors = {
	reset: "\x1b[0m",
	bold: "\x1b[1m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	cyan: "\x1b[36m",
};

const scriptsDir = path.dirname(new URL(import.meta.url).pathname);
const techScript = path.join(scriptsDir, "validate-technical-flashcards.mjs");
const engScript = path.join(scriptsDir, "validate-english-flashcards.mjs");

const targetArg = process.argv[2];

if (targetArg) {
	const resolved = path.resolve(targetArg);
	const isEnglish =
		resolved.includes("Vocabulary") || resolved.includes("Grammar");
	const scriptToRun = isEnglish ? engScript : techScript;
	const result = spawnSync("bun", [scriptToRun, targetArg], {
		stdio: "inherit",
	});
	process.exit(result.status ?? 0);
}

// If no target arg, run both audits across vault
console.log(
	`${colors.cyan}${colors.bold}=== UNIFIED FLASHCARD AUDIT SUITE ===${colors.reset}\n`,
);

console.log(
	`${colors.bold}--- 1. Auditing Technical & Conceptual Decks ---${colors.reset}`,
);
const techResult = spawnSync("bun", [techScript], { stdio: "inherit" });

console.log(
	`\n${colors.bold}--- 2. Auditing English SLA Decks (Vocabulary & Grammar) ---${colors.reset}`,
);
const engResult = spawnSync("bun", [engScript], { stdio: "inherit" });

const techExit = techResult.status ?? 0;
const engExit = engResult.status ?? 0;

if (techExit !== 0 || engExit !== 0) {
	console.error(
		`\n${colors.red}${colors.bold}Audit failed! (Technical: ${techExit === 0 ? "PASSED" : "FAILED"}, English: ${engExit === 0 ? "PASSED" : "FAILED"})${colors.reset}`,
	);
	process.exit(1);
} else {
	console.log(
		`\n${colors.green}${colors.bold}✓ All Flashcard Decks passed cleanly!${colors.reset}`,
	);
	process.exit(0);
}
