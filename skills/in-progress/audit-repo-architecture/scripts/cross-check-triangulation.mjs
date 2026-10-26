#!/usr/bin/env node

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function execSafe(cmd) {
	try {
		return execSync(cmd, {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "pipe"],
		}).trim();
	} catch {
		return "";
	}
}

console.log("===============================================================");
console.log(" MULTI-TOOL ARCHITECTURAL TRIANGULATION & CROSS-CHECK REPORT");
console.log(
	"===============================================================\n",
);

const cwd = process.cwd();

// Axis 1: Static AST & Boundary Check
console.log("--> [Axis 1: Static Code Graph]");
let staticBoundaryLeaks = 0;
const packageDirs = ["packages", "apps", "services", "src"].filter((d) =>
	fs.existsSync(path.join(cwd, d)),
);

function checkStaticLeaks(dir) {
	let count = 0;
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		const full = path.join(dir, entry.name);
		if (
			entry.isDirectory() &&
			entry.name !== "node_modules" &&
			entry.name !== ".git"
		) {
			count += checkStaticLeaks(full);
		} else if (
			entry.isFile() &&
			(entry.name.endsWith(".ts") ||
				entry.name.endsWith(".js") ||
				entry.name.endsWith(".go"))
		) {
			const content = fs.readFileSync(full, "utf8");
			if (/from\s+['"](\.\.\/){2,}.*(src|lib|internal)\//.test(content)) {
				count++;
			}
		}
	}
	return count;
}

for (const d of packageDirs) {
	staticBoundaryLeaks += checkStaticLeaks(path.join(cwd, d));
}
console.log(
	`    Deep private relative import leaks found: ${staticBoundaryLeaks}`,
);

// Axis 2: Package Manifest Isolation (Undeclared dependencies & hoisting)
console.log("\n--> [Axis 2: Package Manifest Isolation]");
const packageJsonFiles = [];
function findPackageJsons(dir) {
	if (!fs.existsSync(dir)) return;
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory() && entry.name !== "node_modules") {
			findPackageJsons(full);
		} else if (entry.isFile() && entry.name === "package.json") {
			packageJsonFiles.push(full);
		}
	}
}
findPackageJsons(cwd);

let isolatedPackages = 0;
let packagesWithInternalDeps = 0;
for (const pj of packageJsonFiles) {
	if (pj === path.join(cwd, "package.json")) continue;
	try {
		const data = JSON.parse(fs.readFileSync(pj, "utf8"));
		const deps = {
			...(data.dependencies || {}),
			...(data.devDependencies || {}),
		};
		const hasWorkspaceDeps = Object.values(deps).some(
			(v) => String(v).includes("workspace:") || String(v).startsWith("*"),
		);
		if (hasWorkspaceDeps) packagesWithInternalDeps++;
		isolatedPackages++;
	} catch {}
}
console.log(`    Total sub-packages detected: ${isolatedPackages}`);
console.log(
	`    Sub-packages using explicit workspace contracts: ${packagesWithInternalDeps}`,
);

// Axis 3: Temporal Git Co-Change Coupling
console.log("\n--> [Axis 3: Temporal Git Co-Change]");
const rawCommits = execSafe("git log --oneline -n 60 --format=%H");
const commitHashes = rawCommits ? rawCommits.split("\n").filter(Boolean) : [];
const pairCounts = new Map();
let evaluatedCommits = 0;

for (const hash of commitHashes) {
	const files = execSafe(`git diff-tree --no-commit-id --name-only -r ${hash}`)
		.split("\n")
		.filter(Boolean);
	if (files.length <= 1) continue;
	evaluatedCommits++;

	// Group files by root directory/service
	const affectedDomains = new Set(
		files
			.map((f) => {
				const parts = f.split("/");
				return parts.length > 1 ? `${parts[0]}/${parts[1]}` : parts[0];
			})
			.filter((d) => d && !d.startsWith(".")),
	);

	const domainArr = Array.from(affectedDomains);
	for (let i = 0; i < domainArr.length; i++) {
		for (let j = i + 1; j < domainArr.length; j++) {
			const key = [domainArr[i], domainArr[j]].sort().join(" <--> ");
			pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
		}
	}
}

const highTemporalCouplings = [];
for (const [pair, count] of pairCounts.entries()) {
	const percentage = Math.round((count / evaluatedCommits) * 100);
	if (percentage >= 25) {
		highTemporalCouplings.push({ pair, count, percentage });
	}
}

if (highTemporalCouplings.length === 0) {
	console.log(
		`    Evaluated commits: ${evaluatedCommits}. No strong temporal coupling (>25%) detected.`,
	);
} else {
	console.log(
		`    Evaluated commits: ${evaluatedCommits}. High temporal co-change detected:`,
	);
	highTemporalCouplings.forEach((c) => {
		console.log(
			`    - ${c.pair}: co-changed in ${c.count} commits (${c.percentage}%)`,
		);
	});
}

// TRIANGULATION SYNTHESIS
console.log(
	"\n===============================================================",
);
console.log(" TRIANGULATION CROSS-CHECK VERDICT");
console.log("===============================================================");

// Cross-Check Rule 1: Static Leaks vs Package Manifest
if (staticBoundaryLeaks > 0 && packagesWithInternalDeps > 0) {
	console.log("\n[!] Discrepancy Found: Phantom & Leaky Imports");
	console.log(
		"    Packages declare workspace contracts, but code bypasses them via relative deep imports.",
	);
	console.log(
		"    Remediation: Enforce entry-point boundaries (e.g., via setup-ts-deep-modules).",
	);
}

// Cross-Check Rule 2: Static Clean vs High Temporal Coupling
if (staticBoundaryLeaks === 0 && highTemporalCouplings.length > 0) {
	console.log("\n[!] Hidden Coupling Alert (Architectural Blind Spot):");
	console.log(
		"    Static imports appear clean, yet services frequently change together in Git commits!",
	);
	console.log(
		"    Probable Cause: Shared database schema, unversioned message broker events, or cross-cutting business rules.",
	);
	console.log(
		"    Remediation: Introduce explicit API/schema contract testing (e.g. OpenAPI / Protobuf).",
	);
}

// Cross-Check Rule 3: High Temporal Coupling + Static Leaks
if (staticBoundaryLeaks > 0 && highTemporalCouplings.length > 0) {
	console.log("\n[!] Distributed Monolith Warning:");
	console.log(
		"    Both code imports and commit history confirm tight lockstep coupling across services.",
	);
	console.log(
		"    Remediation: Either officially embrace a Modular Monolith (deploy together), or decouple shared entities.",
	);
}

if (staticBoundaryLeaks === 0 && highTemporalCouplings.length === 0) {
	console.log("\n[+] Architecture Healthy:");
	console.log(
		"    Cross-checks show clean static boundaries and low temporal commit coupling.",
	);
}

console.log("\nTriangulation completed.\n");
