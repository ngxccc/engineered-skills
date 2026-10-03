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

const primaryBenchmarkDir = path.resolve("docs/benchmarks");
const fallbackBenchmarkDir = path.resolve("second-brain/Docs/Benchmarks");
const benchmarkDir = fs.existsSync(primaryBenchmarkDir)
	? primaryBenchmarkDir
	: fs.existsSync(fallbackBenchmarkDir)
		? fallbackBenchmarkDir
		: primaryBenchmarkDir;
let failures = 0;

function logError(file, message) {
	console.error(`${colors.red}FAIL:${colors.reset} [${file}] ${message}`);
	failures++;
}

function logSuccess(file, message) {
	console.log(`${colors.green}PASS:${colors.reset} [${file}] ${message}`);
}

if (!fs.existsSync(benchmarkDir)) {
	fs.mkdirSync(benchmarkDir, { recursive: true });
}

const files = fs.readdirSync(benchmarkDir).filter((f) => f.endsWith(".md"));

if (files.length === 0) {
	console.log(
		`${colors.yellow}Warning: No Benchmark Report files found in docs/benchmarks or second-brain/Docs/Benchmarks.${colors.reset}`,
	);
	process.exit(0);
}

console.log(
	`${colors.cyan}Auditing ${files.length} Benchmark & Performance Reports...${colors.reset}\n`,
);

const requiredSectionRules = [
	{
		name: "Executive Summary",
		regex: /##.*(Executive Summary|Tóm tắt)/i,
	},
	{
		name: "Workload / Scenarios / Test Architecture",
		regex: /##.*(Workload|Scenarios|Architecture|Kiến trúc|Kịch bản|Mô hình)/i,
	},
	{
		name: "Key Performance Indicators / Results",
		regex:
			/##.*(Key Performance Indicators|Metrics|Chỉ số|Kết quả|Micro-benchmark|Load Test)/i,
	},
	{
		name: "Bottleneck / Root Cause Analysis",
		regex: /##.*(Bottleneck|Saturation|Root Cause|Nguyên nhân|Phân tích)/i,
	},
	{
		name: "Recommendations / Comparison Matrix",
		regex: /##.*(Recommendations|Comparison|Matrix|Dự báo|Đối chiếu|Đề xuất)/i,
	},
];

for (const file of files) {
	const filePath = path.join(benchmarkDir, file);
	const content = fs.readFileSync(filePath, "utf-8");
	const currentFileFailures = failures;

	// 1. Check filename format (e.g., shows-seats-baseline-no-redis.md or checkout-stress-test.md)
	if (!/^[a-z0-9-]+(-baseline|-benchmark|-perf)?\.md$/.test(file)) {
		logError(
			file,
			"Filename must be kebab-case, e.g., 'shows-seats-baseline-no-redis.md'",
		);
	}

	// 2. Check for H1 Title
	if (!/^#\s+.+/m.test(content)) {
		logError(file, "File must contain a Level 1 Heading (# Title)");
	}

	// 3. Check for metadata Date
	if (!/(\*\*Date\*\*|Date):\s*\d{4}-\d{2}-\d{2}/i.test(content)) {
		logError(
			file,
			"Missing or invalid Date format. Must contain 'Date: YYYY-MM-DD' or '**Date**: YYYY-MM-DD'",
		);
	}

	// 4. Check for metadata Status
	if (!/(\*\*Status\*\*|Status):\s*.+/i.test(content)) {
		logError(
			file,
			"Missing Status metadata. Must contain 'Status: ...' or '**Status**: ...'",
		);
	}

	// 5. Check Required Sections
	for (const rule of requiredSectionRules) {
		if (!rule.regex.test(content)) {
			logError(file, `Missing required section matching '${rule.name}'`);
		}
	}

	if (failures === currentFileFailures) {
		logSuccess(file, "Passed benchmark structural and metadata validation.");
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
		`\n${colors.green}${colors.bold}All Benchmark Reports passed validation cleanly.${colors.reset}`,
	);
	process.exit(0);
}
