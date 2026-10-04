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

const primaryDesignDir = path.resolve("docs/design");
const fallbackDesignDir = path.resolve("second-brain/Docs/Design");
const designDir = fs.existsSync(primaryDesignDir)
	? primaryDesignDir
	: fs.existsSync(fallbackDesignDir)
		? fallbackDesignDir
		: primaryDesignDir;
let failures = 0;

function logError(file, message) {
	console.error(`${colors.red}FAIL:${colors.reset} [${file}] ${message}`);
	failures++;
}

function logSuccess(file, message) {
	console.log(`${colors.green}PASS:${colors.reset} [${file}] ${message}`);
}

if (!fs.existsSync(designDir)) {
	fs.mkdirSync(designDir, { recursive: true });
}

const files = fs.readdirSync(designDir).filter((f) => f.endsWith(".md"));

if (files.length === 0) {
	console.log(
		`${colors.yellow}Warning: No Design Spec files found in docs/design or second-brain/Docs/Design.${colors.reset}`,
	);
	process.exit(0);
}

console.log(
	`${colors.cyan}Auditing ${files.length} System Design Specs (per consolidated design standard)...${colors.reset}\n`,
);

const requiredSections = [
	"Overview & Context",
	"Architecture",
	"Operational Flow",
	"Security",
];

for (const file of files) {
	const filePath = path.join(designDir, file);
	const content = fs.readFileSync(filePath, "utf-8");
	const currentFileFailures = failures;

	// 1. Check filename format: clean kebab-case (e.g. booking-core-concurrency.md)
	if (!/^[a-z0-9-]+\.md$/.test(file)) {
		logError(
			file,
			"Filename must be clean kebab-case, e.g., 'shows-seating-chart-matrix.md'",
		);
	}

	// 2. Check frontmatter docType
	if (
		!/docType:\s*(feature-design|infrastructure-design|feature-workflow|infrastructure-workflow)/.test(
			content,
		)
	) {
		logError(
			file,
			"Missing or invalid frontmatter 'docType'. Must be 'feature-design' or 'infrastructure-design'.",
		);
	}

	// 3. Check for Level 1 Heading (# Title)
	if (!/^#\s+.+/m.test(content)) {
		logError(file, "File must contain a Level 1 Heading (# Title)");
	}

	// 4. Check Required Positive Sections
	for (const section of requiredSections) {
		const regex = new RegExp(`##.*${section}`, "i");
		if (!regex.test(content)) {
			logError(file, `Missing required section matching '${section}'`);
		}
	}

	// 5. Positive Check: Mandatory Mermaid Sequence Diagram (Runtime View)
	const hasSequence = /```mermaid\s*\n\s*sequenceDiagram/m.test(content);
	if (!hasSequence) {
		logError(
			file,
			"Design Spec MUST contain an autonumbered Mermaid sequence diagram (```mermaid\\nsequenceDiagram).",
		);
	}

	// 6. STRICT NEGATIVE CHECK: Ban Work Breakdown Structure (WBS) tables
	if (/\|\s*WBS Code\s*\|\s*Component/i.test(content)) {
		logError(
			file,
			"ANTI-PATTERN: Work Breakdown Structure (WBS) tables are strictly forbidden in design docs. Track tasks in GitHub Issues/Jira.",
		);
	}

	if (failures === currentFileFailures) {
		logSuccess(file, "Passed consolidated design spec validation.");
	}
}

console.log(`\n${"─".repeat(50)}`);
if (failures > 0) {
	console.error(
		`\n${colors.red}${colors.bold}Audit failed with ${failures} error(s).${colors.reset}`,
	);
	process.exit(1);
} else {
	console.log(
		`\n${colors.green}${colors.bold}All System Design Specs passed validation cleanly.${colors.reset}`,
	);
	process.exit(0);
}
