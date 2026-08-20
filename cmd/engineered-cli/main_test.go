package main

import (
	"os"
	"path/filepath"
	"testing"

	"engineered-skills/cmd/engineered-cli/config"
	"engineered-skills/cmd/engineered-cli/installer"
	"engineered-skills/cmd/engineered-cli/tui"
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

	// Scaffold skills in engineering, productivity, misc, and .claude/skills
	os.MkdirAll(filepath.Join(tmpDir, ".claude", "skills", "ag-docs"), 0755)
	os.MkdirAll(filepath.Join(tmpDir, "skills", "engineering", "diagnosing-bugs"), 0755)
	os.MkdirAll(filepath.Join(tmpDir, "skills", "productivity", "teach"), 0755)
	os.MkdirAll(filepath.Join(tmpDir, "skills", "misc", "setup-pre-commit"), 0755)

	discovered := config.DiscoverSkills(tmpDir)
	if len(discovered) != 4 {
		t.Fatalf("Expected 4 discovered skills, got %d", len(discovered))
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
