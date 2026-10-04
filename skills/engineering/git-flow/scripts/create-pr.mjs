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
		bodyFile: "",
		adr: "",
		rfc: "",
		draft: false,
		base: "main",
		labels: [],
		assignees: [],
		execute: false,
		printBody: false,
		validateOnly: false,
	};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg === "--tier" && args[i + 1])
			params.tier = Number.parseInt(args[++i], 10);
		else if (arg === "--title" && args[i + 1]) params.title = args[++i];
		else if (arg === "--type" && args[i + 1]) params.type = args[++i];
		else if (arg === "--scope" && args[i + 1]) params.scope = args[++i];
		else if (arg === "--body" && args[i + 1]) params.body = args[++i];
		else if (arg === "--body-file" && args[i + 1]) params.bodyFile = args[++i];
		else if (arg === "--adr" && args[i + 1]) params.adr = args[++i];
		else if (arg === "--rfc" && args[i + 1]) params.rfc = args[++i];
		else if (arg === "--draft") params.draft = true;
		else if (arg === "--base" && args[i + 1]) params.base = args[++i];
		else if (arg === "--label" && args[i + 1]) params.labels.push(args[++i]);
		else if (arg === "--assignee" && args[i + 1])
			params.assignees.push(args[++i]);
		else if (arg === "--execute") params.execute = true;
		else if (arg === "--print-body") params.printBody = true;
		else if (arg === "--validate-only") params.validateOnly = true;
	}

	if (params.bodyFile && existsSync(params.bodyFile)) {
		params.body = readFileSync(params.bodyFile, "utf8");
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
	const projectPrTemplate = join(
		process.cwd(),
		".github",
		"PULL_REQUEST_TEMPLATE.md",
	);
	if (tier === 2 && existsSync(projectPrTemplate)) {
		return readFileSync(projectPrTemplate, "utf8");
	}

	const referencesDir = join(__dirname, "..", "references");
	let templateFileName = "pr-tier2-standard.md";
	if (tier === 1) templateFileName = "pr-tier1-patch.md";
	else if (tier === 3) templateFileName = "pr-tier3-enterprise.md";

	const templatePath = join(referencesDir, templateFileName);
	if (existsSync(templatePath)) {
		const raw = readFileSync(templatePath, "utf8");
		const match = raw.match(/```markdown\n([\s\S]*?)\n```/);
		return match ? match[1] : raw;
	}
	return "";
}

function validateBody(body, tier) {
	const errors = [];
	const warnings = [];

	if (!body || !body.trim()) {
		return { isValid: false, errors: ["PR body is empty."], warnings };
	}

	const emojiRegex =
		/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
	if (emojiRegex.test(body)) {
		errors.push("Emojis are strictly prohibited in enterprise PR body.");
	}

	// Check for forbidden compound headings with '&'
	const lines = body.split("\n");
	for (const line of lines) {
		if (/^##\s+.*&.*/.test(line)) {
			errors.push(
				`Compound heading with '&' prohibited: "${line.trim()}". Use single-noun headings (## Summary, ## Context, ## Changes, ## Evidence, ## Risk, ## Checklist).`,
			);
		}
	}

	const hasHeading = (h) => new RegExp(`^##\\s+${h}\\b`, "im").test(body);

	if (tier === 1) {
		if (!hasHeading("Summary"))
			errors.push("Missing required section: '## Summary'");
		if (!hasHeading("Checklist"))
			errors.push("Missing required section: '## Checklist'");
	} else {
		// Tier 2 and Tier 3 require canonical 6 single-noun sections
		const canonicalSections = [
			"Summary",
			"Context",
			"Changes",
			"Evidence",
			"Risk",
			"Checklist",
		];
		for (const sec of canonicalSections) {
			if (!hasHeading(sec)) {
				errors.push(`Missing required section: '## ${sec}'`);
			}
		}

		// Check context section for issue linking
		if (hasHeading("Context")) {
			const hasLink = /(Resolves:|Relates to:|Fixes:|Closes:)\s*#\d+/i.test(
				body,
			);
			if (!hasLink) {
				warnings.push(
					"Section '## Context' should link an issue (Resolves: #<id> or Relates to: #<id>).",
				);
			}
		}

		// Check evidence section for Before and After
		if (hasHeading("Evidence")) {
			const hasBefore = /Before:/i.test(body);
			const hasAfter = /After:/i.test(body);
			if (!hasBefore || !hasAfter) {
				warnings.push(
					"Section '## Evidence' should include both 'Before:' and 'After:' evidence.",
				);
			}
		}

		// Check risk section for door
		if (hasHeading("Risk")) {
			const hasDoor = /Door:/i.test(body);
			if (!hasDoor) {
				warnings.push(
					"Section '## Risk' should specify 'Door:' (one-way or two-way).",
				);
			}
		}

		if (tier === 3) {
			const hasAdr = /(ADR|RFC):\s*`?docs\/(adr|rfc)\//i.test(body);
			if (!hasAdr) {
				errors.push(
					"Tier 3 Enterprise PR requires an ADR or RFC link in '## Context' (e.g. ADR: docs/adr/NNNN-slug.md).",
				);
			}
			const hasRollback = /Rollback/i.test(body);
			if (!hasRollback) {
				warnings.push(
					"Tier 3 Enterprise PR should explicitly document a 'Rollback:' strategy under '## Risk'.",
				);
			}
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
	};
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
	const prBody = params.body || templateBody;

	console.log(`PR Validation Summary:`);
	console.log(`- Tier: Tier ${params.tier}`);
	console.log(`- Title: "${title}"`);
	console.log(`- Base Branch: ${params.base}`);
	if (params.labels.length)
		console.log(`- Labels: ${params.labels.join(", ")}`);
	if (params.assignees.length)
		console.log(`- Assignees: ${params.assignees.join(", ")}`);

	// Validate PR body if body content is present
	if (prBody) {
		const bodyValidation = validateBody(prBody, params.tier);
		if (bodyValidation.warnings.length) {
			console.log("\nPR Body Warnings:");
			for (const w of bodyValidation.warnings) console.warn(`  - ${w}`);
		}
		if (!bodyValidation.isValid) {
			console.error("\nPR Body Errors:");
			for (const err of bodyValidation.errors) console.error(`  - ${err}`);
			if (params.execute || params.validateOnly) {
				console.error(
					"\nValidation failed. Fix the PR body errors before proceeding.",
				);
				process.exit(1);
			}
		} else {
			console.log(
				`- Body Structure: Valid (Passed single-noun layout checks for Tier ${params.tier})`,
			);
		}
	}

	if (params.printBody) {
		console.log("\n--- PR Body Template ---");
		console.log(prBody);
		console.log("------------------------");
	}

	if (params.validateOnly) {
		console.log("\nValidation passed successfully.");
		process.exit(0);
	}

	if (params.execute) {
		try {
			let cmd = `gh pr create --title "${title}" --body "${prBody}" --base "${params.base}"`;
			if (params.draft) cmd += " --draft";
			for (const l of params.labels) cmd += ` --label "${l}"`;
			for (const a of params.assignees) cmd += ` --assignee "${a}"`;
			console.log(`Executing: ${cmd}`);
			const output = execSync(cmd, { encoding: "utf8" });
			console.log(output);
		} catch (e) {
			console.error("Failed to execute gh pr create:", e.message);
			process.exit(1);
		}
	}
}

main();
