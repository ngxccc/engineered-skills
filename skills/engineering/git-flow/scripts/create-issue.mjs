#!/usr/bin/env node

/**
 * Enterprise GitHub Issue Generator & Validator Script
 * Supports Task (Tracer-bullet vertical slice), Bug Report, and Feature Proposal.
 * Enforces Conventional Commits title format, single-noun body schema, and handles
 * GitHub Native Sub-Issues linking automatically.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const VALID_ISSUE_TYPES = ["task", "bug", "feature", "feat", "fix"];

const CONVENTIONAL_TYPES = [
	"task",
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
		type: "task",
		title: "",
		scope: "",
		summary: "",
		body: "",
		bodyFile: "",
		parent: "",
		blockedBy: "",
		labels: [],
		assignees: [],
		execute: false,
		printBody: false,
		validateOnly: false,
	};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg === "--type" && args[i + 1]) params.type = args[++i].toLowerCase();
		else if (arg === "--title" && args[i + 1]) params.title = args[++i];
		else if (arg === "--scope" && args[i + 1]) params.scope = args[++i];
		else if (arg === "--summary" && args[i + 1]) params.summary = args[++i];
		else if (arg === "--body" && args[i + 1]) params.body = args[++i];
		else if (arg === "--body-file" && args[i + 1]) params.bodyFile = args[++i];
		else if (arg === "--parent" && args[i + 1])
			params.parent = args[++i].replace(/^#/, "");
		else if (arg === "--blocked-by" && args[i + 1])
			params.blockedBy = args[++i].replace(/^#/, "");
		else if (arg === "--label" && args[i + 1]) {
			params.labels.push(...args[++i].split(",").map((l) => l.trim()));
		} else if (arg === "--assignee" && args[i + 1]) {
			params.assignees.push(...args[++i].split(",").map((a) => a.trim()));
		} else if (arg === "--execute") params.execute = true;
		else if (arg === "--print-body") params.printBody = true;
		else if (arg === "--validate-only") params.validateOnly = true;
	}

	if (params.bodyFile && existsSync(params.bodyFile)) {
		params.body = readFileSync(params.bodyFile, "utf8");
	}

	if (!VALID_ISSUE_TYPES.includes(params.type)) {
		console.error(
			`Error: Unknown issue type '${params.type}'. Allowed types: task, bug, feature`,
		);
		process.exit(1);
	}

	// Normalize alias types
	if (params.type === "feat") params.type = "feature";
	if (params.type === "fix") params.type = "bug";
	return params;
}

function validateTitle(params) {
	let title = params.title.trim();

	// Construct title from parts if not explicitly provided
	if (!title && params.summary) {
		const prefix =
			params.type === "bug"
				? "fix"
				: params.type === "feature"
					? "feat"
					: "task";
		const scopePart = params.scope ? `(${params.scope.trim()})` : "";
		title = `${prefix}${scopePart}: ${params.summary.trim()}`;
	}

	if (!title) {
		console.error(
			"Error: Issue title is required (--title '<type>(<scope>): <summary>' or --summary '<text>')",
		);
		process.exit(1);
	}

	// Prohibit emoji in title
	const emojiRegex = /(\p{Extended_Pictographic}|\uFE0F)/u;
	if (emojiRegex.test(title)) {
		console.error("Error: Emojis are strictly prohibited in issue titles.");
		process.exit(1);
	}

	// Conventional Commit title validation
	const titleRegex = /^([a-z0-9_-]+)(\([a-z0-9_.-]+\))?(!)?:\s+([a-z0-9].+)$/i;
	const match = title.match(titleRegex);

	if (!match) {
		console.error(
			`Error: Title "${title}" does not adhere to Conventional Commit specification.`,
		);
		console.error(
			"Format must match: <type>(<scope>): <summary> or <type>: <summary>",
		);
		process.exit(1);
	}

	const [, type] = match;
	if (!CONVENTIONAL_TYPES.includes(type.toLowerCase())) {
		console.error(
			`Error: Unknown issue commit type '${type}'. Allowed types: ${CONVENTIONAL_TYPES.join(", ")}`,
		);
		process.exit(1);
	}

	if (title.length > 72) {
		console.warn(
			`Warning: Issue title length (${title.length} chars) exceeds recommended limit of 72 chars.`,
		);
	}

	return title;
}

function getTemplateForType(type, params) {
	if (type === "task") {
		const parentRef = params.parent ? `#${params.parent}` : "None";
		const blockedRef = params.blockedBy ? `#${params.blockedBy}` : "None";
		return `## Context

- Parent: ${parentRef}
- Blocked by: ${blockedRef}

## Scope

${params.summary || "Concise description of the end-to-end behavior delivered by this ticket from the user/system perspective."}

## Acceptance

- [ ] Core implementation completes and satisfies vertical slice
- [ ] Manual or automated verification passes
`;
	}

	if (type === "bug") {
		return `## Summary

${params.summary || "Clear and concise description of the bug and what was expected to happen instead."}

## Reproduction

1. Step 1
2. Step 2
3. Observed error or unexpected behavior

## Environment

- OS / Runtime / Package version:
- Relevant log output or error stack trace:
`;
	}

	// feature
	return `## Summary

${params.summary || "Motivation and problem statement: why is this capability needed?"}

## Proposal

High-level architecture and implementation approach.

## Context

- ADR / RFC: None
- Alternatives considered / trade-offs:
`;
}

function validateBody(body, type) {
	const errors = [];
	const warnings = [];

	const hasHeading = (h) => new RegExp(`^#{1,3}\\s+${h}\\b`, "im").test(body);

	if (type === "task") {
		const required = ["Context", "Scope", "Acceptance"];
		for (const sec of required) {
			if (!hasHeading(sec)) {
				errors.push(`Missing required section: '## ${sec}'`);
			}
		}
		if (hasHeading("Context")) {
			const hasParent = /Parent:\s*(#\d+|none)/i.test(body);
			const hasBlocked = /Blocked by:\s*(#\d+|none)/i.test(body);
			if (!hasParent || !hasBlocked) {
				warnings.push(
					"Section '## Context' should specify '- Parent: #<id> | None' and '- Blocked by: #<id> | None'.",
				);
			}
		}
	} else if (type === "bug") {
		const required = ["Summary", "Reproduction", "Environment"];
		for (const sec of required) {
			if (!hasHeading(sec)) {
				errors.push(`Missing required section: '## ${sec}'`);
			}
		}
	} else if (type === "feature") {
		const required = ["Summary", "Proposal", "Context"];
		for (const sec of required) {
			if (!hasHeading(sec)) {
				errors.push(`Missing required section: '## ${sec}'`);
			}
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
	};
}

function linkSubIssue(parentNumber, childNumber) {
	try {
		// Get repo owner and name
		const repoInfo = JSON.parse(
			execFileSync("gh", ["repo", "view", "--json", "owner,name"], {
				encoding: "utf8",
			}),
		);
		const owner = repoInfo.owner.login;
		const repo = repoInfo.name;

		// Fetch child integer DB ID
		const childIdStr = execFileSync(
			"gh",
			["api", `repos/${owner}/${repo}/issues/${childNumber}`, "--jq", ".id"],
			{ encoding: "utf8" },
		).trim();

		if (!childIdStr) {
			console.warn(
				`Warning: Could not resolve database ID for child issue #${childNumber}.`,
			);
			return false;
		}

		// Link child issue to parent via GitHub Native Sub-Issues API
		execFileSync(
			"gh",
			[
				"api",
				"--method",
				"POST",
				`repos/${owner}/${repo}/issues/${parentNumber}/sub_issues`,
				"-F",
				`sub_issue_id=${childIdStr}`,
			],
			{ encoding: "utf8" },
		);

		console.log(
			`🔗 Successfully linked child issue #${childNumber} to parent #${parentNumber} via Native Sub-Issues API.`,
		);
		return true;
	} catch (e) {
		console.warn(
			`Warning: Failed to link sub-issue to parent #${parentNumber}: ${e.message}`,
		);
		return false;
	}
}

function main() {
	const params = parseArgs();
	const title = validateTitle(params);

	let body = params.body;
	if (!body) {
		body = getTemplateForType(params.type, params);
	}

	const validation = validateBody(body, params.type);

	console.log("Issue Validation Summary:");
	console.log(`- Type: ${params.type}`);
	console.log(`- Title: "${title}"`);
	if (params.parent) console.log(`- Parent Issue: #${params.parent}`);
	if (params.blockedBy) console.log(`- Blocked By: #${params.blockedBy}`);

	if (params.printBody) {
		console.log("\n--- Issue Body Template ---");
		console.log(body.trim());
		console.log("---------------------------\n");
	}

	if (validation.warnings.length > 0) {
		console.log("\nValidation Warnings:");
		for (const w of validation.warnings) {
			console.log(`  - [WARN] ${w}`);
		}
	}

	if (!validation.isValid) {
		console.error("\nIssue Body Errors:");
		for (const e of validation.errors) {
			console.error(`  - ${e}`);
		}
		console.error(
			"\nValidation failed. Fix the issue body errors before proceeding.",
		);
		process.exit(1);
	}

	console.log(
		`- Body Structure: Valid (Passed single-noun layout checks for ${params.type})`,
	);
	console.log("\nValidation passed successfully.");

	if (params.validateOnly) {
		return;
	}

	if (!params.execute) {
		console.log(
			"\n[DRY RUN] Issue validation passed. Pass '--execute' to create the issue on GitHub.",
		);
		return;
	}

	// Ensure default type label if none provided
	const labels = [...params.labels];
	if (!labels.some((l) => l.startsWith("type:"))) {
		labels.push(
			`type:${params.type === "feature" ? "feat" : params.type === "bug" ? "bug" : "task"}`,
		);
	}

	const ghArgs = ["issue", "create", "--title", title, "--body", body];

	if (labels.length > 0) {
		ghArgs.push("--label", labels.join(","));
	}

	for (const a of params.assignees) {
		ghArgs.push("--assignee", a);
	}

	console.log(`Executing: gh ${ghArgs.join(" ")}`);
	try {
		const output = execFileSync("gh", ghArgs, { encoding: "utf8" });
		console.log(output);

		// Extract created issue number from output URL (e.g. https://github.com/owner/repo/issues/12)
		const match = output.match(/\/issues\/(\d+)/);
		if (match && params.parent) {
			const childNumber = match[1];
			linkSubIssue(params.parent, childNumber);
		}
	} catch (e) {
		console.error("Failed to execute gh issue create:", e.message);
		process.exit(1);
	}
}

main();
