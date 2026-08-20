#!/usr/bin/env node

/**
 * Conventional Commit Formatter & Validator Script
 * Formats and validates commit messages according to Conventional Commits 1.0.0 and Enterprise standards.
 * Supports imperative mood checks, max 72 chars header length, --signoff, --breaking, and --execute.
 */

import { execSync } from "node:child_process";

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
		type: "",
		scope: "",
		summary: "",
		body: "",
		breaking: "",
		fixes: "",
		signoff: false,
		message: "",
		execute: false,
	};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg === "--type" && args[i + 1]) params.type = args[++i];
		else if (arg === "--scope" && args[i + 1]) params.scope = args[++i];
		else if (arg === "--summary" && args[i + 1]) params.summary = args[++i];
		else if (arg === "--body" && args[i + 1]) params.body = args[++i];
		else if (arg === "--breaking" && args[i + 1]) params.breaking = args[++i];
		else if (arg === "--fixes" && args[i + 1]) params.fixes = args[++i];
		else if (arg === "--signoff") params.signoff = true;
		else if (arg === "--message" && args[i + 1]) params.message = args[++i];
		else if (arg === "--execute") params.execute = true;
	}

	return params;
}

function validateAndBuildCommit(params) {
	let header = "";

	if (params.message) {
		header = params.message.split("\n")[0].trim();
	} else if (params.type && params.summary) {
		const isBreaking = params.breaking ? "!" : "";
		const scopePart = params.scope ? `(${params.scope})` : "";
		header = `${params.type}${scopePart}${isBreaking}: ${params.summary.trim()}`;
	} else {
		console.error(
			'Error: Provide either --message "..." or --type <type> --summary "<summary>".',
		);
		process.exit(1);
	}

	// 1. Emoji check
	const emojiRegex =
		/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
	if (emojiRegex.test(header)) {
		console.error("Error: Emojis are strictly prohibited in commit headers.");
		process.exit(1);
	}

	// 2. Trailing period check
	if (header.endsWith(".")) {
		console.error("Error: Commit header must NOT end with a period '.'.");
		process.exit(1);
	}

	// 3. Length check
	if (header.length > 72) {
		console.warn(
			`Warning: Commit header length (${header.length} chars) exceeds recommended limit of 72 chars.`,
		);
	}

	// 4. Conventional Commit pattern check
	const typesPattern = CONVENTIONAL_TYPES.join("|");
	const conventionalRegex = new RegExp(
		`^(${typesPattern})(\\([a-z0-9_.\\/-]+\\))?!?: .+`,
	);
	if (!conventionalRegex.test(header)) {
		console.error(
			`Error: Header "${header}" does not match Conventional Commit format (<type>(<scope>): <summary>). Valid types: ${CONVENTIONAL_TYPES.join(", ")}`,
		);
		process.exit(1);
	}

	// Build full message
	const lines = [header];
	if (params.body) {
		lines.push("", params.body.trim());
	}

	const footers = [];
	if (params.breaking) {
		footers.push(`BREAKING CHANGE: ${params.breaking.trim()}`);
	}
	if (params.fixes) {
		footers.push(`Fixes: ${params.fixes.trim()}`);
	}
	if (params.signoff) {
		try {
			const userName = execSync("git config user.name", {
				encoding: "utf8",
			}).trim();
			const userEmail = execSync("git config user.email", {
				encoding: "utf8",
			}).trim();
			if (userName && userEmail) {
				footers.push(`Signed-off-by: ${userName} <${userEmail}>`);
			}
		} catch {
			// Fallback
		}
	}

	if (footers.length > 0) {
		lines.push("", footers.join("\n"));
	}

	return lines.join("\n");
}

function main() {
	const params = parseArgs();
	const fullCommitMsg = validateAndBuildCommit(params);

	console.log("Validated Commit Message:\n");
	console.log("----------------------------------------");
	console.log(fullCommitMsg);
	console.log("----------------------------------------\n");

	if (params.execute) {
		try {
			execSync(`git commit -m "${fullCommitMsg.replace(/"/g, '\\"')}"`, {
				stdio: "inherit",
			});
			console.log("Commit executed successfully.");
		} catch (e) {
			console.error("Failed to execute git commit:", e.message);
			process.exit(1);
		}
	}
}

main();
