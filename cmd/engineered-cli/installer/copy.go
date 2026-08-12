package installer

import (
	"fmt"
	"io"
	"os"
	"path/filepath"

	"engineered-skills/cmd/engineered-cli/config"
	"engineered-skills/cmd/engineered-cli/tui"
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
	for _, target := range cfg.Targets {
		srcPath := filepath.Join(cfg.KitRepoPath, target)
		destPath, _ := filepath.Abs(target)

		if _, err := os.Stat(srcPath); os.IsNotExist(err) {
			fmt.Println(tui.YellowStyle.Render(fmt.Sprintf("%s Source path does not exist in kit repo: %s", tui.IconWarn, srcPath)))
			continue
		}
		if _, err := os.Lstat(destPath); err == nil {
			os.RemoveAll(destPath)
		}
		destParent := filepath.Dir(destPath)
		os.MkdirAll(destParent, 0755)

		if err := CopyDir(srcPath, destPath); err != nil {
			fmt.Println(tui.RedStyle.Render(fmt.Sprintf("%s Error copying %s: %v", tui.IconError, destPath, err)))
		} else {
			fmt.Println(tui.GreenStyle.Render(fmt.Sprintf("%s Copied %s -> %s", tui.IconCheck, target, destPath)))
		}
	}

	if len(cfg.Skills.Include) > 0 {
		fmt.Println(tui.CyanStyle.Render("\nCopying Selected Skills & Curated Extras..."))
		var newSkills []string
		var overwrittenSkills []string
		var errorMsgs []string

		for _, skill := range cfg.Skills.Include {
			relSource := config.SkillSourcePath(cfg.KitRepoPath, skill)
			srcPath := filepath.Join(cfg.KitRepoPath, relSource)
			destPath, _ := filepath.Abs(filepath.Join(".claude", "skills", skill))

			if _, err := os.Stat(srcPath); os.IsNotExist(err) {
				errorMsgs = append(errorMsgs, fmt.Sprintf("Skill source path does not exist: %s", srcPath))
				continue
			}

			existedBefore := false
			if _, err := os.Lstat(destPath); err == nil {
				existedBefore = true
				os.RemoveAll(destPath)
			}
			os.MkdirAll(filepath.Dir(destPath), 0755)
			if err := CopyDir(srcPath, destPath); err != nil {
				errorMsgs = append(errorMsgs, fmt.Sprintf("Error copying skill %s: %v", skill, err))
			} else if existedBefore {
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
