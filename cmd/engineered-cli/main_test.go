package main

import (
	"bytes"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"engineered-skills/internal/config"
	"engineered-skills/internal/installer"
	"engineered-skills/internal/tui"
	tea "github.com/charmbracelet/bubbletea"
)

func TestConfigLoadSave(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "engineered-cli-test-*")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	origWd, _ := os.Getwd()
	os.Chdir(tmpDir)
	defer os.Chdir(origWd)

	cfg := &config.Config{
		Schema:       "https://json.schemastore.org/engineered-config.json",
		Version:      "2.4.2",
		InstallMode:  "symlink",
		SymlinkScope: "bulk",
		KitRepoPath:  tmpDir,
		Targets:      []string{".claude", ".omp"},
		Skills: config.SkillsConfig{
			Mode:    "select",
			Include: []string{"ag-docs"},
		},
		Options: config.OptionsConfig{
			PreserveUserContent:          true,
			RefuseOverwriteNonSymlinkDir: true,
		},
	}

	if err := config.SaveConfig(cfg); err != nil {
		t.Fatalf("saveConfig failed: %v", err)
	}

	loaded := config.LoadConfig()
	if loaded == nil {
		t.Fatalf("loadConfig returned nil")
	}

	if loaded.InstallMode != "symlink" {
		t.Errorf("Expected installMode 'symlink', got '%s'", loaded.InstallMode)
	}
	if len(loaded.Targets) != 2 {
		t.Errorf("Expected 2 targets, got %d", len(loaded.Targets))
	}
}

func TestCopyFileAndDir(t *testing.T) {
	srcDir, err := os.MkdirTemp("", "engineered-cli-src-*")
	if err != nil {
		t.Fatalf("Failed to create src temp dir: %v", err)
	}
	defer os.RemoveAll(srcDir)

	dstDir, err := os.MkdirTemp("", "engineered-cli-dst-*")
	if err != nil {
		t.Fatalf("Failed to create dst temp dir: %v", err)
	}
	defer os.RemoveAll(dstDir)

	testFile := filepath.Join(srcDir, "test.txt")
	os.WriteFile(testFile, []byte("hello world"), 0644)

	subDir := filepath.Join(srcDir, "sub")
	os.MkdirAll(subDir, 0755)
	subFile := filepath.Join(subDir, "sub.txt")
	os.WriteFile(subFile, []byte("sub content"), 0644)

	if err := installer.CopyDir(srcDir, dstDir); err != nil {
		t.Fatalf("copyDir failed: %v", err)
	}

	copiedContent, err := os.ReadFile(filepath.Join(dstDir, "test.txt"))
	if err != nil || string(copiedContent) != "hello world" {
		t.Errorf("Copied file content mismatch: %v", err)
	}

	copiedSubContent, err := os.ReadFile(filepath.Join(dstDir, "sub", "sub.txt"))
	if err != nil || string(copiedSubContent) != "sub content" {
		t.Errorf("Copied subfile content mismatch: %v", err)
	}
}

func TestModeSelectModelKeyHandling(t *testing.T) {
	m := tui.ModeSelectModel{
		Choices: []string{"Copy Mode (Default)", "Dev Symlink Mode"},
		Hints:   []string{"hint 1", "hint 2"},
	}

	// Press 'j' or down arrow -> cursor = 1
	updated, _ := m.Update(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{'j'}})
	m = updated.(tui.ModeSelectModel)
	if m.Cursor != 1 {
		t.Errorf("Expected cursor 1 after 'j', got %d", m.Cursor)
	}

	// Press 'k' or up arrow -> cursor = 0
	updated, _ = m.Update(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{'k'}})
	m = updated.(tui.ModeSelectModel)
	if m.Cursor != 0 {
		t.Errorf("Expected cursor 0 after 'k', got %d", m.Cursor)
	}

	// Press enter -> selected = Copy Mode (Default)
	updated, _ = m.Update(tea.KeyMsg{Type: tea.KeyEnter})
	m = updated.(tui.ModeSelectModel)
	if m.Selected != "Copy Mode (Default)" {
		t.Errorf("Expected selected 'Copy Mode (Default)', got '%s'", m.Selected)
	}
}

func TestCheckboxModelKeyHandling(t *testing.T) {
	m := tui.CheckboxModel{
		Title: "Select Targets",
		Items: []tui.CheckboxItem{
			{Name: "item1", Selected: true},
			{Name: "item2", Selected: true},
		},
	}

	// Press 'j' -> move to index 1
	updated, _ := m.Update(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{'j'}})
	m = updated.(tui.CheckboxModel)
	if m.Cursor != 1 {
		t.Errorf("Expected cursor 1, got %d", m.Cursor)
	}

	// Press space -> toggle item2 selected to false
	updated, _ = m.Update(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{' '}})
	m = updated.(tui.CheckboxModel)
	if m.Items[1].Selected {
		t.Errorf("Expected item 1 selected false after space toggle")
	}

	// Press 'a' -> toggle all (since not all selected, select all)
	updated, _ = m.Update(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{'a'}})
	m = updated.(tui.CheckboxModel)
	if !m.Items[0].Selected || !m.Items[1].Selected {
		t.Errorf("Expected all items selected after 'a'")
	}

	// Press Enter -> confirm
	updated, _ = m.Update(tea.KeyMsg{Type: tea.KeyEnter})
	m = updated.(tui.CheckboxModel)
	if !m.Confirmed {
		t.Errorf("Expected confirmed true after enter")
	}
}
func TestDiscoverSkillsAndSourcePath(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "engineered-cli-skills-test-*")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	// Scaffold skills in engineering, productivity, in-progress, misc, and .claude/skills
	os.MkdirAll(filepath.Join(tmpDir, ".claude", "skills", "ag-docs"), 0755)
	os.MkdirAll(filepath.Join(tmpDir, "skills", "engineering", "diagnosing-bugs"), 0755)
	os.MkdirAll(filepath.Join(tmpDir, "skills", "productivity", "teach"), 0755)
	os.MkdirAll(filepath.Join(tmpDir, "skills", "in-progress", "writing-polish"), 0755)
	os.MkdirAll(filepath.Join(tmpDir, "skills", "misc", "setup-pre-commit"), 0755)

	discovered := config.DiscoverSkills(tmpDir)
	if len(discovered) != 5 {
		t.Fatalf("Expected 5 discovered skills, got %d", len(discovered))
	}

	sourcePathAgDocs := config.SkillSourcePath(tmpDir, "ag-docs")
	expectedAgDocs := filepath.Join(".claude", "skills", "ag-docs")
	if sourcePathAgDocs != expectedAgDocs {
		t.Errorf("Expected source path '%s', got '%s'", expectedAgDocs, sourcePathAgDocs)
	}

	sourcePathBug := config.SkillSourcePath(tmpDir, "diagnosing-bugs")
	expectedBug := filepath.Join("skills", "engineering", "diagnosing-bugs")
	if sourcePathBug != expectedBug {
		t.Errorf("Expected source path '%s', got '%s'", expectedBug, sourcePathBug)
	}

	sourcePathInProgress := config.SkillSourcePath(tmpDir, "writing-polish")
	expectedInProgress := filepath.Join("skills", "in-progress", "writing-polish")
	if sourcePathInProgress != expectedInProgress {
		t.Errorf("Expected source path '%s', got '%s'", expectedInProgress, sourcePathInProgress)
	}

	sourcePathMisc := config.SkillSourcePath(tmpDir, "setup-pre-commit")
	expectedMisc := filepath.Join("skills", "misc", "setup-pre-commit")
	if sourcePathMisc != expectedMisc {
		t.Errorf("Expected source path '%s', got '%s'", expectedMisc, sourcePathMisc)
	}
}
func TestResolveDependencies(t *testing.T) {
	selected := []string{"implement"}
	resolved := config.ResolveDependencies(selected)

	expectedMap := map[string]bool{
		"implement":   true,
		"tdd":         true,
		"code-review": true,
		"git-flow":    true,
	}

	if len(resolved) != len(expectedMap) {
		t.Errorf("Expected %d resolved skills for 'implement', got %d (%v)", len(expectedMap), len(resolved), resolved)
	}
	for _, s := range resolved {
		if !expectedMap[s] {
			t.Errorf("Unexpected skill '%s' in resolved dependencies", s)
		}
	}
}

func TestParseSubcommand(t *testing.T) {
	subcmd, isGlobal, kitPath, cmdArgs := parseSubcommand([]string{"enable", "dashboard-ui", "tdd"})
	if subcmd != "enable" {
		t.Errorf("Expected subcmd 'enable', got '%s'", subcmd)
	}
	if isGlobal {
		t.Errorf("Expected isGlobal false, got true")
	}
	if len(cmdArgs) != 2 || cmdArgs[0] != "dashboard-ui" || cmdArgs[1] != "tdd" {
		t.Errorf("Unexpected cmdArgs: %v", cmdArgs)
	}

	subcmd, isGlobal, kitPath, cmdArgs = parseSubcommand([]string{"--global", "enable", "git-flow"})
	if subcmd != "enable" || !isGlobal {
		t.Errorf("Expected enable + global, got subcmd=%s, isGlobal=%v", subcmd, isGlobal)
	}
	if len(cmdArgs) != 1 || cmdArgs[0] != "git-flow" {
		t.Errorf("Unexpected cmdArgs: %v", cmdArgs)
	}

	subcmd, isGlobal, kitPath, cmdArgs = parseSubcommand([]string{"disable", "-g", "dashboard-ui"})
	if subcmd != "disable" || !isGlobal {
		t.Errorf("Expected disable + global, got subcmd=%s, isGlobal=%v", subcmd, isGlobal)
	}
	if len(cmdArgs) != 1 || cmdArgs[0] != "dashboard-ui" {
		t.Errorf("Unexpected cmdArgs: %v", cmdArgs)
	}

	subcmd, _, _, _ = parseSubcommand([]string{"status"})
	if subcmd != "status" {
		t.Errorf("Expected status subcmd, got %s", subcmd)
	}

	if kitPath != "" {
		t.Errorf("Unexpected kitPath %s", kitPath)
	}
}

func TestProfiles(t *testing.T) {
	mockSkills := []config.SkillInfo{
		{Name: "ask-skills"},
		{Name: "git-flow"},
		{Name: "dashboard-ui"},
	}

	coreSkills, ok := config.GetProfileSkills("core", mockSkills)
	if !ok || len(coreSkills) == 0 {
		t.Fatalf("Expected core profile to exist")
	}

	fullSkills, ok := config.GetProfileSkills("full", mockSkills)
	if !ok || len(fullSkills) != len(mockSkills) {
		t.Fatalf("Expected full profile to contain %d skills, got %d", len(mockSkills), len(fullSkills))
	}

	_, ok = config.GetProfileSkills("non-existent-profile", mockSkills)
	if ok {
		t.Fatalf("Expected non-existent profile to return false")
	}
}

func TestEnableAndDisableSkills(t *testing.T) {
	tmpKit, err := os.MkdirTemp("", "kit-repo-*")
	if err != nil {
		t.Fatalf("Failed to create temp kit: %v", err)
	}
	defer os.RemoveAll(tmpKit)

	skillDir := filepath.Join(tmpKit, "skills", "engineering", "my-skill")
	if err := os.MkdirAll(skillDir, 0755); err != nil {
		t.Fatalf("Failed to create mock skill dir: %v", err)
	}
	os.WriteFile(filepath.Join(skillDir, "SKILL.md"), []byte("# My Skill"), 0644)

	tmpProject, err := os.MkdirTemp("", "project-*")
	if err != nil {
		t.Fatalf("Failed to create temp project: %v", err)
	}
	defer os.RemoveAll(tmpProject)

	origWd, _ := os.Getwd()
	os.Chdir(tmpProject)
	defer os.Chdir(origWd)

	// Test Enable
	enabled, err := installer.EnableSkills(tmpKit, []string{"my-skill"}, false)
	if err != nil {
		t.Fatalf("EnableSkills failed: %v", err)
	}
	if len(enabled) != 1 || enabled[0] != "my-skill" {
		t.Errorf("Unexpected enabled list: %v", enabled)
	}

	symlinkPath := filepath.Join(".claude", "skills", "my-skill")
	fi, err := os.Lstat(symlinkPath)
	if err != nil || fi.Mode()&os.ModeSymlink == 0 {
		t.Fatalf("Expected symlink at %s, got err=%v", symlinkPath, err)
	}

	cfg := config.LoadConfig()
	if cfg == nil || len(cfg.Skills.Include) != 1 || cfg.Skills.Include[0] != "my-skill" {
		t.Fatalf("Expected config with my-skill, got %v", cfg)
	}

	// Test Disable
	disabled, err := installer.DisableSkills([]string{"my-skill"}, false)
	if err != nil {
		t.Fatalf("DisableSkills failed: %v", err)
	}
	if len(disabled) != 1 || disabled[0] != "my-skill" {
		t.Errorf("Unexpected disabled list: %v", disabled)
	}

	if _, err := os.Lstat(symlinkPath); !os.IsNotExist(err) {
		t.Fatalf("Expected symlink to be removed at %s", symlinkPath)
	}

	cfgAfter := config.LoadConfig()
	if cfgAfter == nil || len(cfgAfter.Skills.Include) != 0 {
		t.Fatalf("Expected config skills include to be empty, got %v", cfgAfter.Skills.Include)
	}
}

func TestRunVersion(t *testing.T) {
	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	err := run([]string{"--version"}, stdout, stderr)
	if err != nil {
		t.Fatalf("run --version failed: %v", err)
	}
	if !strings.Contains(stdout.String(), "engineered-cli v") {
		t.Errorf("Expected version in stdout, got: %s", stdout.String())
	}
}

func TestRunHelp(t *testing.T) {
	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	err := run([]string{"--help"}, stdout, stderr)
	if err != nil {
		t.Fatalf("run --help failed: %v", err)
	}
	if !strings.Contains(stdout.String(), "Usage:") {
		t.Errorf("Expected Usage in stdout, got: %s", stdout.String())
	}
}

func TestRunUnknownProfile(t *testing.T) {
	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	err := run([]string{"--profile", "invalid-profile-xyz"}, stdout, stderr)
	if err == nil {
		t.Fatalf("Expected error for unknown profile, got nil")
	}
	if !strings.Contains(err.Error(), "unknown profile") {
		t.Errorf("Expected 'unknown profile' in error, got: %v", err)
	}
}

func TestRunStatus(t *testing.T) {
	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	err := run([]string{"status"}, stdout, stderr)
	if err != nil {
		t.Fatalf("run status failed: %v", err)
	}
	if !strings.Contains(stdout.String(), "ENGINEERED SKILLS STATUS") {
		t.Errorf("Expected status in stdout, got: %s", stdout.String())
	}
}

func TestRunDryRun(t *testing.T) {
	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	err := run([]string{"--dry-run", "--profile", "core", "--yes"}, stdout, stderr)
	if err != nil {
		t.Fatalf("run dry-run failed: %v", err)
	}
	if !strings.Contains(stdout.String(), "[DRY RUN]") {
		t.Errorf("Expected DRY RUN in stdout, got: %s", stdout.String())
	}
}
