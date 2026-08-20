#!/usr/bin/env node

/**
 * Git Flow Health & Branch Naming Validator
 * Verifies clean working directory state and branch naming convention.
 */

import { execSync } from "node:child_process";

const ALLOWED_PREFIXES = [
	"feature/",
	"fix/",
	"hotfix/",
	"core/",
	"docs/",
	"patch/",
	"chore/",
	"refactor/",
];

function checkGitHealth() {
	try {
		const branch = execSync("git rev-parse --abbrev-ref HEAD", {
			encoding: "utf8",
		}).trim();
		console.log(`Current active branch: ${branch}`);

		// Check branch naming convention unless on main/master
		if (branch !== "main" && branch !== "master") {
			const isValid = ALLOWED_PREFIXES.some((prefix) =>
				branch.startsWith(prefix),
			);
			if (!isValid) {
				console.warn(
					`Warning: Branch "${branch}" does not follow recommended prefix conventions (${ALLOWED_PREFIXES.join(", ")}).`,
				);
			} else {
				console.log(`Branch naming convention OK (${branch}).`);
			}
		}

		// Check status
		const status = execSync("git status --porcelain", {
			encoding: "utf8",
		}).trim();
		if (status) {
			const lineCount = status.split("\n").length;
			console.log(`Working directory has ${lineCount} uncommitted change(s).`);
		} else {
			console.log("Working directory is clean.");
		}
	} catch (e) {
		console.error("Failed to run git health check:", e.message);
		process.exit(1);
	}
}

checkGitHealth();
