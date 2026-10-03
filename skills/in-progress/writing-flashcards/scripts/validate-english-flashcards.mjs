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

// Target directory can be passed as argument, defaults to local vault 50_Flashcards/Vocabulary and 50_Flashcards/Grammar
const targetArg = process.argv[2];

let searchDirs = [];
if (targetArg) {
	searchDirs.push(path.resolve(targetArg));
} else {
	const vocabDir = path.resolve("50_Flashcards/Vocabulary");
	const grammarDir = path.resolve("50_Flashcards/Grammar");
	if (fs.existsSync(vocabDir)) searchDirs.push(vocabDir);
	if (fs.existsSync(grammarDir)) searchDirs.push(grammarDir);
	if (searchDirs.length === 0) searchDirs.push(path.resolve("."));
}

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
			if (!entry.name.startsWith(".") && entry.name !== "node_modules") {
				results = results.concat(findMarkdownFiles(fullPath));
			}
		} else if (entry.isFile() && entry.name.endsWith(".md")) {
			results.push(fullPath);
		}
	}
	return results;
}

let files = [];
for (const d of searchDirs) {
	files = files.concat(findMarkdownFiles(d));
}

if (files.length === 0) {
	console.log(
		`${colors.yellow}No English flashcard markdown files found in search targets.${colors.reset}`,
	);
	process.exit(0);
}

console.log(
	`${colors.cyan}${colors.bold}Auditing ${files.length} English Flashcard(s) (Vocabulary & Grammar)...${colors.reset}\n`,
);

for (const filePath of files) {
	const relPath = path.relative(process.cwd(), filePath);
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

	// 2. Cloze Card Handling
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

	// 3. Section Separator Check (---)
	const parts = content.split(/\n---\r?\n/);
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

	// 5. Anti-Pattern: Question contains double question marks
	const questionMarks = (question.match(/\?/g) || []).length;
	if (questionMarks > 1) {
		logWarning(
			relPath,
			`Question contains ${questionMarks} question marks. Check if this is a double question that should be split into 2 atomic cards.`,
		);
	}

	// 6. Strict SLA Minimum Information Principle: Max 2 top-level bullet points in main Answer
	const topLevelBullets = (answer.match(/^[*-]\s+/gm) || []).length;
	if (topLevelBullets > 2) {
		logError(
			relPath,
			`Answer section has ${topLevelBullets} top-level bullet points. Violates Minimum Information Principle (Max 2 bullets for 3-second rapid retrieval). Move Word Family, Collocations, and Examples to 'Extra:'.`,
		);
	}

	// 7. Strict Verbosity Guard: Core answer must not exceed 280 characters
	if (answer.length > 280) {
		logError(
			relPath,
			`Answer section is too bloated (${answer.length} chars, limit is 280 chars). The core Answer must be a 3-second binary test. Move reference details to 'Extra:'.`,
		);
	}

	// 8. Word Family & Reference Bloat Guard in Answer
	if (/Word Family:/i.test(answer) || /Concrete Examples:/i.test(answer)) {
		logError(
			relPath,
			"Answer contains full 'Word Family' or 'Concrete Examples'. Move comprehensive reference matrices down to 'Extra:'.",
		);
	}

	// 9. Extra section structure check:
	// For vocabulary cards, Extra should be present to store Word Family Matrix, IPA, or Collocations
	const isVocab = relPath.includes("Vocabulary");
	if (isVocab) {
		if (!extra) {
			logWarning(
				relPath,
				"Vocabulary card is missing 'Extra:' section for Word Family Matrix and collocations.",
			);
		} else if (!extra.startsWith("Extra:")) {
			logWarning(
				relPath,
				"Third section should start with 'Extra:' for auxiliary reference notes.",
			);
		}
	}
}

console.log("\n" + "─".repeat(60));
console.log(`Audited: ${totalScanned} English card(s)`);
console.log(`Warnings: ${warnings}`);
console.log(`Failures: ${failures}`);

if (failures > 0) {
	console.error(
		`\n${colors.red}${colors.bold}English flashcard validation failed with ${failures} error(s).${colors.reset}`,
	);
	process.exit(1);
} else {
	console.log(
		`\n${colors.green}${colors.bold}All English flashcard validation checks passed cleanly!${colors.reset}`,
	);
	process.exit(0);
}
