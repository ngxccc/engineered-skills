#!/usr/bin/env node

/**
 * Engineered Skills - Release Tag Helper
 * Interactive zero-dependency TUI for SemVer version calculation and tag creation.
 */

import { execSync } from "node:child_process";
import readline from "node:readline";

// ANSI Styling
const c = {
	reset: "\x1b[0m",
	bold: "\x1b[1m",
	dim: "\x1b[2m",
	cyan: "\x1b[36m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	red: "\x1b[31m",
	gray: "\x1b[90m",
};

function run(cmd, silent = false) {
	try {
		return execSync(cmd, {
			encoding: "utf8",
			stdio: silent ? "pipe" : ["pipe", "pipe", "pipe"],
		}).trim();
	} catch (err) {
		if (silent) return "";
		throw err;
	}
}

function parseCliArgs() {
	const args = process.argv.slice(2);
	const flags = {
		forceBump: null,
		autoPush: false,
		nonInteractive: false,
		dryRun: false,
		customVersion: "",
	};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg === "--patch" || arg === "-p") flags.forceBump = "patch";
		else if (arg === "--minor" || arg === "-m") flags.forceBump = "minor";
		else if (arg === "--major") flags.forceBump = "major";
		else if (arg === "--push") flags.autoPush = true;
		else if (arg === "--yes" || arg === "-y") flags.nonInteractive = true;
		else if (arg === "--dry-run" || arg === "-n") flags.dryRun = true;
		else if (arg === "--custom" && i + 1 < args.length) {
			flags.customVersion = args[++i];
		} else if (arg === "--help" || arg === "-h") {
			console.log(`
${c.bold}Usage:${c.reset} node scripts/release.mjs [options]

${c.bold}Options:${c.reset}
  --patch, -p      Force patch version bump (e.g. v1.0.0 -> v1.0.1)
  --minor, -m      Force minor version bump (e.g. v1.0.0 -> v1.1.0)
  --major          Force major version bump (e.g. v1.0.0 -> v2.0.0)
  --custom <ver>   Specify custom version directly (e.g. v1.2.3)
  --push           Automatically push created tag to origin
  --yes, -y        Accept recommended version without interactive prompt
  --dry-run, -n    Preview version calculation without creating tag
  --help, -h       Show this help message
`);
			process.exit(0);
		}
	}
	return flags;
}

async function selectMenu(title, options, defaultIndex = 0) {
	if (!process.stdin.isTTY) {
		return options[defaultIndex].value;
	}

	let currentIndex = defaultIndex;
	let linesRendered = 0;

	readline.emitKeypressEvents(process.stdin);
	process.stdin.setRawMode(true);
	process.stdout.write("\x1b[?25l"); // Hide cursor

	const render = () => {
		// Clear previous lines
		if (linesRendered > 0) {
			process.stdout.write(`\x1b[${linesRendered}A\r\x1b[0J`);
		}

		let output = `${c.bold}${title}${c.reset}\n`;
		for (let i = 0; i < options.length; i++) {
			const opt = options[i];
			const isSelected = i === currentIndex;
			const pointer = isSelected ? `${c.cyan}❯${c.reset}` : " ";
			const label = isSelected
				? `${c.cyan}${c.bold}${opt.label}${c.reset}`
				: opt.label;
			let hint = "";
			if (opt.hint) {
				if (opt.isSuggested) {
					hint = ` ${c.yellow}${c.bold}(${opt.hint})${c.reset}`;
				} else if (isSelected) {
					hint = ` ${c.cyan}(${opt.hint})${c.reset}`;
				} else {
					hint = ` \x1b[38;5;250m(${opt.hint})${c.reset}`;
				}
			}
			output += `  ${pointer} ${label}${hint}\n`;
		}
		output += `  ${c.dim}${c.cyan}(Use ↑/↓ or j/k to navigate, Enter to select)${c.reset}\n`;
		linesRendered = options.length + 2;
		process.stdout.write(output);
	};

	render();

	return new Promise((resolve) => {
		const onKeypress = (str, key) => {
			if (key.ctrl && key.name === "c") {
				cleanup();
				console.log(`\n${c.red}✖ Release cancelled.${c.reset}`);
				process.exit(0);
			}

			if (key.name === "up" || key.name === "k") {
				currentIndex = (currentIndex - 1 + options.length) % options.length;
				render();
			} else if (key.name === "down" || key.name === "j") {
				currentIndex = (currentIndex + 1) % options.length;
				render();
			} else if (key.name === "return" || key.name === "enter") {
				cleanup();
				resolve(options[currentIndex].value);
			}
		};

		function cleanup() {
			process.stdin.removeListener("keypress", onKeypress);
			process.stdin.setRawMode(false);
			process.stdout.write("\x1b[?25h"); // Show cursor
		}

		process.stdin.on("keypress", onKeypress);
	});
}

async function promptText(question, defaultValue = "") {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			rl.close();
			resolve(answer.trim() || defaultValue);
		});
	});
}

async function main() {
	const flags = parseCliArgs();

	// Check clean working tree
	const uncommitted = run("git status --porcelain -uno", true);
	if (uncommitted && !flags.dryRun && !flags.nonInteractive) {
		console.log(
			`${c.yellow}▲ Warning: Working tree has uncommitted changes.${c.reset}`,
		);
		if (process.stdin.isTTY) {
			const proceed = await promptText("Continue anyway? [y/N]: ");
			if (!proceed.toLowerCase().startsWith("y")) {
				console.log(`${c.red}Release aborted.${c.reset}`);
				process.exit(1);
			}
		}
	}

	// Detect latest tag
	const latestTag = run("git describe --tags --abbrev=0 2>/dev/null", true);

	// Get commit log
	const logCmd = latestTag
		? `git log "${latestTag}..HEAD" --oneline`
		: "git log --oneline";
	const logOutput = run(logCmd, true);
	const commitLines = logOutput ? logOutput.split("\n").filter(Boolean) : [];

	if (latestTag && commitLines.length === 0) {
		console.log(
			`${c.yellow}▲ No new commits found since tag ${latestTag}. Working tree is up to date.${c.reset}`,
		);
		process.exit(0);
	}

	// Parse Conventional Commits
	let breakingCount = 0;
	let featCount = 0;
	let fixCount = 0;
	let otherCount = 0;

	for (const line of commitLines) {
		const msg = line.replace(/^[a-f0-9]+\s+/, "");
		if (/BREAKING[\s_]CHANGE:|^[a-zA-Z0-9_]+!:/.test(msg)) {
			breakingCount++;
		} else if (/^feat(\([^\)]+\))?:/.test(msg)) {
			featCount++;
		} else if (/^fix(\([^\)]+\))?:/.test(msg)) {
			fixCount++;
		} else {
			otherCount++;
		}
	}

	// Parse SemVer components
	let major = 0;
	let minor = 0;
	let patch = 0;

	if (latestTag) {
		const clean = latestTag.replace(/^v/, "");
		const parts = clean.split(".");
		major = parseInt(parts[0], 10) || 0;
		minor = parseInt(parts[1], 10) || 0;
		patch = parseInt(parts[2], 10) || 0;
	}

	const patchVer = `v${major}.${minor}.${patch + 1}`;
	const minorVer = `v${major}.${minor + 1}.0`;
	const majorVer = `v${major + 1}.0.0`;

	let recommendedVer = latestTag ? patchVer : "v1.0.0";
	let recommendedReason = "patch bump";

	if (!latestTag) {
		recommendedVer = "v1.0.0";
		recommendedReason = "initial release";
	} else if (breakingCount > 0) {
		recommendedVer = majorVer;
		recommendedReason = `major (${breakingCount} breaking change(s))`;
	} else if (featCount > 0) {
		recommendedVer = minorVer;
		recommendedReason = `minor (${featCount} feature(s))`;
	} else {
		recommendedVer = patchVer;
		recommendedReason = `patch (${fixCount} fix(es), ${otherCount} other)`;
	}

	// Print Summary Banner
	console.log(
		`\n${c.cyan}${c.bold}✦ ENGINEERED SKILLS - RELEASE TAG HELPER${c.reset}`,
	);
	console.log(
		`${c.dim}${c.cyan}────────────────────────────────────────${c.reset}`,
	);
	console.log(
		`Latest Tag:    ${latestTag ? `${c.bold}${latestTag}${c.reset}` : `${c.yellow}(none - repository unversioned)${c.reset}`}`,
	);
	console.log(
		`New Commits:   ${c.bold}${commitLines.length}${c.reset} total (${c.green}${featCount} feat${c.reset}, ${c.blue}${fixCount} fix${c.reset}, ${c.red}${breakingCount} breaking${c.reset}, \x1b[38;5;250m${otherCount} other${c.reset})`,
	);
	console.log(
		`Suggested Tag: ${c.green}${c.bold}${recommendedVer}${c.reset} ${c.yellow}${c.bold}[${recommendedReason}]${c.reset}`,
	);
	console.log(
		`${c.dim}${c.cyan}────────────────────────────────────────${c.reset}\n`,
	);

	let chosenVersion = recommendedVer;

	if (flags.customVersion) {
		chosenVersion = flags.customVersion.startsWith("v")
			? flags.customVersion
			: `v${flags.customVersion}`;
	} else if (flags.forceBump === "major") {
		chosenVersion = majorVer;
	} else if (flags.forceBump === "minor") {
		chosenVersion = minorVer;
	} else if (flags.forceBump === "patch") {
		chosenVersion = patchVer;
	} else if (flags.nonInteractive || !process.stdin.isTTY) {
		chosenVersion = recommendedVer;
	} else {
		const menuOptions = [
			{
				label: recommendedVer,
				hint: `Suggested - ${recommendedReason}`,
				isSuggested: true,
				value: recommendedVer,
			},
			{ label: patchVer, hint: "Patch", value: patchVer },
			{ label: minorVer, hint: "Minor", value: minorVer },
			{ label: majorVer, hint: "Major", value: majorVer },
			{
				label: "Custom version...",
				hint: "Enter manually",
				value: "__CUSTOM__",
			},
			{ label: "Cancel", hint: "Abort release", value: "__CANCEL__" },
		];

		const selected = await selectMenu(
			"Select version to release:",
			menuOptions,
			0,
		);

		if (selected === "__CANCEL__") {
			console.log(`\n${c.gray}Release cancelled.${c.reset}`);
			process.exit(0);
		}

		if (selected === "__CUSTOM__") {
			const customInput = await promptText("Enter custom tag (e.g. v1.2.3): ");
			chosenVersion = customInput.startsWith("v")
				? customInput
				: `v${customInput}`;
		} else {
			chosenVersion = selected;
		}

		if (!flags.autoPush) {
			const pushAnswer = await promptText(
				`\nPush tag ${c.bold}${chosenVersion}${c.reset} to origin remote? [y/N]: `,
			);
			if (pushAnswer.toLowerCase().startsWith("y")) {
				flags.autoPush = true;
			}
		}
	}

	if (flags.dryRun) {
		console.log(
			`\n${c.yellow}ℹ [DRY RUN] Would create git tag '${c.bold}${chosenVersion}${c.yellow}' (push: ${flags.autoPush}). No changes made.${c.reset}\n`,
		);
		process.exit(0);
	}

	console.log(`\n${c.cyan}✦ Creating git tag ${chosenVersion}...${c.reset}`);
	run(`git tag -a "${chosenVersion}" -m "Release ${chosenVersion}"`);

	if (flags.autoPush) {
		console.log(
			`${c.cyan}✦ Pushing tag ${chosenVersion} to origin remote...${c.reset}`,
		);
		run(`git push origin "${chosenVersion}"`);
		console.log(
			`\n${c.green}✓ Successfully created and pushed ${c.bold}${chosenVersion}${c.green} to origin!${c.reset}`,
		);
		console.log(
			`${c.gray}GitHub Actions release workflow triggered.${c.reset}\n`,
		);
	} else {
		console.log(
			`\n${c.green}✓ Successfully created local git tag ${c.bold}${chosenVersion}${c.green}.${c.reset}`,
		);
		console.log(
			`To push and trigger CI release, run:\n  ${c.cyan}git push origin ${chosenVersion}${c.reset}\n`,
		);
	}
}

main().catch((err) => {
	console.error(`\n${c.red}✖ Error:${c.reset}`, err.message);
	process.exit(1);
});
