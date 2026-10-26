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

console.log("# Repository Architecture & Boundary Quick Scan\n");

// 1. Conway's Law Metric: Contributors
const contributorsRaw = execSafe('git shortlog -sn --since="3 months ago"');
const contributors = contributorsRaw
	? contributorsRaw.split("\n").filter(Boolean)
	: [];
const count = contributors.length;

let scaleTier = "Small (<10 devs)";
if (count >= 40) {
	scaleTier = "Enterprise (>40 devs) - High merge queue and CI choke risk";
} else if (count >= 10) {
	scaleTier = "Scaleup (10-40 devs) - Boundary enforcement critical";
}

console.log("## 1. Conway's Law Sensing");
console.log(`- Active contributors (90 days): ${count}`);
console.log(`- Scale tier: ${scaleTier}`);

// 2. Topology Discovery
const cwd = process.cwd();
const indicators = [
	{ file: "pnpm-workspace.yaml", type: "pnpm workspace (Monorepo)" },
	{ file: "turbo.json", type: "Turborepo (Monorepo)" },
	{ file: "nx.json", type: "Nx (Monorepo)" },
	{ file: "lerna.json", type: "Lerna (Monorepo)" },
	{ file: "go.work", type: "Go Workspace (Monorepo)" },
	{
		file: "Cargo.toml",
		check: (content) => content.includes("[workspace]"),
		type: "Cargo Workspace (Monorepo)",
	},
];

const detectedTopology = [];
for (const ind of indicators) {
	const p = path.join(cwd, ind.file);
	if (fs.existsSync(p)) {
		if (ind.check) {
			const content = fs.readFileSync(p, "utf8");
			if (ind.check(content)) detectedTopology.push(ind.type);
		} else {
			detectedTopology.push(ind.type);
		}
	}
}

console.log("\n## 2. Workspace Topology");
if (detectedTopology.length > 0) {
	console.log(`- Detected: ${detectedTopology.join(", ")}`);
} else {
	console.log("- Detected: Standard single-package repo or polyrepo node");
}

// 3. Commit Coupling (% of commits touching shared/common and services)
const logCommits = execSafe("git log --oneline -n 50 --format=%H");
if (logCommits) {
	const hashes = logCommits.split("\n").filter(Boolean);
	let multiTouchCommits = 0;
	let evaluatedCommits = 0;

	for (const hash of hashes) {
		const filesRaw = execSafe(
			`git diff-tree --no-commit-id --name-only -r ${hash}`,
		);
		const files = filesRaw.split("\n").filter(Boolean);
		if (files.length <= 1) continue;
		evaluatedCommits++;

		const hasShared = files.some(
			(f) =>
				f.includes("shared/") ||
				f.includes("common/") ||
				f.includes("packages/lib") ||
				f.includes("libs/"),
		);
		const hasApps = files.some(
			(f) =>
				f.includes("apps/") || f.includes("services/") || f.includes("src/"),
		);

		if (hasShared && hasApps) {
			multiTouchCommits++;
		}
	}

	const ratio =
		evaluatedCommits > 0
			? Math.round((multiTouchCommits / evaluatedCommits) * 100)
			: 0;
	console.log("\n## 3. Commit Coupling on Shared Code (Last 50 commits)");
	console.log(`- Evaluated multi-file commits: ${evaluatedCommits}`);
	console.log(
		`- Commits touching both App/Service and Shared/Common: ${multiTouchCommits} (${ratio}%)`,
	);
	if (ratio > 30) {
		console.log(
			"- Warning: High coupling (>30%) detected. Shared code may be causing lockstep friction.",
		);
	} else {
		console.log("- Status: Shared coupling is within manageable bounds.");
	}
}

console.log("\nScan complete.");
