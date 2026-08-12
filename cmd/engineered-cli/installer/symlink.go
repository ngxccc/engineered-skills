package installer

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"engineered-skills/cmd/engineered-cli/config"
	"engineered-skills/cmd/engineered-cli/tui"
)
func formatSkillList(skills []string) string {
	if len(skills) == 0 {
		return ""
	}
	return strings.Join(skills, ", ")
}

func ApplySymlinkMode(cfg *config.Config) {
	fmt.Println(tui.CyanStyle.Render("\nApplying Dev Symlink Mode..."))
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
					if e.Name() != "ag-custom-config.json" {
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

		if len(skippedSkills) == len(cfg.Skills.Include) {
			fmt.Println(tui.YellowStyle.Render(fmt.Sprintf("%s All %d selected skill directories are already present in target project (unmodified)", tui.IconInfo, len(skippedSkills))))
		} else {
			if len(newSkills) > 0 {
				fmt.Println(tui.GreenStyle.Render(fmt.Sprintf("%s Created symlinks for %d new skill(s): %s", tui.IconCheck, len(newSkills), formatSkillList(newSkills))))
			}
			if len(overwrittenSkills) > 0 {
				fmt.Println(tui.GreenStyle.Render(fmt.Sprintf("%s Replaced/Updated symlinks for %d skill(s): %s", tui.IconUpdate, len(overwrittenSkills), formatSkillList(overwrittenSkills))))
			}
			if len(skippedSkills) > 0 {
				fmt.Println(tui.YellowStyle.Render(fmt.Sprintf("%s Preserved %d existing real skill directory(ies) (unmodified)", tui.IconInfo, len(skippedSkills))))
			}
		}
		for _, msg := range errorMsgs {
			fmt.Println(tui.RedStyle.Render(fmt.Sprintf("%s %s", tui.IconError, msg)))
		}
	}
}
