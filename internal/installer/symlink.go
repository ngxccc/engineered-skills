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

func ApplySymlinkMode(cfg *config.Config) {
	targetsList := cfg.Targets
	if len(targetsList) == 0 && len(cfg.SymlinkTargets) > 0 {
		targetsList = cfg.SymlinkTargets
	}
	if len(targetsList) == 0 {
		if cfg.IsGlobal {
			fmt.Println(tui.RedStyle.Render(fmt.Sprintf("%s --global requires specifying target harness: claude, omp, agents, or all", tui.IconError)))
			return
		}
		targetsList = config.DetectProjectTargets()
	}

	targetDirs, normalizedTargets, err := config.ResolveTargetDirs(targetsList, cfg.IsGlobal)
	if err != nil {
		fmt.Println(tui.RedStyle.Render(fmt.Sprintf("%s Invalid targets: %v", tui.IconError, err)))
		return
	}

	for _, dir := range targetDirs {
		if fi, err := os.Lstat(dir); err == nil && fi.Mode()&os.ModeSymlink != 0 {
			_ = os.Remove(dir)
		}
		_ = os.MkdirAll(dir, 0o755)
	}

	if len(cfg.Skills.Include) > 0 {
		prefix := "Symlinking Selected Skills & Curated Extras..."
		if cfg.IsGlobal {
			prefix = fmt.Sprintf("Globally Symlinking Selected Skills across %s...", strings.Join(normalizedTargets, ", "))
		}
		fmt.Println(tui.CyanStyle.Render("\n" + prefix))
		var newSkills []string
		var overwrittenSkills []string
		var skippedSkills []string
		var errorMsgs []string

		for _, skill := range cfg.Skills.Include {
			relSource := config.SkillSourcePath(cfg.KitRepoPath, skill)
			srcPath := filepath.Join(cfg.KitRepoPath, relSource)
			if _, err := os.Stat(srcPath); os.IsNotExist(err) {
				errorMsgs = append(errorMsgs, fmt.Sprintf("Skill source not found: %s", skill))
				continue
			}

			skillExisted := false
			skillOverwritten := false
			skillSkipped := false

			for _, dir := range targetDirs {
				destPath, _ := filepath.Abs(filepath.Join(dir, skill))
				existedBefore := false
				isRealDir := false
				if fi, err := os.Lstat(destPath); err == nil {
					existedBefore = true
					if fi.Mode()&os.ModeSymlink == 0 {
						isRealDir = true
					}
				}

				if existedBefore && isRealDir && cfg.Options.RefuseOverwriteNonSymlinkDir {
					skillSkipped = true
					continue
				}

				if existedBefore {
					_ = os.RemoveAll(destPath)
					skillExisted = true
				}

				_ = os.MkdirAll(filepath.Dir(destPath), 0o755)
				if err := os.Symlink(srcPath, destPath); err != nil {
					errorMsgs = append(errorMsgs, fmt.Sprintf("Error creating symlink for %s in %s: %v", skill, dir, err))
				} else if existedBefore {
					skillOverwritten = true
				}
			}

			if skillSkipped {
				skippedSkills = append(skippedSkills, skill)
			} else if skillOverwritten || skillExisted {
				overwrittenSkills = append(overwrittenSkills, skill)
			} else {
				newSkills = append(newSkills, skill)
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
		for _, msg := range errorMsgs {
			fmt.Println(tui.RedStyle.Render(fmt.Sprintf("%s %s", tui.IconError, msg)))
		}
	}
}

// EnableSkills links specified skills and updates the config.
func EnableSkills(kitRepoPath string, skills []string, isGlobal bool, targets []string) ([]string, error) {
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

	var targetsToUse []string
	if len(targets) > 0 {
		targetsToUse = targets
	} else if isGlobal {
		return nil, fmt.Errorf("--global requires specifying target harness: claude, omp, agents, or all")
	} else {
		existingCfg := config.LoadConfigWithScope(false)
		if existingCfg != nil && len(existingCfg.Targets) > 0 {
			targetsToUse = existingCfg.Targets
		} else {
			targetsToUse = config.DetectProjectTargets()
		}
	}

	targetDirs, normalizedTargets, err := config.ResolveTargetDirs(targetsToUse, isGlobal)
	if err != nil {
		return nil, err
	}

	for _, dir := range targetDirs {
		if fi, err := os.Lstat(dir); err == nil && fi.Mode()&os.ModeSymlink != 0 {
			_ = os.Remove(dir)
		}
		if err := os.MkdirAll(dir, 0o755); err != nil {
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

	cfg := config.LoadConfigWithScope(isGlobal)
	if cfg == nil {
		var cfgTargets []string
		if isGlobal {
			cfgTargets = normalizedTargets
		} else {
			for _, t := range normalizedTargets {
				cfgTargets = append(cfgTargets, "."+t)
			}
		}
		cfg = &config.Config{
			Version:        "1.0.0",
			UpdatedAt:      time.Now().Format(time.RFC3339),
			InstallMode:    "symlink",
			SymlinkScope:   "bulk",
			KitRepoPath:    kitRepoPath,
			IsGlobal:       isGlobal,
			Targets:        cfgTargets,
			SymlinkTargets: cfgTargets,
			Skills: config.SkillsConfig{
				Mode:    "select",
				Include: []string{},
				Exclude: []string{},
			},
			Options: config.OptionsConfig{
				PreserveUserContent:          true,
				RefuseOverwriteNonSymlinkDir: true,
			},
		}
	} else {
		targetMap := make(map[string]bool)
		for _, t := range cfg.Targets {
			raw := strings.TrimPrefix(strings.ToLower(strings.TrimSpace(t)), ".")
			targetMap[raw] = true
		}
		for _, t := range normalizedTargets {
			if !targetMap[t] {
				targetName := t
				if !isGlobal {
					targetName = "." + t
				}
				cfg.Targets = append(cfg.Targets, targetName)
				cfg.SymlinkTargets = append(cfg.SymlinkTargets, targetName)
				targetMap[t] = true
			}
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
func DisableSkills(skills []string, isGlobal bool, targets []string) ([]string, error) {
	if len(skills) == 0 {
		return nil, fmt.Errorf("no skills provided")
	}

	var targetsToUse []string
	if len(targets) > 0 {
		targetsToUse = targets
	} else if isGlobal {
		targetsToUse = []string{"claude", "omp", "agents"}
	} else {
		existingCfg := config.LoadConfigWithScope(false)
		if existingCfg != nil && len(existingCfg.Targets) > 0 {
			targetsToUse = existingCfg.Targets
		} else {
			targetsToUse = config.DetectProjectTargets()
		}
	}

	targetDirs, _, err := config.ResolveTargetDirs(targetsToUse, isGlobal)
	if err != nil {
		return nil, err
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
