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
		`${colors.yellow}Warning: No Design Doc files found in docs/design or second-brain/Docs/Design.${colors.reset}`,
	);
	process.exit(0);
}

console.log(
	`${colors.cyan}Auditing ${files.length} System Design & Workflow Documents...${colors.reset}\n`,
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

	// 1. Check filename format (e.g., booking-payment-workflow.md or feature-topic-design.md)
	if (!/^[a-z0-9-]+(-workflow|-design)?\.md$/.test(file)) {
		logError(
			file,
			"Filename must be kebab-case, e.g., 'booking-payment-workflow.md'",
		);
	}

	// 2. Check for H1 Title
	if (!/^#\s+.+/m.test(content)) {
		logError(file, "File must contain a Level 1 Heading (# Title)");
	}

	// 3. Check Required Sections (flexible matching for section headers)
	for (const section of requiredSections) {
		const regex = new RegExp(`##.*${section}`, "i");
		if (!regex.test(content)) {
			logError(file, `Missing required section matching '${section}'`);
		}
	}

	if (failures === currentFileFailures) {
		logSuccess(file, "Passed structural and naming validation.");
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
		`\n${colors.green}${colors.bold}All Design Docs passed validation cleanly.${colors.reset}`,
	);
	process.exit(0);
}
