#!/usr/bin/env node
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const scripts = [
	{ name: "ADRs", file: "validate-adrs.mjs" },
	{ name: "RFCs", file: "validate-rfcs.mjs" },
	{ name: "Design Docs", file: "validate-design-docs.mjs" },
	{ name: "Formal Specs", file: "validate-formal-specs.mjs" },
	{ name: "Workflow Docs", file: "validate-workflow-docs.mjs" },
	{ name: "Benchmark Reports", file: "validate-benchmarks.mjs" },
];

function runScript(script) {
	const scriptPath = path.join(__dirname, script.file);
	return new Promise((resolve) => {
		const child = spawn(process.execPath, [scriptPath], {
			stdio: "inherit",
			env: process.env,
		});

		child.on("close", (code) => {
			resolve({ name: script.name, code: code ?? 1 });
		});

		child.on("error", (err) => {
			console.error(`Failed to start ${script.name} validator:`, err);
			resolve({ name: script.name, code: 1 });
		});
	});
}

console.log("Running documentation validators in parallel...\n");

const results = await Promise.all(scripts.map(runScript));
const failed = results.filter((r) => r.code !== 0);

console.log("\n" + "─".repeat(50));
if (failed.length > 0) {
	console.error(
		`\nDocs validation failed (${failed.length} suite(s) failed: ${failed.map((f) => f.name).join(", ")}).`,
	);
	process.exit(1);
} else {
	console.log("\nAll documentation validation suites passed successfully.");
	process.exit(0);
}
