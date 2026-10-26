#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

function findFiles(
	dir,
	exts = [".ts", ".js", ".tsx", ".jsx", ".go", ".py", ".rs"],
	fileList = [],
) {
	if (!fs.existsSync(dir)) return fileList;
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			if (
				entry.name !== "node_modules" &&
				entry.name !== ".git" &&
				entry.name !== "dist" &&
				entry.name !== "build"
			) {
				findFiles(fullPath, exts, fileList);
			}
		} else if (entry.isFile() && exts.some((ext) => entry.name.endsWith(ext))) {
			fileList.push(fullPath);
		}
	}
	return fileList;
}

console.log("# Suite D: Shared Gravity & Boundary Leakage Audit\n");

const cwd = process.cwd();
const targetSharedDirs = [
	"shared",
	"common",
	"packages/shared",
	"packages/common",
	"libs/shared",
	"src/shared",
	"src/common",
];
const existingSharedDirs = targetSharedDirs
	.map((d) => path.join(cwd, d))
	.filter((p) => fs.existsSync(p));

if (existingSharedDirs.length === 0) {
	console.log(
		"- Status: No top-level /shared or /common folders detected. Low risk of shared gravitational pull.",
	);
} else {
	console.log(
		`- Identified shared directories: ${existingSharedDirs.map((d) => path.relative(cwd, d)).join(", ")}`,
	);

	const riskyPatterns = [
		{
			label: "ORM Entity / Model",
			regex:
				/(@Entity|@Table|mongoose\.Schema|prisma\.|gorm\.Model|typeorm|sequelize)/i,
		},
		{
			label: "Direct Database Client / Connection",
			regex:
				/(new Pool\(|createConnection|new PrismaClient|knex\(|mongoose\.connect)/i,
		},
		{
			label: "Stateful Singleton / Global Store",
			regex: /(new Store\(|createStore\(|new BehaviorSubject|globalState)/i,
		},
	];

	const findings = [];

	for (const sharedDir of existingSharedDirs) {
		const files = findFiles(sharedDir);
		for (const file of files) {
			const content = fs.readFileSync(file, "utf8");
			const lines = content.split("\n");
			lines.forEach((line, idx) => {
				for (const pat of riskyPatterns) {
					if (pat.regex.test(line)) {
						findings.push({
							file: path.relative(cwd, file),
							line: idx + 1,
							category: pat.label,
							snippet: line.trim(),
						});
					}
				}
			});
		}
	}

	if (findings.length === 0) {
		console.log(
			"- Status: Shared directories appear clean (pure utilities, types, or clients). Zero stateful or database entities detected.",
		);
	} else {
		console.log(
			`- Warning: Detected ${findings.length} risky stateful/ORM patterns in shared directory!`,
		);
		console.log(
			"  (Signal: Shared database schemas or models create strong lockstep deployment coupling across services)\n",
		);
		findings.slice(0, 10).forEach((f) => {
			console.log(`  [${f.category}] ${f.file}:${f.line} -> \`${f.snippet}\``);
		});
		if (findings.length > 10) {
			console.log(`  ... and ${findings.length - 10} more items.`);
		}
	}
}

// Check deep relative import leakage across the entire codebase
console.log("\n## Deep Relative Import Leakage Check");
const allSourceFiles = findFiles(path.join(cwd, "src"))
	.concat(findFiles(path.join(cwd, "packages")))
	.concat(findFiles(path.join(cwd, "apps")));
const deepImportPattern =
	/from\s+['"](\.\.\/){2,}(apps|packages|services)\/([^/'"]+)\/(src|lib|internal)\/([^'"]+)['"]/g;

const leakages = [];
for (const file of allSourceFiles) {
	const content = fs.readFileSync(file, "utf8");
	const lines = content.split("\n");
	lines.forEach((line, idx) => {
		if (deepImportPattern.test(line)) {
			leakages.push({
				file: path.relative(cwd, file),
				line: idx + 1,
				snippet: line.trim(),
			});
		}
	});
}

if (leakages.length === 0) {
	console.log(
		"- Status: No deep subfolder imports across packages/services detected.",
	);
} else {
	console.log(
		`- Warning: Found ${leakages.length} deep private relative imports traversing package boundaries!`,
	);
	leakages.slice(0, 10).forEach((l) => {
		console.log(`  ${l.file}:${l.line} -> \`${l.snippet}\``);
	});
	if (leakages.length > 10) {
		console.log(`  ... and ${leakages.length - 10} more items.`);
	}
}
