#!/usr/bin/env bun
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const targetDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();

console.log(`🚀 Syncing skills from ${REPO_ROOT}`);
console.log(`👉 Target project: ${targetDir}`);

const claudeSkillsDir = path.join(targetDir, ".claude", "skills");
const agentsSkillsDir = path.join(targetDir, ".agents", "skills");

fs.mkdirSync(claudeSkillsDir, { recursive: true });

// Promoted engineering and productivity skills to link by default
const defaultSkills = [
  "grill-with-docs",
  "grill-me",
  "to-spec",
  "to-tickets",
  "implement",
  "tdd",
  "code-review",
  "diagnosing-bugs",
  "domain-modeling",
  "codebase-design",
  "improve-codebase-architecture",
  "setup-skills",
  "ask-skills",
  "wait-what",
  "handoff"
];

// Find all SKILL.md paths in engineering/ and productivity/
const engineeringSkillsDir = path.join(REPO_ROOT, "skills", "engineering");
const productivitySkillsDir = path.join(REPO_ROOT, "skills", "productivity");

for (const skillName of defaultSkills) {
  let sourcePath = path.join(engineeringSkillsDir, skillName);
  if (!fs.existsSync(sourcePath)) {
    sourcePath = path.join(productivitySkillsDir, skillName);
  }

  if (fs.existsSync(sourcePath)) {
    const destPath = path.join(claudeSkillsDir, skillName);
    if (fs.existsSync(destPath) || fs.lstatSync(destPath, { throwIfNoEntry: false })) {
      fs.rmSync(destPath, { recursive: true, force: true });
    }
    fs.symlinkSync(sourcePath, destPath, "dir");
    console.log(`  ✓ Linked .claude/skills/${skillName}`);
  } else {
    console.warn(`  ⚠️ Skill not found: ${skillName}`);
  }
}
// Ensure .agents/skills is a symlink pointing to .claude/skills
fs.mkdirSync(path.dirname(agentsSkillsDir), { recursive: true });
if (fs.existsSync(agentsSkillsDir) || fs.lstatSync(agentsSkillsDir, { throwIfNoEntry: false })) {
  fs.rmSync(agentsSkillsDir, { recursive: true, force: true });
}
fs.symlinkSync(claudeSkillsDir, agentsSkillsDir, "dir");
console.log(`  ✓ Symlinked .agents/skills -> .claude/skills`);
console.log(`\n✨ Done! Skills synced successfully to ${targetDir}`);
