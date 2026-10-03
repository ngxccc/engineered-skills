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

// Target directory can be passed as argument, defaults to local vault 50_Flashcards
const targetDir = process.argv[2]
	? path.resolve(process.argv[2])
	: fs.existsSync(path.resolve("50_Flashcards"))
		? path.resolve("50_Flashcards")
		: path.resolve(".");

let totalScanned = 0;
let failures = 0;
let warnings = 0;

function logError(file, message) {
	console.error(`${colors.red}FAIL:${colors.reset} [${file}] ${message}`);
	failures++;
}

function logWarning(file, message) {
	console.warn(`${colors.yellow}WARN:${colors.reset} [${file}] ${message}`);
	warnings++;
}

function findMarkdownFiles(dir) {
	let results = [];
	if (!fs.existsSync(dir)) return results;
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			// Avoid node_modules, dot folders, and skip Vocabulary / Grammar (handled by english validator)
			if (
				!entry.name.startsWith(".") &&
				entry.name !== "node_modules" &&
				entry.name !== "Vocabulary" &&
				entry.name !== "Grammar" &&
				entry.name !== "Psychology"
			) {
				results = results.concat(findMarkdownFiles(fullPath));
			}
		} else if (entry.isFile() && entry.name.endsWith(".md")) {
			results.push(fullPath);
		}
	}
	return results;
}

const files = findMarkdownFiles(targetDir);

if (files.length === 0) {
	console.log(
		`${colors.yellow}No technical flashcard markdown files found in: ${targetDir}${colors.reset}`,
	);
	process.exit(0);
}

console.log(
	`${colors.cyan}${colors.bold}Auditing ${files.length} Technical Flashcard(s) in: ${targetDir}${colors.reset}\n`,
);

for (const filePath of files) {
	const relPath = path.relative(targetDir, filePath);
	const content = fs.readFileSync(filePath, "utf-8");
	totalScanned++;

	const filename = path.basename(filePath);

	// 1. Invariant: Naming convention (Pascal_Snake_Case.md)
	const validNamePattern = /^[A-Z][a-zA-Z0-9]*(_[A-Za-z0-9]+)*\.md$/;
	if (!validNamePattern.test(filename)) {
		logError(
			relPath,
			`Filename must follow Pascal_Snake_Case.md (found: '${filename}')`,
		);
	}

	// 2. Invariant: No deprecated 'Interview_' prefix
	if (filename.startsWith("Interview_")) {
		logError(
			relPath,
			"Filename must not start with deprecated 'Interview_' prefix. Use atomic concept names.",
		);
	}

	// 3. Section Separator Check (---)
	const parts = content.split(/\n---\r?\n/);

	// If it contains Cloze deletion syntax ({{c1::...}}), allow cloze format
	const isCloze = /\{\{c\d+::.+?\}\}/.test(content);

	if (isCloze) {
		if (content.length > 500) {
			logWarning(
				relPath,
				`Cloze card text is lengthy (${content.length} chars). Consider atomizing.`,
			);
		}
		continue;
	}

	// For standard Q&A flashcards:
	// [0] Frontmatter (contains noteId)
	// [1] Question (Front)
	// [2] Answer (Back)
	// [3] Extra (Optional context)
	if (parts.length < 3) {
		logError(
			relPath,
			`Invalid card structure. Expected at least 3 sections separated by '---' (Frontmatter, Question, Answer). Found ${parts.length} sections.`,
		);
		continue;
	}

	const frontmatter = parts[0];
	const question = parts[1].trim();
	const answer = parts[2].trim();
	const extra = parts[3] ? parts[3].trim() : "";

	// 4. Invariant: Must contain noteId
	if (!frontmatter.includes("noteId:")) {
		logError(relPath, "Missing 'noteId:' in YAML frontmatter.");
	}

	// 5. Invariant: Question must not contain interview labels
	if (/\[(phỏng vấn|interview)\]/i.test(question)) {
		logError(
			relPath,
			"Question contains banned interview badge (e.g. '[Phỏng vấn]'). Remove meta labels.",
		);
	}

	// 6. Anti-Pattern: Essay / Open-ended prompt detector
	if (/giải thích (toàn bộ|cơ chế bên dưới|chi tiết)/i.test(question)) {
		logError(
			relPath,
			"Question uses vague essay phrasing ('giải thích cơ chế bên dưới / chi tiết'). Pose a direct target question testing specific cause, condition, or invariant.",
		);
	}

	// 7. Anti-Pattern: Double/Triple question detector
	const questionMarks = (question.match(/\?/g) || []).length;
	if (questionMarks > 1) {
		logWarning(
			relPath,
			`Question contains ${questionMarks} question marks. Check if this is a double question that should be split into 2 atomic cards.`,
		);
	}

	// 8. Strict Minimum Information Principle: Max 2 top-level bullet points in main Answer
	const topLevelBullets = (answer.match(/^[*-]\s+/gm) || []).length;
	if (topLevelBullets > 2) {
		logError(
			relPath,
			`Answer section has ${topLevelBullets} top-level bullet points. Violates Minimum Information Principle (Max 2 bullets for 3-5s rapid binary retrieval). Move secondary details to 'Extra:'.`,
		);
	}

	// 9. Strict Verbosity Guard: Core answer must not exceed 350 characters
	if (answer.length > 350) {
		logError(
			relPath,
			`Answer section is too bloated (${answer.length} chars, limit is 350 chars). A flashcard is an atomic retrieval unit, not a lecture summary. Move background explanations, gotchas, or commands to 'Extra:'.`,
		);
	}

	// 10. Extra format check: if extra exists, should start with 'Extra:'
	if (extra && !extra.startsWith("Extra:")) {
		logWarning(
			relPath,
			"Third section should typically start with 'Extra:' for auxiliary notes.",
		);
	}
}

console.log("\n" + "─".repeat(60));
console.log(`Audited: ${totalScanned} technical card(s)`);
console.log(`Warnings: ${warnings}`);
console.log(`Failures: ${failures}`);

if (failures > 0) {
	console.error(
		`\n${colors.red}${colors.bold}Technical flashcard validation failed with ${failures} error(s).${colors.reset}`,
	);
	process.exit(1);
} else {
	console.log(
		`\n${colors.green}${colors.bold}All technical flashcard validation checks passed cleanly!${colors.reset}`,
	);
	process.exit(0);
}
