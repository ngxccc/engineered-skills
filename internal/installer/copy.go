package installer

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	"engineered-skills/internal/config"
	"engineered-skills/internal/tui"
)

func CopyFile(src, dst string) error {
	if fi, err := os.Lstat(dst); err == nil {
		if fi.IsDir() || fi.Mode()&os.ModeSymlink != 0 {
			os.RemoveAll(dst)
		}
	}
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()
	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()
	_, err = io.Copy(out, in)
	return err
}

func CopyDir(src, dst string) error {
	if fi, err := os.Lstat(dst); err == nil && fi.Mode()&os.ModeSymlink != 0 {
		os.Remove(dst)
	}
	return filepath.Walk(src, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		rel, err := filepath.Rel(src, path)
		if err != nil {
			return err
		}
		target := filepath.Join(dst, rel)
		if path == src {
			return os.MkdirAll(target, info.Mode())
		}

		if info.Mode()&os.ModeSymlink != 0 {
			linkTarget, err := os.Readlink(path)
			if err != nil {
				return err
			}
			os.RemoveAll(target)
			return os.Symlink(linkTarget, target)
		}

		if info.IsDir() {
			return os.MkdirAll(target, info.Mode())
		}
		return CopyFile(path, target)
	})
}

func ApplyCopyMode(cfg *config.Config) {
	fmt.Println(tui.CyanStyle.Render("\nApplying Copy Mode..."))

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
		prefix := "Copying Selected Skills & Curated Extras..."
		if cfg.IsGlobal {
			prefix = fmt.Sprintf("Globally Copying Selected Skills across %s...", strings.Join(normalizedTargets, ", "))
		}
		fmt.Println(tui.CyanStyle.Render("\n" + prefix))
		var newSkills []string
		var overwrittenSkills []string
		var errorMsgs []string

		for _, skill := range cfg.Skills.Include {
			relSource := config.SkillSourcePath(cfg.KitRepoPath, skill)
			srcPath := filepath.Join(cfg.KitRepoPath, relSource)
			if _, err := os.Stat(srcPath); os.IsNotExist(err) {
				errorMsgs = append(errorMsgs, fmt.Sprintf("Skill source path does not exist: %s", srcPath))
				continue
			}

			skillExisted := false
			skillOverwritten := false

			for _, dir := range targetDirs {
				destPath, _ := filepath.Abs(filepath.Join(dir, skill))
				existedBefore := false
				if _, err := os.Lstat(destPath); err == nil {
					existedBefore = true
					skillExisted = true
					os.RemoveAll(destPath)
				}
				os.MkdirAll(filepath.Dir(destPath), 0o755)
				if err := CopyDir(srcPath, destPath); err != nil {
					errorMsgs = append(errorMsgs, fmt.Sprintf("Error copying skill %s to %s: %v", skill, dir, err))
				} else if existedBefore {
					skillOverwritten = true
				}
			}

			if skillOverwritten || skillExisted {
				overwrittenSkills = append(overwrittenSkills, skill)
			} else {
				newSkills = append(newSkills, skill)
			}
		}

		if len(newSkills) > 0 {
			fmt.Println(tui.GreenStyle.Render(fmt.Sprintf("%s Copied %d new skill(s): %s", tui.IconCheck, len(newSkills), formatSkillList(newSkills))))
		}
		if len(overwrittenSkills) > 0 {
			fmt.Println(tui.GreenStyle.Render(fmt.Sprintf("%s Overwrote/Updated %d existing skill(s): %s", tui.IconUpdate, len(overwrittenSkills), formatSkillList(overwrittenSkills))))
		}
		for _, msg := range errorMsgs {
			fmt.Println(tui.RedStyle.Render(fmt.Sprintf("%s %s", tui.IconError, msg)))
		}
	}
}
