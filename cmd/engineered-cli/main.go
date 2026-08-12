package main

import (
	"bufio"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"engineered-skills/cmd/engineered-cli/config"
	"engineered-skills/cmd/engineered-cli/installer"
	"engineered-skills/cmd/engineered-cli/tui"
	"github.com/mattn/go-isatty"
)

var version = "2.4.2"

func main() {
	showVersion := flag.Bool("version", false, "Show CLI version")
	flag.BoolVar(showVersion, "v", false, "Show CLI version")
	dryRun := flag.Bool("dry-run", false, "Run without writing to disk")
	nonInteractive := flag.Bool("yes", false, "Accept defaults without prompting")
	flag.BoolVar(nonInteractive, "y", false, "Accept defaults without prompting")
	symlinkModeFlag := flag.Bool("link", false, "Use Dev Symlink Mode")
	flag.BoolVar(symlinkModeFlag, "symlink", false, "Use Dev Symlink Mode")
	kitPathOpt := flag.String("kit-path", "", "Local kit repository path")
	targetsOpt := flag.String("targets", "", "Comma-separated target layers")
	skillsOpt := flag.String("skills", "", "Comma-separated skills")
	symlinkScopeOpt := flag.String("symlink-scope", "bulk", "Symlink scope")

	flag.Parse()

	if *showVersion {
		fmt.Printf("engineered-cli v%s\n", strings.TrimPrefix(version, "v"))
		return
	}
	fmt.Println(tui.CyanStyle.Render(tui.IconLogo+" ENGINEERED SKILLS") + " " + tui.BadgeStyle.Render("v"+version) + "  " + tui.GrayStyle.Render("Interactive Harness Customizer\n"))

	existingCfg := config.LoadConfig()

	installMode := "copy"
	if *symlinkModeFlag {
		installMode = "symlink"
	} else if existingCfg != nil && existingCfg.InstallMode != "" {
		installMode = existingCfg.InstallMode
	}

	kitRepoPath := *kitPathOpt
	if kitRepoPath == "" && existingCfg != nil && existingCfg.KitRepoPath != "" {
		kitRepoPath = existingCfg.KitRepoPath
	}
	if kitRepoPath == "" {
		pwd, _ := os.Getwd()
		kitRepoPath = pwd
	}

	discoveredSkills := config.DiscoverSkills(kitRepoPath)

	existingSkillsMap := make(map[string]bool)
	if existingCfg != nil && len(existingCfg.Skills.Include) > 0 {
		for _, s := range existingCfg.Skills.Include {
			existingSkillsMap[s] = true
		}
	}

	selectedTargets := []string{}
	if *targetsOpt != "" {
		selectedTargets = strings.Split(*targetsOpt, ",")
	} else if existingCfg != nil && len(existingCfg.Targets) > 0 {
		selectedTargets = existingCfg.Targets
	} else {
		for _, t := range config.DefaultTargetLayers {
			selectedTargets = append(selectedTargets, t.Name)
		}
	}

	selectedSkills := []string{}
	if *skillsOpt != "" {
		selectedSkills = strings.Split(*skillsOpt, ",")
	} else if existingCfg != nil && len(existingCfg.Skills.Include) > 0 {
		selectedSkills = existingCfg.Skills.Include
	} else {
		for _, s := range discoveredSkills {
			selectedSkills = append(selectedSkills, s.Name)
		}
	}

	isTTY := isatty.IsTerminal(os.Stdin.Fd()) || isatty.IsCygwinTerminal(os.Stdin.Fd())

	// Interactive Mode
	if !*nonInteractive && isTTY {
		if !*symlinkModeFlag {
			selectedMode, quitting, err := tui.RunModeSelect(
				[]string{"Copy Mode (Default)", "Dev Symlink Mode"},
				[]string{"Copy files directly into target project", "Create symlinks pointing to local kit repo"},
			)
			if err != nil {
				fmt.Println(tui.RedStyle.Render(fmt.Sprintf("%s TUI Error: %v", tui.IconError, err)))
				os.Exit(1)
			}
			if quitting {
				os.Exit(0)
			}
			if selectedMode == "Dev Symlink Mode" {
				installMode = "symlink"
			} else {
				installMode = "copy"
			}
		}

		if installMode == "symlink" && *kitPathOpt == "" {
			reader := bufio.NewReader(os.Stdin)
			fmt.Printf("Enter local Kit repository path [%s]: ", kitRepoPath)
			ans, _ := reader.ReadString('\n')
			ans = strings.TrimSpace(ans)
			if ans != "" {
				kitRepoPath = ans
				discoveredSkills = config.DiscoverSkills(kitRepoPath)
			}
		}

		if *targetsOpt == "" {
			existingTargetsMap := make(map[string]bool)
			if existingCfg != nil {
				targetsList := existingCfg.Targets
				if len(targetsList) == 0 && len(existingCfg.SymlinkTargets) > 0 {
					targetsList = existingCfg.SymlinkTargets
				}
				for _, t := range targetsList {
					existingTargetsMap[t] = true
				}
			}

			anyDetected := false
			items := make([]tui.CheckboxItem, len(config.DefaultTargetLayers))
			for i, t := range config.DefaultTargetLayers {
				isSelected := false
				if existingCfg != nil && len(existingTargetsMap) > 0 {
					isSelected = existingTargetsMap[t.Name]
				} else {
					if _, err := os.Lstat(t.Name); err == nil {
						isSelected = true
						anyDetected = true
					}
				}
				items[i] = tui.CheckboxItem{Name: t.Name, Description: t.Description, Selected: isSelected}
			}

			if existingCfg == nil && !anyDetected {
				for i, t := range config.DefaultTargetLayers {
					if t.Name == ".claude" {
						items[i].Selected = true
						break
					}
				}
			}
			title := "Select Target Layers to Copy"
			if installMode == "symlink" {
				title = "Select Target Layers to Symlink"
			}
			selected, quitting, err := tui.RunCheckbox(title, items)
			if err != nil {
				fmt.Println(tui.RedStyle.Render(fmt.Sprintf("%s TUI Error: %v", tui.IconError, err)))
				os.Exit(1)
			}
			if quitting {
				os.Exit(0)
			}
			selectedTargets = selected
		}
		if *skillsOpt == "" {
			categories := []string{"Core Harness (ag-*)", "Framework & Ecosystem", "Curated Extra (skills/.curated)"}
			grouped := make(map[string][]config.SkillInfo)
			for _, s := range discoveredSkills {
				cat := "Core Harness (ag-*)"
				if strings.HasPrefix(s.SourcePath, "skills/.curated") {
					cat = "Curated Extra (skills/.curated)"
				} else if strings.HasPrefix(s.SourcePath, "skills") {
					cat = "Framework & Ecosystem"
				}
				grouped[cat] = append(grouped[cat], s)
			}

			topicItems := []tui.CheckboxItem{}
			for _, cat := range categories {
				if len(grouped[cat]) > 0 {
					topicItems = append(topicItems, tui.CheckboxItem{
						Name:        cat,
						Description: fmt.Sprintf("%d skills", len(grouped[cat])),
						Selected:    true,
					})
				}
			}

			selectedTopics, quitting, err := tui.RunCheckbox("Select Skill Topics / Categories to Configure", topicItems)
			if err != nil {
				fmt.Println(tui.RedStyle.Render(fmt.Sprintf("%s TUI Error: %v", tui.IconError, err)))
				os.Exit(1)
			}
			if quitting {
				os.Exit(0)
			}

			topicSet := make(map[string]bool)
			for _, t := range selectedTopics {
				topicSet[t] = true
			}

			selectedSkills = []string{}
			for _, cat := range categories {
				if !topicSet[cat] {
					continue
				}
				skillsInCat := grouped[cat]
				if len(skillsInCat) == 0 {
					continue
				}

				items := make([]tui.CheckboxItem, len(skillsInCat))
				for i, s := range skillsInCat {
					isSelected := true
					if len(existingSkillsMap) > 0 {
						isSelected = existingSkillsMap[s.Name]
					}
					items[i] = tui.CheckboxItem{
						Name:        s.Name,
						Description: s.SourcePath,
						Selected:    isSelected,
					}
				}

				title := fmt.Sprintf("Select %s Skills to Copy", cat)
				if installMode == "symlink" {
					title = fmt.Sprintf("Select %s Skills to Symlink", cat)
				}

				sel, quitting, err := tui.RunCheckbox(title, items)
				if err != nil {
					fmt.Println(tui.RedStyle.Render(fmt.Sprintf("%s TUI Error: %v", tui.IconError, err)))
					os.Exit(1)
				}
				if quitting {
					os.Exit(0)
				}
				selectedSkills = append(selectedSkills, sel...)
			}
		}
	}

	absKitPath, _ := filepath.Abs(kitRepoPath)

	symlinkTargets := []string{}
	if installMode == "symlink" {
		symlinkTargets = selectedTargets
	}

	finalCfg := config.Config{
		Schema:         "./schemas/engineered-config.json",
		Version:        "2.4.2",
		UpdatedAt:      time.Now().Format(time.RFC3339),
		InstallMode:    installMode,
		SymlinkScope:   *symlinkScopeOpt,
		KitRepoPath:    absKitPath,
		Targets:        selectedTargets,
		SymlinkTargets: symlinkTargets,
		Skills: config.SkillsConfig{
			Mode:    "select",
			Include: selectedSkills,
			Exclude: []string{},
		},
		Options: config.OptionsConfig{
			PreserveUserContent:          true,
			RefuseOverwriteNonSymlinkDir: true,
		},
	}

	fmt.Println(tui.CyanStyle.Render("\n--- Configuration Summary ---"))
	fmt.Printf("Mode: %s\n", strings.ToUpper(finalCfg.InstallMode))
	if finalCfg.InstallMode == "symlink" {
		fmt.Printf("Kit Repository Path: %s\n", finalCfg.KitRepoPath)
	}
	fmt.Printf("Target Layers (%d): %s\n", len(finalCfg.Targets), strings.Join(finalCfg.Targets, ", "))
	fmt.Printf("Included Skills (%d): %s\n", len(finalCfg.Skills.Include), strings.Join(finalCfg.Skills.Include, ", "))
	fmt.Println(tui.CyanStyle.Render("-----------------------------"))

	if *dryRun {
		fmt.Println(tui.YellowStyle.Render("[DRY RUN] Configuration computed successfully. No disk writes performed."))
		return
	}

	// Execution
	if installMode == "symlink" {
		installer.ApplySymlinkMode(&finalCfg)
	} else {
		installer.ApplyCopyMode(&finalCfg)
	}

	if err := config.SaveConfig(&finalCfg); err != nil {
		fmt.Println(tui.RedStyle.Render(fmt.Sprintf("%s Error saving config: %v", tui.IconError, err)))
	} else {
		fmt.Println(tui.GreenStyle.Render(fmt.Sprintf("%s Saved configuration to %s", tui.IconCheck, config.ConfigPath)))
	}

	fmt.Println(tui.GreenStyle.Render(fmt.Sprintf("\n%s Harness Customization Complete!", tui.IconCheck)))
}
