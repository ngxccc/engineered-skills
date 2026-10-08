package main

import (
	"bufio"
	"errors"
	"flag"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	"engineered-skills/internal/config"
	"engineered-skills/internal/installer"
	"engineered-skills/internal/tui"
	"github.com/mattn/go-isatty"
)

var version = "1.0.0"

func parseSubcommand(args []string) (subcmd string, isGlobal bool, kitPath string, cmdArgs []string) {
	for i := 0; i < len(args); i++ {
		arg := args[i]
		if arg == "--global" || arg == "-g" {
			isGlobal = true
		} else if strings.HasPrefix(arg, "--kit-path=") {
			kitPath = strings.TrimPrefix(arg, "--kit-path=")
		} else if arg == "--kit-path" && i+1 < len(args) {
			kitPath = args[i+1]
			i++
		} else if arg == "enable" || arg == "disable" || arg == "list" || arg == "status" || arg == "help" {
			subcmd = arg
		} else if !strings.HasPrefix(arg, "-") {
			cmdArgs = append(cmdArgs, arg)
		} else if arg == "-h" || arg == "--help" {
			cmdArgs = append(cmdArgs, arg)
		}
	}
	return
}

func printUsage(w io.Writer) {
	fmt.Fprintln(w, tui.CyanStyle.Render(tui.IconLogo+" ENGINEERED SKILLS")+" "+tui.BadgeStyle.Render("v"+version)+"  "+tui.GrayStyle.Render("Interactive Harness Customizer\n"))
	fmt.Fprintln(w, "Usage:")
	fmt.Fprintln(w, "  engineered-cli [flags]")
	fmt.Fprintln(w, "  engineered-cli enable [--global|-g] <skill1> [skill2...]")
	fmt.Fprintln(w, "  engineered-cli disable [--global|-g] <skill1> [skill2...]")
	fmt.Fprintln(w, "  engineered-cli status | list")
	fmt.Fprintln(w, "\nSubcommands:")
	fmt.Fprintln(w, "  enable     Symlink skill(s) into project or global harness")
	fmt.Fprintln(w, "  disable    Remove skill(s) from project or global harness")
	fmt.Fprintln(w, "  status     Show active global and project skills")
	fmt.Fprintln(w, "\nPreset Profiles (--profile):")
	fmt.Fprintln(w, "  core       ask-skills, git-flow, diagnosing-bugs, tdd")
	fmt.Fprintln(w, "  frontend   core + dashboard-ui")
	fmt.Fprintln(w, "  writing    writing-for-agents, writing-flashcards, writing-atomic-notes, writing-polish")
	fmt.Fprintln(w, "  full       all available skills in repository")
	fmt.Fprintln(w, "\nExamples:")
	fmt.Fprintln(w, "  engineered-cli --global --profile core --yes   (One-time global setup)")
	fmt.Fprintln(w, "  engineered-cli enable dashboard-ui            (Enable skill in current repo)")
	fmt.Fprintln(w, "  engineered-cli disable dashboard-ui           (Disable skill in current repo)")
	fmt.Fprintln(w, "  engineered-cli status                         (Check current active skills)")
}

func handleSubcommand(subcmd string, isGlobal bool, kitPathOpt string, cmdArgs []string, stdout, stderr io.Writer) (bool, error) {
	kitRepoPath := config.ResolveKitRepoPath(kitPathOpt, isGlobal)
	switch subcmd {
	case "help":
		printUsage(stdout)
		return true, nil

	case "enable":
		for _, a := range cmdArgs {
			if a == "-h" || a == "--help" {
				fmt.Fprintf(stdout, "%s\n\n", tui.CyanStyle.Render("Usage: engineered-cli enable [--global|-g] <skill1> [skill2...]"))
				fmt.Fprintln(stdout, "Symlink one or more skills into your project or global user harness.")
				fmt.Fprintf(stdout, "Dependencies are automatically resolved (e.g. 'implement' auto-enables 'tdd', 'code-review', 'git-flow').\n\n")
				fmt.Fprintln(stdout, "Examples:")
				fmt.Fprintln(stdout, "  engineered-cli enable dashboard-ui")
				fmt.Fprintln(stdout, "  engineered-cli enable to-tickets wayfinder")
				fmt.Fprintln(stdout, "  engineered-cli enable --global diagnosing-bugs")
				return true, nil
			}
		}
		if len(cmdArgs) == 0 {
			return true, fmt.Errorf("usage: engineered-cli enable [--global|-g] <skill1> [skill2...]")
		}
		var skillList []string
		for _, a := range cmdArgs {
			parts := strings.Split(a, ",")
			for _, p := range parts {
				p = strings.TrimSpace(p)
				if p != "" {
					skillList = append(skillList, p)
				}
			}
		}
		enabled, err := installer.EnableSkills(kitRepoPath, skillList, isGlobal)
		if err != nil {
			return true, fmt.Errorf("error enabling skills: %w", err)
		}
		scopeDesc := "project (.claude/skills, .agents/skills, .omp/skills)"
		if isGlobal {
			scopeDesc = "global (~/.claude/skills, ~/.omp/agent/skills, ~/.agents/skills)"
		}
		fmt.Fprintln(stdout, tui.GreenStyle.Render(fmt.Sprintf("%s Successfully enabled %d skill(s) in %s:", tui.IconCheck, len(enabled), scopeDesc)))
		for _, s := range enabled {
			fmt.Fprintf(stdout, "  • %s\n", s)
		}
		return true, nil

	case "disable":
		for _, a := range cmdArgs {
			if a == "-h" || a == "--help" {
				fmt.Fprintf(stdout, "%s\n\n", tui.CyanStyle.Render("Usage: engineered-cli disable [--global|-g] <skill1> [skill2...]"))
				fmt.Fprintf(stdout, "Unlink one or more skills from your project or global user harness.\n\n")
				fmt.Fprintln(stdout, "Examples:")
				fmt.Fprintln(stdout, "  engineered-cli disable dashboard-ui")
				fmt.Fprintln(stdout, "  engineered-cli disable --global dashboard-ui")
				return true, nil
			}
		}
		if len(cmdArgs) == 0 {
			return true, fmt.Errorf("usage: engineered-cli disable [--global|-g] <skill1> [skill2...]")
		}
		var skillList []string
		for _, a := range cmdArgs {
			parts := strings.Split(a, ",")
			for _, p := range parts {
				p = strings.TrimSpace(p)
				if p != "" {
					skillList = append(skillList, p)
				}
			}
		}
		disabled, err := installer.DisableSkills(skillList, isGlobal)
		if err != nil {
			return true, fmt.Errorf("error disabling skills: %w", err)
		}
		scopeDesc := "project"
		if isGlobal {
			scopeDesc = "global"
		}
		fmt.Fprintln(stdout, tui.YellowStyle.Render(fmt.Sprintf("%s Disabled %d skill(s) in %s scope:", tui.IconWarn, len(disabled), scopeDesc)))
		for _, s := range disabled {
			fmt.Fprintf(stdout, "  • %s\n", s)
		}
		return true, nil

	case "list", "status":
		printStatus(kitRepoPath, isGlobal, stdout)
		return true, nil
	}
	return false, nil
}

func printStatus(kitRepoPath string, isGlobal bool, w io.Writer) {
	fmt.Fprintln(w, tui.CyanStyle.Render(tui.IconLogo+" ENGINEERED SKILLS STATUS\n"))
	fmt.Fprintf(w, "Kit Repository: %s\n\n", kitRepoPath)

	globalCfg := config.LoadConfigWithScope(true)
	fmt.Fprintln(w, tui.CyanStyle.Render("Global Skills (~/.claude, ~/.omp, ~/.agents):"))
	if globalCfg != nil && len(globalCfg.Skills.Include) > 0 {
		for _, s := range globalCfg.Skills.Include {
			fmt.Fprintf(w, "  • %s\n", s)
		}
	} else {
		fmt.Fprintln(w, "  (no active global skills configured)")
	}

	projectCfg := config.LoadConfigWithScope(false)
	fmt.Fprintln(w, tui.CyanStyle.Render("\nProject Skills (.claude, .agents, .omp):"))
	if projectCfg != nil && len(projectCfg.Skills.Include) > 0 {
		for _, s := range projectCfg.Skills.Include {
			fmt.Fprintf(w, "  • %s\n", s)
		}
	} else {
		fmt.Fprintln(w, "  (no active project skills configured in this directory)")
	}

	fmt.Fprintln(w, tui.CyanStyle.Render("\nPreset Profiles:"))
	fmt.Fprintln(w, "  • core:     ask-skills, git-flow, diagnosing-bugs, tdd")
	fmt.Fprintln(w, "  • frontend: ask-skills, git-flow, diagnosing-bugs, tdd, dashboard-ui")
	fmt.Fprintln(w, "  • writing:  writing-for-agents, writing-flashcards, writing-atomic-notes, writing-polish")
	fmt.Fprintln(w, "  • full:     all available skills in repository")
}

func main() {
	if err := run(os.Args[1:], os.Stdout, os.Stderr); err != nil {
		fmt.Fprintln(os.Stderr, tui.RedStyle.Render(fmt.Sprintf("%s %v", tui.IconError, err)))
		os.Exit(1)
	}
}

func run(args []string, stdout, stderr io.Writer) error {
	if len(args) > 0 {
		subcmd, isGlobal, kitPath, cmdArgs := parseSubcommand(args)
		if subcmd != "" {
			handled, err := handleSubcommand(subcmd, isGlobal, kitPath, cmdArgs, stdout, stderr)
			if handled {
				return err
			}
		}
	}

	fs := flag.NewFlagSet("engineered-cli", flag.ContinueOnError)
	fs.SetOutput(stderr)
	fs.Usage = func() {
		printUsage(stdout)
		fmt.Fprintln(stdout, "\nFlags:")
		fs.SetOutput(stdout)
		fs.PrintDefaults()
	}

	showVersion := fs.Bool("version", false, "Show CLI version")
	fs.BoolVar(showVersion, "v", false, "Show CLI version")
	dryRun := fs.Bool("dry-run", false, "Run without writing to disk")
	nonInteractive := fs.Bool("yes", false, "Accept defaults without prompting")
	fs.BoolVar(nonInteractive, "y", false, "Accept defaults without prompting")
	symlinkModeFlag := fs.Bool("link", false, "Use Dev Symlink Mode")
	fs.BoolVar(symlinkModeFlag, "symlink", false, "Use Dev Symlink Mode")
	globalFlag := fs.Bool("global", false, "Install to global user harness directories (~/.claude, ~/.omp, ~/.agents)")
	fs.BoolVar(globalFlag, "g", false, "Install to global user harness directories")
	profileOpt := fs.String("profile", "", "Preset skill bundle: core, frontend, writing, full")
	fs.StringVar(profileOpt, "p", "", "Preset skill bundle: core, frontend, writing, full")
	kitPathOpt := fs.String("kit-path", "", "Local kit repository path")
	targetsOpt := fs.String("targets", "", "Comma-separated target layers")
	skillsOpt := fs.String("skills", "", "Comma-separated skills")
	symlinkScopeOpt := fs.String("symlink-scope", "bulk", "Symlink scope")

	if err := fs.Parse(args); err != nil {
		if errors.Is(err, flag.ErrHelp) {
			return nil
		}
		return err
	}

	if *showVersion {
		fmt.Fprintf(stdout, "engineered-cli v%s\n", strings.TrimPrefix(version, "v"))
		return nil
	}
	fmt.Fprintln(stdout, tui.CyanStyle.Render(tui.IconLogo+" ENGINEERED SKILLS")+" "+tui.BadgeStyle.Render("v"+version)+"  "+tui.GrayStyle.Render("Interactive Harness Customizer\n"))

	existingCfg := config.LoadConfigWithScope(*globalFlag)

	installMode := "copy"
	if *symlinkModeFlag || *globalFlag {
		installMode = "symlink"
	} else if existingCfg != nil && existingCfg.InstallMode != "" {
		installMode = existingCfg.InstallMode
	}

	kitRepoPath := config.ResolveKitRepoPath(*kitPathOpt, *globalFlag)

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
	if *profileOpt != "" {
		pSkills, ok := config.GetProfileSkills(*profileOpt, discoveredSkills)
		if !ok {
			return fmt.Errorf("unknown profile '%s'. Available profiles: core, frontend, writing, full", *profileOpt)
		}
		selectedSkills = pSkills
	}

	if *skillsOpt != "" {
		explicitSkills := strings.Split(*skillsOpt, ",")
		if *profileOpt != "" {
			selectedSkills = append(selectedSkills, explicitSkills...)
		} else {
			selectedSkills = explicitSkills
		}
	} else if *profileOpt == "" {
		if existingCfg != nil && len(existingCfg.Skills.Include) > 0 {
			selectedSkills = existingCfg.Skills.Include
		} else {
			for _, s := range discoveredSkills {
				selectedSkills = append(selectedSkills, s.Name)
			}
		}
	}
	isTTY := isatty.IsTerminal(os.Stdin.Fd()) || isatty.IsCygwinTerminal(os.Stdin.Fd())

	// Interactive Mode
	if !*nonInteractive && isTTY && *skillsOpt == "" && *profileOpt == "" {
		if !*symlinkModeFlag {
			selectedMode, quitting, err := tui.RunModeSelect(
				[]string{"Copy Mode (Default)", "Dev Symlink Mode"},
				[]string{"Copy files directly into target project", "Create symlinks pointing to local kit repo"},
			)
			if err != nil {
				return fmt.Errorf("TUI error: %w", err)
			}
			if quitting {
				return nil
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
				return fmt.Errorf("TUI error: %w", err)
			}
			if quitting {
				return nil
			}
			selectedTargets = selected
		}
		if *skillsOpt == "" {
			categories := []string{"Engineering", "Productivity", "In Progress", "Misc", "Core Harness"}
			grouped := make(map[string][]config.SkillInfo)
			for _, s := range discoveredSkills {
				cat := s.Category
				if cat == "" {
					cat = "Engineering"
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
				return fmt.Errorf("TUI error: %w", err)
			}
			if quitting {
				return nil
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
					return fmt.Errorf("TUI error: %w", err)
				}
				if quitting {
					return nil
				}
				selectedSkills = append(selectedSkills, sel...)
			}
		}
	}
	selectedSkills = config.ResolveDependencies(selectedSkills)

	absKitPath, _ := filepath.Abs(kitRepoPath)

	symlinkTargets := []string{}
	if installMode == "symlink" {
		symlinkTargets = selectedTargets
	}

	finalCfg := config.Config{
		Version:        "1.0.0",
		UpdatedAt:      time.Now().Format(time.RFC3339),
		InstallMode:    installMode,
		SymlinkScope:   *symlinkScopeOpt,
		KitRepoPath:    absKitPath,
		IsGlobal:       *globalFlag,
		Profile:        *profileOpt,
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

	fmt.Fprintln(stdout, tui.CyanStyle.Render("\n--- Configuration Summary ---"))
	scopeStr := "Project"
	if finalCfg.IsGlobal {
		scopeStr = "Global (~/.claude, ~/.omp, ~/.agents)"
	}
	fmt.Fprintf(stdout, "Scope: %s\n", scopeStr)
	fmt.Fprintf(stdout, "Mode: %s\n", strings.ToUpper(finalCfg.InstallMode))
	if finalCfg.Profile != "" {
		fmt.Fprintf(stdout, "Profile: %s\n", finalCfg.Profile)
	}
	if finalCfg.InstallMode == "symlink" {
		fmt.Fprintf(stdout, "Kit Repository Path: %s\n", finalCfg.KitRepoPath)
	}
	fmt.Fprintf(stdout, "Target Layers (%d): %s\n", len(finalCfg.Targets), strings.Join(finalCfg.Targets, ", "))
	fmt.Fprintf(stdout, "Included Skills (%d): %s\n", len(finalCfg.Skills.Include), strings.Join(finalCfg.Skills.Include, ", "))
	fmt.Fprintln(stdout, tui.CyanStyle.Render("-----------------------------"))

	if *dryRun {
		fmt.Fprintln(stdout, tui.YellowStyle.Render("[DRY RUN] Configuration computed successfully. No disk writes performed."))
		return nil
	}

	// Execution
	if installMode == "symlink" {
		installer.ApplySymlinkMode(&finalCfg)
	} else {
		installer.ApplyCopyMode(&finalCfg)
	}

	if err := config.SaveConfig(&finalCfg); err != nil {
		return fmt.Errorf("error saving config: %w", err)
	}
	fmt.Fprintln(stdout, tui.GreenStyle.Render(fmt.Sprintf("%s Saved configuration to %s", tui.IconCheck, config.GetConfigPath(*globalFlag))))
	fmt.Fprintln(stdout, tui.GreenStyle.Render(fmt.Sprintf("\n%s Harness Customization Complete!", tui.IconCheck)))
	return nil
}
