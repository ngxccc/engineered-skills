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

const primaryAdrDir = fs.existsSync(path.resolve("backend/docs/adr"))
	? path.resolve("backend/docs/adr")
	: path.resolve("docs/adr");
const fallbackAdrDir = path.resolve("second-brain/Docs/ADRs");
const adrDir = fs.existsSync(primaryAdrDir)
	? primaryAdrDir
	: fs.existsSync(fallbackAdrDir)
		? fallbackAdrDir
		: primaryAdrDir;
let failures = 0;

function logError(file, message) {
	console.error(`${colors.red}FAIL:${colors.reset} [${file}] ${message}`);
	failures++;
}

function logSuccess(file, message) {
	console.log(`${colors.green}PASS:${colors.reset} [${file}] ${message}`);
}

if (!fs.existsSync(adrDir)) {
	fs.mkdirSync(adrDir, { recursive: true });
}

const files = fs.readdirSync(adrDir).filter((f) => f.endsWith(".md"));

if (files.length === 0) {
	console.log(
		`${colors.yellow}No ADR files found in ${adrDir}.${colors.reset}`,
	);
	process.exit(0);
}

console.log(
	`${colors.cyan}Auditing ${files.length} Architectural Decision Records (ADRs)...${colors.reset}\n`,
);

for (const file of files) {
	const filePath = path.join(adrDir, file);
	const content = fs.readFileSync(filePath, "utf-8");
	const currentFileFailures = failures;

	// 1. Check filename format (e.g. 0001-some-decision.md)
	const fileRegex = /^(\d{4})-(.+)\.md$/;
	const fileMatch = file.match(fileRegex);
	if (!fileMatch) {
		logError(
			file,
			"Filename must match standard 4-digit prefix pattern, e.g., '0001-some-decision.md'",
		);
		continue;
	}

	const fileNum = parseInt(fileMatch[1], 10);

	// 2. Check Level 1 Heading
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
			`ADR number mismatch: filename specifies '${fileNum}' but H1 specifies '${headingNum}'`,
		);
	}

	// 3. Determine Layout (Formal vs Simple)
	const isFormal =
		content.includes("## Context") || content.includes("Status:");

	if (isFormal) {
		// Formal ADR Checks: Status, Date, Deciders at top
		const statusLineRegex =
			/^Status:\s+(Accepted|Proposed|Superseded|Deprecated)$/m;
		if (!statusLineRegex.test(content)) {
			logError(
				file,
				"Formal ADR: Missing or invalid inline 'Status: <Accepted|Proposed|Superseded|Deprecated>' line.",
			);
		}

		const dateRegex = /^Date:\s+\d{4}-\d{2}-\d{2}$/m;
		if (!dateRegex.test(content)) {
			logError(
				file,
				"Formal ADR: Missing or invalid Date format. Must contain 'Date: YYYY-MM-DD' on its own line.",
			);
		}

		// Exact H2 headings required
		const requiredH2Headings = [
			/^##\s+Context$/m,
			/^##\s+Decision$/m,
			/^##\s+Positive Consequences$/m,
			/^##\s+Negative Consequences \/ Risks$/m,
			/^##\s+Explicit Tradeoffs$/m,
		];

		for (const reg of requiredH2Headings) {
			if (!reg.test(content)) {
				logError(
					file,
					`Formal ADR: Missing exact required H2 heading matching '${reg}'`,
				);
			}
		}

		// Anti-pattern: Banned redundant H2 Status
		if (/^##\s+Status$/m.test(content)) {
			logError(
				file,
				"ANTI-PATTERN: Redundant '## Status' heading is forbidden. Use 'Status: <Accepted>' header line under H1.",
			);
		}

		// Anti-pattern: Banned legacy sections
		if (/^###\s+Metadata$/m.test(content)) {
			logError(
				file,
				"ANTI-PATTERN: Legacy '### Metadata' block is forbidden. Put references in Context.",
			);
		}
		if (/^##\s+Status\s+&\s+Approval$/m.test(content)) {
			logError(
				file,
				"ANTI-PATTERN: Legacy '## Status & Approval' footer is forbidden.",
			);
		}
		if (/^##\s+Metadata\s+&\s+References$/m.test(content)) {
			logError(
				file,
				"ANTI-PATTERN: Legacy '## Metadata & References' footer is forbidden.",
			);
		}
		if (/^##\s+Consequences$/m.test(content)) {
			logError(
				file,
				"ANTI-PATTERN: Generic '## Consequences' is obsolete. Use H2 '## Positive Consequences', '## Negative Consequences / Risks', and '## Explicit Tradeoffs'.",
			);
		}
		if (/^##\s+Decision Outcome$/m.test(content)) {
			logError(
				file,
				"ANTI-PATTERN: Non-standard '## Decision Outcome' must be renamed to '## Decision'.",
			);
		}

		// Anti-pattern: Raw TypeScript implementation blocks (per docs/standards/domain-docs.md)
		if (
			/^```(?:ts|typescript)\r?\n[\s\S]*?(?:export\s+(?:function|const|class)|function\s+\w+)/m.test(
				content,
			)
		) {
			logError(
				file,
				"ANTI-PATTERN: Raw TypeScript code definitions in ADR are forbidden. Reference symbols by path.",
			);
		}
	} else {
		// Simple ADR Checks (Lightweight)
		if (content.trim().length < 20) {
			logError(
				file,
				"Simple ADR: Document content is too short (must be at least 1 paragraph).",
			);
		}
	}

	if (failures === currentFileFailures) {
		logSuccess(
			file,
			`Valid ${isFormal ? "Formal" : "Simple"} ADR structure (${file})`,
		);
	}
}

console.log(`\n${"─".repeat(50)}`);
if (failures > 0) {
	console.error(
		`\n${colors.red}${colors.bold}Audit failed:${colors.reset} ${failures} issue(s) detected across ADRs.\n`,
	);
	process.exit(1);
} else {
	console.log(
		`\n${colors.green}${colors.bold}All ADRs passed validation cleanly.${colors.reset}\n`,
	);
	process.exit(0);
}
