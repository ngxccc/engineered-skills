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

if (!fs.existsSync(designDir)) {
	fs.mkdirSync(designDir, { recursive: true });
}

const files = fs.readdirSync(designDir).filter((f) => f.endsWith(".md"));

if (files.length === 0) {
	console.log(
		`${colors.yellow}No system design docs found in ${designDir}.${colors.reset}`,
	);
	process.exit(0);
}

console.log(
	`${colors.cyan}Auditing ${files.length} System Design Specs (per consolidated strict design standard)...${colors.reset}\n`,
);

const REQUIRED_SECTIONS = [
	{
		name: "Overview & Context",
		pattern: /^##\s+(?:\d+\.\s+)?Overview\s+&\s+Context/im,
	},
	{ name: "Architecture", pattern: /^##\s+(?:\d+\.\s+)?Architecture/im },
	{
		name: "Operational Flow",
		pattern: /^##\s+(?:\d+\.\s+)?Operational\s+Flow/im,
	},
	{
		name: "Security & Reliability",
		pattern:
			/^##\s+(?:\d+\.\s+)?Security\s+(?:&|and)\s+(?:Reliability|Defense-in-Depth|PII\s+Defense-in-Depth|Test\s+Data\s+Isolation|Test\s+Tenant\s+Isolation|Edge\s+Cases|Input\s+Sanitization\s+Invariants)/im,
	},
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

	// 2. Frontmatter validation
	const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!frontmatterMatch) {
		logError(file, "Missing YAML frontmatter block (enclosed in '---')");
	} else {
		const fmLines = frontmatterMatch[1].split("\n");
		const fm = {};
		for (const line of fmLines) {
			const m = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
			if (m) {
				fm[m[1].trim()] = m[2].trim().replace(/^['"](.*)['"]$/, "$1");
			}
		}

		// Required fields
		if (!fm.title) {
			logError(file, "Frontmatter missing required field: 'title'");
		}
		if (
			!fm.docType ||
			![
				"feature-workflow",
				"infrastructure-workflow",
				"feature-design",
				"infrastructure-design",
			].includes(fm.docType)
		) {
			logError(
				file,
				`Frontmatter 'docType' must be 'feature-workflow' or 'infrastructure-workflow' (got: '${fm.docType}')`,
			);
		}
		if (
			!fm.status ||
			![
				"draft",
				"under-review",
				"approved",
				"completed",
				"implemented",
			].includes(fm.status)
		) {
			logError(
				file,
				`Frontmatter 'status' must be 'draft' | 'under-review' | 'approved' | 'completed' | 'implemented' (got: '${fm.status}')`,
			);
		}
		if (!fm.date || !/^\d{4}-\d{2}-\d{2}$/.test(fm.date)) {
			logError(
				file,
				`Frontmatter 'date' must be in YYYY-MM-DD format (got: '${fm.date}')`,
			);
		}
		if (!fm.author) {
			logError(
				file,
				"Frontmatter missing required field: 'author' (default to local GitHub username via 'gh api user --jq .login' or 'git config user.name')",
			);
		} else if (
			/^(team(\s*\/\s*(core architecture|agent))?|agent|ai|claude|chatgpt|assistant|<.+>)$/i.test(
				fm.author.trim(),
			)
		) {
			logError(
				file,
				`Frontmatter 'author' must be the author's local GitHub username, not generic or AI attribution (got: '${fm.author}')`,
			);
		}
		if (!fm.version || !/^\d+\.\d+\.\d+$/.test(fm.version)) {
			logError(
				file,
				`Frontmatter 'version' must follow semver X.Y.Z format (got: '${fm.version}')`,
			);
		}
	}

	// 3. Level 1 Heading (# Title)
	if (!/^#\s+.+/m.test(content)) {
		logError(file, "File must contain a Level 1 Heading (# Title)");
	}

	// 4. Required Sections
	for (const req of REQUIRED_SECTIONS) {
		if (!req.pattern.test(content)) {
			logError(file, `Missing required section matching '${req.name}'`);
		}
	}

	// 5. Positive Check: Mandatory Mermaid Sequence Diagram
	const hasSequence = /```mermaid\s*\r?\n\s*sequenceDiagram/m.test(content);
	if (!hasSequence) {
		logError(
			file,
			"Design Spec MUST contain an autonumbered Mermaid sequence diagram (```mermaid\\nsequenceDiagram).",
		);
	}

	// 6. STRICT NEGATIVE CHECK: Ban Work Breakdown Structure (WBS)
	if (
		/\|\s*WBS ID\s*\|/i.test(content) ||
		/\|\s*WBS Code\s*\|/i.test(content) ||
		/Work Breakdown Structure/i.test(content)
	) {
		logError(
			file,
			"ANTI-PATTERN: Work Breakdown Structure (WBS) tables are strictly forbidden in design docs. Track tasks in GitHub Issues/Jira.",
		);
	}

	// 7. STRICT NEGATIVE CHECK: Ban raw TypeScript / SQL schema duplication
	if (
		/^```(?:ts|typescript)\r?\n[\s\S]*?(?:export\s+const\s+\w+\s*=\s*(?:snakeCase\.)?table\(|export\s+const\s+\w+\s*=\s*pgTable\()/m.test(
			content,
		)
	) {
		logError(
			file,
			"ANTI-PATTERN: Copy-pasting raw Drizzle/SQL schema declarations into Markdown is forbidden (per docs/standards/domain-docs.md). Reference code symbols instead.",
		);
	}

	// 8. STRICT NEGATIVE CHECK: Ban redundant legacy metadata block in Markdown body
	if (
		/^\*\*(?:Status|Scope|Route\/Endpoint|Source Location|ADR Reference|Module)\*\*:/m.test(
			content,
		)
	) {
		logError(
			file,
			"ANTI-PATTERN: Legacy metadata headers in Markdown body (**Status**, **Scope**, etc.) are forbidden. Use YAML Frontmatter SSOT.",
		);
	}

	// 9. STRICT NEGATIVE CHECK: LaTeX Math mode syntax errors
	// In KaTeX / MathJax / LaTeX:
	// A) Plain unescaped underscores in math mode ($..._...$ or $$..._...$$) outside intentional subscript
	// B) Text-like macros in math with underscores: \text{..._...}, \texttt{..._...}
	const mathBlocks = content.match(/\$\$[\s\S]*?\$\$|\$[^$\n]+?\$/g) || [];
	for (const math of mathBlocks) {
		// Detect unescaped underscores in any \text, \texttt, \operatorname, \mathrm, \mathbf macros
		const textWithUnderscore = math.match(
			/\\(?:text|texttt|operatorname|mathrm|mathbf|mathit)\{[^}]*?(?<!\\)_[^}]*?\}/,
		);
		if (textWithUnderscore) {
			logError(
				file,
				`LaTeX Error: Unescaped underscore '_' found inside text macro in math mode: "${textWithUnderscore[0]}". Use plain code blocks or code font instead.`,
			);
			break;
		}

		// Detect unescaped identifier strings with underscores in math mode that cause LaTeX/KaTeX parse errors
		const rawUnderscoreMatch = math.match(
			/(?<!\\|\w)_[a-zA-Z0-9]+_[a-zA-Z0-9]+/,
		);
		if (rawUnderscoreMatch) {
			logError(
				file,
				`LaTeX Error: Ambiguous multi-underscore token in math mode: "${rawUnderscoreMatch[0]}". Wrap identifiers with code ticks or plain text.`,
			);
			break;
		}
	}
}

console.log(`\n${"─".repeat(50)}`);
if (failures > 0) {
	console.error(
		`\n${colors.red}${colors.bold}Audit failed:${colors.reset} ${failures} issue(s) detected across System Design Specs.\n`,
	);
	process.exit(1);
} else {
	console.log(
		`\n${colors.green}${colors.bold}All System Design Specs passed validation cleanly.${colors.reset}\n`,
	);
	process.exit(0);
}
