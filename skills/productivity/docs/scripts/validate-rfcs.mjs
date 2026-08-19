#!/usr/bin/env bun
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

const primaryRfcDir = path.resolve("docs/rfc");
const fallbackRfcDir = path.resolve("second-brain/Docs/RFCs");
const rfcDir = fs.existsSync(primaryRfcDir)
	? primaryRfcDir
	: fs.existsSync(fallbackRfcDir)
		? fallbackRfcDir
		: primaryRfcDir;
let failures = 0;

function logError(file, message) {
	console.error(`${colors.red}FAIL:${colors.reset} [${file}] ${message}`);
	failures++;
}

function logSuccess(file, message) {
	console.log(`${colors.green}PASS:${colors.reset} [${file}] ${message}`);
}

if (!fs.existsSync(rfcDir)) {
	fs.mkdirSync(rfcDir, { recursive: true });
}

const files = fs.readdirSync(rfcDir).filter((f) => f.endsWith(".md"));

if (files.length === 0) {
	console.log(
		`${colors.yellow}Warning: No RFC files found in docs/rfc.${colors.reset}`,
	);
	process.exit(0);
}

console.log(
	`${colors.cyan}Auditing ${files.length} Request for Comments (RFCs)...${colors.reset}\n`,
);

const requiredSections = [
	{ title: "Summary", heading: "## Summary" },
	{ title: "Context & Motivation", heading: "## Context & Motivation" },
	{ title: "Detailed Proposal", heading: "## Detailed Proposal" },
	{ title: "Drawbacks & Alternatives", heading: "## Drawbacks & Alternatives" },
	{ title: "Unresolved Questions", heading: "## Unresolved Questions" },
];

for (const file of files) {
	const filePath = path.join(rfcDir, file);
	const content = fs.readFileSync(filePath, "utf-8");
	const currentFileFailures = failures;

	// 1. Check filename format (e.g. 0001-some-proposal.md)
	const fileRegex = /^(\d{4})-(.+)\.md$/;
	const fileMatch = file.match(fileRegex);
	if (!fileMatch) {
		logError(
			file,
			"Filename must match standard 4-digit prefix pattern, e.g., '0001-some-proposal.md'",
		);
		continue;
	}

	const fileNum = parseInt(fileMatch[1], 10);

	// 2. Check Level 1 Heading matches the number
	const lines = content.split("\n");
	const firstLine = lines[0] ? lines[0].trim() : "";
	const h1Regex = /^#\s+(\d+)\.\s+(.+)$/;
	const h1Match = firstLine.match(h1Regex);

	if (!h1Match) {
		logError(
			file,
			"File must start with a level 1 heading in format '# <Number>. <Title>'",
		);
		continue;
	}

	const headingNum = parseInt(h1Match[1], 10);
	if (fileNum !== headingNum) {
		logError(
			file,
			`RFC number mismatch: filename specifies '${fileNum}' but H1 specifies '${headingNum}'`,
		);
	}

	// 3. Check Metadata
	const dateRegex = /^Date:\s+\d{4}-\d{2}-\d{2}/m;
	if (!dateRegex.test(content)) {
		logError(
			file,
			"Missing or invalid Date format. Must contain 'Date: YYYY-MM-DD'",
		);
	}

	const statusRegex =
		/^Status:\s+(Draft|Under Review|Approved|Rejected|Superseded by .+)/m;
	if (!statusRegex.test(content)) {
		logError(
			file,
			"Missing or invalid Status format. Must be 'Draft | Under Review | Approved | Rejected | Superseded by...'",
		);
	}

	// 4. Check Required Sections
	for (const sec of requiredSections) {
		if (!content.includes(sec.heading)) {
			logError(file, `Missing required section heading '${sec.heading}'`);
		}
	}

	if (failures === currentFileFailures) {
		logSuccess(file, `Valid RFC structure (RFC #${headingNum})`);
	}
}

console.log("\n----------------------------------------");
if (failures > 0) {
	console.error(
		`\n${colors.red}${colors.bold}Audit failed with ${failures} error(s).${colors.reset}`,
	);
	process.exit(1);
} else {
	console.log(
		`\n${colors.green}${colors.bold}All RFCs passed validation cleanly.${colors.reset}`,
	);
	process.exit(0);
}
