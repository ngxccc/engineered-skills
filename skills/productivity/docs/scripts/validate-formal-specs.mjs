#!/usr/bin/env node
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

const candidateDirs = [
	path.resolve("docs/formal-specs"),
	path.resolve("second-brain/Docs/Formal-Specs"),
];

let files = [];

for (const dir of candidateDirs) {
	if (fs.existsSync(dir)) {
		const mdFiles = fs
			.readdirSync(dir)
			.filter((f) => f.endsWith(".md"))
			.map((f) => ({ name: f, fullPath: path.join(dir, f) }));
		if (mdFiles.length > 0) {
			files = files.concat(mdFiles);
		}
	}
}

if (!fs.existsSync(candidateDirs[0])) {
	fs.mkdirSync(candidateDirs[0], { recursive: true });
}

if (files.length === 0) {
	console.log(
		`${colors.yellow}Warning: No Formal Spec files found in docs/formal-specs or second-brain/Docs/Formal-Specs.${colors.reset}`,
	);
	process.exit(0);
}

console.log(
	`${colors.cyan}Auditing ${files.length} Formal Specification Documents...${colors.reset}\n`,
);

let failures = 0;

function logError(file, message) {
	console.error(`${colors.red}FAIL:${colors.reset} [${file}] ${message}`);
	failures++;
}

function logSuccess(file, message) {
	console.log(`${colors.green}PASS:${colors.reset} [${file}] ${message}`);
}

const requiredSections = [
	{ name: "Objectives & Boundaries", regex: /##.*(?:Objectives|Mục Tiêu)/i },
	{
		name: "Input Data Contracts",
		regex: /##.*(?:Input Data|Dữ Liệu Đầu Vào)/i,
	},
	{
		name: "Constraints & System Invariants",
		regex: /##.*(?:Invariants|Ràng Buộc Bất Biến)/i,
	},
	{
		name: "Edge Cases & Adversarial Matrix",
		regex: /##.*(?:Adversarial|Edge Cases|Trường Hợp Ngoại Lệ)/i,
	},
];

for (const fileObj of files) {
	const content = fs.readFileSync(fileObj.fullPath, "utf-8");
	const currentFileFailures = failures;

	// 1. Check filename format
	if (!/^[a-z0-9-]+(-formal-spec)?\.md$/.test(fileObj.name)) {
		logError(
			fileObj.name,
			"Filename must be kebab-case, e.g., 'billing-credit-formal-spec.md'",
		);
	}

	// 2. Check for H1 Title
	if (!/^#\s+.+/m.test(content)) {
		logError(fileObj.name, "File must contain a Level 1 Heading (# Title)");
	}

	// 3. Check Required Sections
	for (const section of requiredSections) {
		if (!section.regex.test(content)) {
			logError(
				fileObj.name,
				`Missing required section matching '${section.name}'`,
			);
		}
	}

	// 4. Check for System Invariants marker
	if (!/INV-\d+/i.test(content)) {
		logError(
			fileObj.name,
			"Formal Spec must define at least one System Invariant marker (e.g., 'INV-1')",
		);
	}

	// 5. Check for Edge Case / Adversarial marker
	if (!/(?:EDGE|ADV)-\d+/i.test(content)) {
		logError(
			fileObj.name,
			"Formal Spec must define at least one Edge Case or Adversarial marker (e.g., 'EDGE-1' or 'ADV-1')",
		);
	}

	if (failures === currentFileFailures) {
		logSuccess(fileObj.name, "Passed formal specification validation.");
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
		`\n${colors.green}${colors.bold}All Formal Specs passed validation cleanly.${colors.reset}`,
	);
	process.exit(0);
}
