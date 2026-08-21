#!/usr/bin/env node

/**
 * Enterprise PR Generator & Validator Script
 * Supports 3-Tier PR Matrix (Tier 1 Patch, Tier 2 Standard, Tier 3 Enterprise Kernel-Grade).
 * Validates PR title, body, Conventional Commits format, and strict emoji prohibition.
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONVENTIONAL_TYPES = [
	"feat",
	"fix",
	"refactor",
	"perf",
	"test",
	"docs",
	"chore",
	"style",
	"ci",
	"build",
	"core",
	"security",
];

function parseArgs() {
	const args = process.argv.slice(2);
	const params = {
		tier: 2,
		title: "",
		type: "",
		scope: "",
		body: "",
		adr: "",
		rfc: "",
		draft: false,
		base: "main",
		labels: [],
		assignees: [],
		execute: false,
		printBody: false,
	};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg === "--tier" && args[i + 1])
			params.tier = Number.parseInt(args[++i], 10);
		else if (arg === "--title" && args[i + 1]) params.title = args[++i];
		else if (arg === "--type" && args[i + 1]) params.type = args[++i];
		else if (arg === "--scope" && args[i + 1]) params.scope = args[++i];
		else if (arg === "--body" && args[i + 1]) params.body = args[++i];
		else if (arg === "--adr" && args[i + 1]) params.adr = args[++i];
		else if (arg === "--rfc" && args[i + 1]) params.rfc = args[++i];
		else if (arg === "--draft") params.draft = true;
		else if (arg === "--base" && args[i + 1]) params.base = args[++i];
		else if (arg === "--label" && args[i + 1]) params.labels.push(args[++i]);
		else if (arg === "--assignee" && args[i + 1])
			params.assignees.push(args[++i]);
		else if (arg === "--execute") params.execute = true;
		else if (arg === "--print-body") params.printBody = true;
	}

	return params;
}

function validateTitle(params) {
	let title = params.title;
	if (!title && params.type) {
		title = params.scope
			? `${params.type}(${params.scope}): `
			: `${params.type}: `;
	}

	if (!title) {
		console.error(
			'Error: PR Title is required (use --title "type(scope): summary").',
		);
		process.exit(1);
	}

	// Check for emojis or non-ASCII icon characters
	const emojiRegex =
		/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
	if (emojiRegex.test(title)) {
		console.error(
			"Error: Emojis are strictly prohibited in enterprise PR titles.",
		);
		process.exit(1);
	}

	const conventionalTypesPattern = CONVENTIONAL_TYPES.join("|");
	const conventionalRegex = new RegExp(
		`^(${conventionalTypesPattern})(\\([a-z0-9_.\\/-]+\\))?!?: .+`,
	);
	if (!conventionalRegex.test(title)) {
		console.warn(
			"Warning: Title does not match Conventional Commits format (<type>(<scope>): <summary>).",
		);
	}

	return title;
}

function getTemplateForTier(tier) {
	// 1. Check if the active repository defines a custom PULL_REQUEST_TEMPLATE.md
	const projectPrTemplate = join(
		process.cwd(),
		".github",
		"PULL_REQUEST_TEMPLATE.md",
	);
	if (tier === 2 && existsSync(projectPrTemplate)) {
		return readFileSync(projectPrTemplate, "utf8");
	}

	// 2. Fallback to skill-bundled 3-Tier PR Matrix templates
	const referencesDir = join(__dirname, "..", "references");
	let templateFileName = "pr-tier2-standard.md";
	if (tier === 1) templateFileName = "pr-tier1-patch.md";
	else if (tier === 3) templateFileName = "pr-tier3-enterprise.md";

	const templatePath = join(referencesDir, templateFileName);
	if (existsSync(templatePath)) {
		return readFileSync(templatePath, "utf8");
	}
	return "";
}

function main() {
	const params = parseArgs();
	const title = validateTitle(params);

	if (params.tier === 3 && !params.adr && !params.rfc) {
		console.warn(
			"Warning: Tier 3 Enterprise PR should reference an ADR (--adr docs/adr/NNNN-slug.md) or RFC (--rfc docs/rfc/NNNN-slug.md).",
		);
	}

	const templateBody = getTemplateForTier(params.tier);

	console.log(`PR Validation Summary:`);
	console.log(`- Tier: Tier ${params.tier}`);
	console.log(`- Title: "${title}"`);
	console.log(`- Base Branch: ${params.base}`);
	if (params.labels.length)
		console.log(`- Labels: ${params.labels.join(", ")}`);
	if (params.assignees.length)
		console.log(`- Assignees: ${params.assignees.join(", ")}`);

	if (params.printBody) {
		console.log("\n--- PR Body Template ---");
		console.log(params.body || templateBody);
		console.log("------------------------");
	}

	if (params.execute) {
		try {
			let cmd = `gh pr create --title "${title}" --body "${params.body || "See PR description"}" --base "${params.base}"`;
			if (params.draft) cmd += " --draft";
			for (const l of params.labels) cmd += ` --label "${l}"`;
			for (const a of params.assignees) cmd += ` --assignee "${a}"`;
			console.log(`Executing: ${cmd}`);
			const output = execSync(cmd, { encoding: "utf8" });
			console.log(output);
		} catch (e) {
			console.error("Failed to execute gh pr create:", e.message);
		}
	}
}

main();
