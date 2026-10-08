package installer

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"engineered-skills/internal/config"
	"engineered-skills/internal/tui"
)
func formatSkillList(skills []string) string {
	if len(skills) == 0 {
		return ""
	}
	return strings.Join(skills, ", ")
}

func isTargetSelected(cfg *config.Config, name string) bool {
	for _, t := range cfg.Targets {
		if t == name {
			return true
		}
	}
	for _, t := range cfg.SymlinkTargets {
		if t == name {
			return true
		}
	}
	return false
}

func ApplySymlinkMode(cfg *config.Config) {
	if cfg.IsGlobal {
		home, err := os.UserHomeDir()
		if err != nil {
			fmt.Println(tui.RedStyle.Render(fmt.Sprintf("%s Failed to get user home directory: %v", tui.IconError, err)))
			return
		}
		targetDirs := []string{
			filepath.Join(home, ".claude", "skills"),
			filepath.Join(home, ".omp", "agent", "skills"),
			filepath.Join(home, ".agents", "skills"),
		}

		for _, dir := range targetDirs {
			_ = os.MkdirAll(dir, 0755)
		}

		var linkedSkills []string
		for _, skill := range cfg.Skills.Include {
			relSource := config.SkillSourcePath(cfg.KitRepoPath, skill)
			srcPath := filepath.Join(cfg.KitRepoPath, relSource)
			if _, err := os.Stat(srcPath); os.IsNotExist(err) {
				fmt.Println(tui.YellowStyle.Render(fmt.Sprintf("%s Skill source not found in kit repo: %s", tui.IconWarn, skill)))
				continue
			}

			for _, dir := range targetDirs {
				destPath := filepath.Join(dir, skill)
				if fi, err := os.Lstat(destPath); err == nil {
					if fi.Mode()&os.ModeSymlink != 0 {
						_ = os.Remove(destPath)
					} else {
						_ = os.RemoveAll(destPath)
					}
				}
				if err := os.Symlink(srcPath, destPath); err != nil {
					fmt.Println(tui.RedStyle.Render(fmt.Sprintf("%s Error creating global symlink for %s in %s: %v", tui.IconError, skill, dir, err)))
				}
			}
			linkedSkills = append(linkedSkills, skill)
		}
		fmt.Println(tui.GreenStyle.Render(fmt.Sprintf("%s Globally linked %d skill(s) across ~/.claude, ~/.omp, ~/.agents: %s", tui.IconCheck, len(linkedSkills), formatSkillList(linkedSkills))))
		return
	}

	for _, target := range cfg.Targets {
		srcPath := filepath.Join(cfg.KitRepoPath, target)
		destPath, _ := filepath.Abs(target)

		if _, err := os.Stat(srcPath); os.IsNotExist(err) {
			fmt.Println(tui.YellowStyle.Render(fmt.Sprintf("%s Source path does not exist in kit repo: %s", tui.IconWarn, srcPath)))
			continue
		}

		if fi, err := os.Lstat(destPath); err == nil {
			if fi.Mode()&os.ModeSymlink == 0 {
				entries, _ := os.ReadDir(destPath)
				hasOtherFiles := false
				for _, e := range entries {
					if e.Name() != "engineered-config.json" {
						hasOtherFiles = true
						break
					}
				}
				if len(entries) > 0 && hasOtherFiles && cfg.Options.RefuseOverwriteNonSymlinkDir {
					fmt.Println(tui.YellowStyle.Render(fmt.Sprintf("%s Refusing to overwrite existing real directory: %s", tui.IconWarn, destPath)))
					continue
				}
			}
			os.RemoveAll(destPath)
		}

		destParent := filepath.Dir(destPath)
		os.MkdirAll(destParent, 0o755)

		if err := os.Symlink(srcPath, destPath); err != nil {
			fmt.Println(tui.RedStyle.Render(fmt.Sprintf("%s Error creating symlink %s: %v", tui.IconError, destPath, err)))
		} else {
			fmt.Println(tui.GreenStyle.Render(fmt.Sprintf("%s Symlinked %s -> %s", tui.IconCheck, target, srcPath)))
		}
	}
	if len(cfg.Skills.Include) > 0 {
		fmt.Println(tui.CyanStyle.Render("\nSymlinking Selected Skills & Curated Extras..."))
		var newSkills []string
		var overwrittenSkills []string
		var skippedSkills []string
		var errorMsgs []string

		for _, skill := range cfg.Skills.Include {
			relSource := config.SkillSourcePath(cfg.KitRepoPath, skill)
			srcPath := filepath.Join(cfg.KitRepoPath, relSource)
			destPath, _ := filepath.Abs(filepath.Join(".claude", "skills", skill))

			if _, err := os.Stat(srcPath); os.IsNotExist(err) {
				errorMsgs = append(errorMsgs, fmt.Sprintf("Skill source not found: %s", skill))
				continue
			}

			existedBefore := false
			isRealDir := false
			if fi, err := os.Lstat(destPath); err == nil {
				existedBefore = true
				if fi.Mode()&os.ModeSymlink == 0 {
					isRealDir = true
				}
			}

			if existedBefore && isRealDir && cfg.Options.RefuseOverwriteNonSymlinkDir {
				skippedSkills = append(skippedSkills, skill)
				continue
			}

			if existedBefore {
				os.RemoveAll(destPath)
			}

			os.MkdirAll(filepath.Dir(destPath), 0o755)
			if err := os.Symlink(srcPath, destPath); err != nil {
				errorMsgs = append(errorMsgs, fmt.Sprintf("Error creating symlink for %s: %v", skill, err))
			} else if existedBefore {
				overwrittenSkills = append(overwrittenSkills, skill)
			} else {
				newSkills = append(newSkills, skill)
			}
		}

		// Symlink .agents/skills -> .claude/skills ONLY if .agents target was selected by user
		if isTargetSelected(cfg, ".agents") {
			claudeSkillsPath, _ := filepath.Abs(filepath.Join(".claude", "skills"))
			agentsSkillsPath, _ := filepath.Abs(filepath.Join(".agents", "skills"))
			if _, err := os.Stat(claudeSkillsPath); err == nil {
				os.MkdirAll(filepath.Dir(agentsSkillsPath), 0755)
				os.RemoveAll(agentsSkillsPath)
				_ = os.Symlink(claudeSkillsPath, agentsSkillsPath)
				fmt.Println(tui.GreenStyle.Render(fmt.Sprintf("%s Symlinked .agents/skills -> .claude/skills", tui.IconCheck)))
			}
		}
		// Symlink .omp/skills -> .claude/skills ONLY if .omp target was selected by user
		if isTargetSelected(cfg, ".omp") {
			claudeSkillsPath, _ := filepath.Abs(filepath.Join(".claude", "skills"))
			ompSkillsPath, _ := filepath.Abs(filepath.Join(".omp", "skills"))
			if _, err := os.Stat(claudeSkillsPath); err == nil {
				os.MkdirAll(filepath.Dir(ompSkillsPath), 0755)
				os.RemoveAll(ompSkillsPath)
				_ = os.Symlink(claudeSkillsPath, ompSkillsPath)
				fmt.Println(tui.GreenStyle.Render(fmt.Sprintf("%s Symlinked .omp/skills -> .claude/skills", tui.IconCheck)))
			}
		}
		if len(newSkills) > 0 {
			fmt.Println(tui.GreenStyle.Render(fmt.Sprintf("%s Linked %d new skill(s): %s", tui.IconCheck, len(newSkills), formatSkillList(newSkills))))
		}
		if len(overwrittenSkills) > 0 {
			fmt.Println(tui.YellowStyle.Render(fmt.Sprintf("%s Overwrote %d skill symlink(s): %s", tui.IconWarn, len(overwrittenSkills), formatSkillList(overwrittenSkills))))
		}
		if len(skippedSkills) > 0 {
			fmt.Println(tui.YellowStyle.Render(fmt.Sprintf("%s Skipped %d skill(s) (existing real directory): %s", tui.IconWarn, len(skippedSkills), formatSkillList(skippedSkills))))
		}
	}
}

// EnableSkills links specified skills and updates the config.
func EnableSkills(kitRepoPath string, skills []string, isGlobal bool) ([]string, error) {
	if len(skills) == 0 {
		return nil, fmt.Errorf("no skills provided")
	}

	for _, skill := range skills {
		relSource := config.SkillSourcePath(kitRepoPath, skill)
		srcPath := filepath.Join(kitRepoPath, relSource)
		if _, err := os.Stat(srcPath); os.IsNotExist(err) {
			return nil, fmt.Errorf("skill '%s' not found in kit repo (%s)", skill, srcPath)
		}
	}

	resolved := config.ResolveDependencies(skills)

	var targetDirs []string
	if isGlobal {
		home, err := os.UserHomeDir()
		if err != nil {
			return nil, fmt.Errorf("failed to get user home dir: %w", err)
		}
		targetDirs = []string{
			filepath.Join(home, ".claude", "skills"),
			filepath.Join(home, ".omp", "agent", "skills"),
			filepath.Join(home, ".agents", "skills"),
		}
	} else {
		targetDirs = []string{
			filepath.Join(".claude", "skills"),
		}
	}

	for _, dir := range targetDirs {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return nil, fmt.Errorf("failed to create directory %s: %w", dir, err)
		}
	}

	for _, skill := range resolved {
		relSource := config.SkillSourcePath(kitRepoPath, skill)
		srcPath := filepath.Join(kitRepoPath, relSource)

		for _, dir := range targetDirs {
			destPath := filepath.Join(dir, skill)
			if fi, err := os.Lstat(destPath); err == nil {
				if fi.Mode()&os.ModeSymlink != 0 {
					_ = os.Remove(destPath)
				} else {
					_ = os.RemoveAll(destPath)
				}
			}
			if err := os.Symlink(srcPath, destPath); err != nil {
				return nil, fmt.Errorf("failed to symlink %s -> %s: %w", destPath, srcPath, err)
			}
		}
	}

	if !isGlobal {
		claudeSkillsPath, _ := filepath.Abs(filepath.Join(".claude", "skills"))
		agentsSkillsPath, _ := filepath.Abs(filepath.Join(".agents", "skills"))
		ompSkillsPath, _ := filepath.Abs(filepath.Join(".omp", "skills"))

		_ = os.MkdirAll(filepath.Dir(agentsSkillsPath), 0755)
		_ = os.Remove(agentsSkillsPath)
		_ = os.Symlink(claudeSkillsPath, agentsSkillsPath)

		_ = os.MkdirAll(filepath.Dir(ompSkillsPath), 0755)
		_ = os.Remove(ompSkillsPath)
		_ = os.Symlink(claudeSkillsPath, ompSkillsPath)
	}

	cfg := config.LoadConfigWithScope(isGlobal)
	if cfg == nil {
		cfg = &config.Config{
			Version:     "1.0.0",
			UpdatedAt:   time.Now().Format(time.RFC3339),
			InstallMode: "symlink",
			KitRepoPath: kitRepoPath,
			IsGlobal:    isGlobal,
			Targets:     []string{".claude", ".agents", ".omp"},
			Skills: config.SkillsConfig{
				Mode:    "select",
				Include: []string{},
			},
			Options: config.OptionsConfig{
				PreserveUserContent:          true,
				RefuseOverwriteNonSymlinkDir: true,
			},
		}
	}
	cfg.UpdatedAt = time.Now().Format(time.RFC3339)

	existingMap := make(map[string]bool)
	for _, s := range cfg.Skills.Include {
		existingMap[s] = true
	}
	for _, s := range resolved {
		if !existingMap[s] {
			cfg.Skills.Include = append(cfg.Skills.Include, s)
			existingMap[s] = true
		}
	}

	if err := config.SaveConfigWithScope(cfg, isGlobal); err != nil {
		return nil, fmt.Errorf("failed to save config: %w", err)
	}

	return resolved, nil
}

// DisableSkills unlinks specified skills and updates the config.
func DisableSkills(skills []string, isGlobal bool) ([]string, error) {
	if len(skills) == 0 {
		return nil, fmt.Errorf("no skills provided")
	}

	var targetDirs []string
	if isGlobal {
		home, err := os.UserHomeDir()
		if err != nil {
			return nil, fmt.Errorf("failed to get user home dir: %w", err)
		}
		targetDirs = []string{
			filepath.Join(home, ".claude", "skills"),
			filepath.Join(home, ".omp", "agent", "skills"),
			filepath.Join(home, ".agents", "skills"),
		}
	} else {
		targetDirs = []string{
			filepath.Join(".claude", "skills"),
		}
	}

	for _, skill := range skills {
		for _, dir := range targetDirs {
			destPath := filepath.Join(dir, skill)
			if fi, err := os.Lstat(destPath); err == nil {
				if fi.Mode()&os.ModeSymlink != 0 {
					_ = os.Remove(destPath)
				} else {
					_ = os.RemoveAll(destPath)
				}
			}
		}
	}

	cfg := config.LoadConfigWithScope(isGlobal)
	if cfg != nil {
		toRemove := make(map[string]bool)
		for _, s := range skills {
			toRemove[s] = true
		}
		var newInclude []string
		for _, s := range cfg.Skills.Include {
			if !toRemove[s] {
				newInclude = append(newInclude, s)
			}
		}
		cfg.Skills.Include = newInclude
		cfg.UpdatedAt = time.Now().Format(time.RFC3339)
		_ = config.SaveConfigWithScope(cfg, isGlobal)
	}

	return skills, nil
}
