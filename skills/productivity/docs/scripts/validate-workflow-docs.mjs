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

// Target workflow docs (files ending in -workflow.md or containing docType: *-workflow)
const allFiles = fs.readdirSync(designDir).filter((f) => f.endsWith(".md"));
const workflowFiles = allFiles.filter((f) => {
	if (f.endsWith("-workflow.md")) return true;
	const content = fs.readFileSync(path.join(designDir, f), "utf-8");
	return /docType:\s*.*workflow/.test(content);
});

if (workflowFiles.length === 0) {
	console.log(
		`${colors.yellow}Warning: No SSOT Workflow files found in docs/design.${colors.reset}`,
	);
	process.exit(0);
}

console.log(
	`${colors.cyan}Auditing ${workflowFiles.length} SSOT Workflow Documents (per workflow-documentation-standard.md)...${colors.reset}\n`,
);

for (const file of workflowFiles) {
	const filePath = path.join(designDir, file);
	const content = fs.readFileSync(filePath, "utf-8");
	const currentFileFailures = failures;

	// 1. Check docType in frontmatter
	if (!/docType:\s*(feature-workflow|infrastructure-workflow)/.test(content)) {
		logError(
			file,
			"Missing or invalid frontmatter 'docType'. Must be 'feature-workflow' or 'infrastructure-workflow'.",
		);
	}

	// 2. Check title or Level 1 Heading
	if (!/^#\s+.+/m.test(content)) {
		logError(file, "File must contain a Level 1 Heading (# Title)");
	}

	// 3. Check for Sequence Diagram or WBS Table
	const hasSequence = /```mermaid\s*\n\s*sequenceDiagram/m.test(content);
	const hasWbs = /\|\s*WBS Code\s*\|\s*Component/i.test(content);
	if (!hasSequence && !hasWbs) {
		logError(
			file,
			"Workflow Document MUST contain either a Mermaid sequence diagram or a 4-Level WBS Table.",
		);
	}

	if (failures === currentFileFailures) {
		logSuccess(file, "Passed SSOT workflow validation.");
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
		`\n${colors.green}${colors.bold}All SSOT Workflow Docs passed validation cleanly.${colors.reset}`,
	);
	process.exit(0);
}
