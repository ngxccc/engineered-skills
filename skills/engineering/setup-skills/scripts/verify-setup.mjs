#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.argv[2] || process.cwd());

const REQUIRED_STANDARDS = [
	"issue-tracker.md",
	"domain-docs.md",
	"code-review.md",
	"code-comment-taxonomy.md",
	"api-design-and-error-handling.md",
	"database-and-migrations.md",
	"concurrency-and-locking.md",
	"testing-and-fixtures.md",
	"security-and-cryptography.md",
	"git-flow-and-pr-matrix.md",
];

const errors = [];
const warnings = [];

// 1. Instruction file (AGENTS.md or CLAUDE.md)
const instructionCandidates = ["AGENTS.md", "CLAUDE.md"];
const instructionFile = instructionCandidates.find((name) =>
	existsSync(join(root, name)),
);

let instructionContent = "";
if (!instructionFile) {
	errors.push("Missing AGENTS.md or CLAUDE.md at repo root.");
} else {
	instructionContent = readFileSync(join(root, instructionFile), "utf8");
	if (!instructionContent.includes("## Engineering Standards")) {
		errors.push(
			`${instructionFile}: missing '## Engineering Standards' section.`,
		);
	}
}

// 2. docs/standards/*.md files + instruction file pointers
const standardsDir = join(root, "docs", "standards");
if (!existsSync(standardsDir)) {
	errors.push("Missing docs/standards/ directory.");
} else {
	for (const file of REQUIRED_STANDARDS) {
		const fullPath = join(standardsDir, file);
		if (!existsSync(fullPath)) {
			errors.push(`Missing docs/standards/${file}`);
			continue;
		}
		const size = statSync(fullPath).size;
		if (size === 0) {
			errors.push(`Empty file: docs/standards/${file}`);
		}
		if (
			instructionContent &&
			!instructionContent.includes(`docs/standards/${file}`)
		) {
			errors.push(
				`${instructionFile}: missing pointer to docs/standards/${file}`,
			);
		}
	}
}

// 3. Domain glossary (single-context GLOSSARY.md or multi-context GLOSSARY-MAP.md)
const hasGlossary =
	existsSync(join(root, "GLOSSARY.md")) ||
	existsSync(join(root, "GLOSSARY-MAP.md"));
if (!hasGlossary) {
	errors.push("Missing GLOSSARY.md or GLOSSARY-MAP.md at repo root.");
}

// 4. GitHub issue templates if issue-tracker.md targets GitHub
const trackerPath = join(standardsDir, "issue-tracker.md");
if (existsSync(trackerPath)) {
	const trackerText = readFileSync(trackerPath, "utf8");
	if (/\bgithub\b/i.test(trackerText)) {
		const templateDir = join(root, ".github", "ISSUE_TEMPLATE");
		if (!existsSync(templateDir) || readdirSync(templateDir).length === 0) {
			warnings.push(
				"docs/standards/issue-tracker.md references GitHub, but .github/ISSUE_TEMPLATE/ is missing or empty.",
			);
		}
	}
}

if (warnings.length > 0) {
	console.warn("Warnings:");
	for (const w of warnings) console.warn(`  - ${w}`);
}

if (errors.length > 0) {
	console.error("Setup verification failed:");
	for (const e of errors) console.error(`  - ${e}`);
	process.exit(1);
}

console.log(
	`Setup verified (${instructionFile}, ${REQUIRED_STANDARDS.length} standards in docs/standards/, domain glossary present).`,
);
