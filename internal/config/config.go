package config

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

const ConfigPath = ".engineered-config.json"

// SkillDependencies maps parent skills to their required child skills.
var SkillDependencies = map[string][]string{
	"implement":                     {"tdd", "code-review", "git-flow"},
	"grill-with-docs":               {"grilling", "domain-modeling", "docs"},
	"improve-codebase-architecture": {"codebase-design", "grilling"},
	"wayfinder":                     {"grilling", "to-spec", "to-tickets"},
	"grill-me":                      {"grilling"},
}

// Profiles defines preset skill bundles.
var Profiles = map[string][]string{
	"core": {
		"ask-skills",
		"git-flow",
		"diagnosing-bugs",
		"tdd",
	},
	"frontend": {
		"ask-skills",
		"git-flow",
		"diagnosing-bugs",
		"tdd",
		"dashboard-ui",
	},
	"writing": {
		"writing-for-agents",
		"writing-flashcards",
		"writing-atomic-notes",
		"writing-polish",
	},
}

// GetProfileSkills retrieves skills for a given profile name.
func GetProfileSkills(profileName string, allSkills []SkillInfo) ([]string, bool) {
	name := strings.ToLower(strings.TrimSpace(profileName))
	if name == "full" {
		var list []string
		for _, s := range allSkills {
			list = append(list, s.Name)
		}
		return list, true
	}
	skills, ok := Profiles[name]
	return skills, ok
}

// ResolveDependencies recursively resolves all required skill dependencies.
func ResolveDependencies(selected []string) []string {
	resolved := make(map[string]bool)
	var result []string

	var add func(name string)
	add = func(name string) {
		if resolved[name] {
			return
		}
		resolved[name] = true
		result = append(result, name)
		for _, dep := range SkillDependencies[name] {
			add(dep)
		}
	}

	for _, s := range selected {
		add(s)
	}

	return result
}

type TargetLayer struct {
	Name        string
	Description string
	Selected    bool
}

var DefaultTargetLayers = []TargetLayer{
	{Name: ".claude", Description: "Claude Code harness layer", Selected: true},
	{Name: ".agents", Description: "Agent skills compatibility layer", Selected: true},
	{Name: ".omp", Description: "Oh My Pi harness layer & plugins", Selected: true},
}

// ValidGlobalTargets lists the supported target harnesses for global mode.
var ValidGlobalTargets = []string{"claude", "omp", "agents", "all"}

// GlobalTargetLayers provides info for each target harness.
var GlobalTargetLayers = []TargetLayer{
	{Name: "claude", Description: "Claude Code (~/.claude/skills)", Selected: false},
	{Name: "omp", Description: "Oh My Pi (~/.omp/agent/skills)", Selected: false},
	{Name: "agents", Description: "Agent / Codex compatibility layer (~/.agents/skills)", Selected: false},
}

// NormalizeGlobalTargets validates and returns normalized global targets.
func NormalizeGlobalTargets(targets []string) ([]string, error) {
	if len(targets) == 0 {
		return nil, fmt.Errorf("no target specified. Available targets: claude, omp, agents, all")
	}
	var normalized []string
	seen := make(map[string]bool)
	for _, t := range targets {
		raw := strings.ToLower(strings.TrimSpace(t))
		raw = strings.TrimPrefix(raw, ".")
		if raw == "all" {
			return []string{"claude", "omp", "agents"}, nil
		}
		if raw == "claude" || raw == "omp" || raw == "agents" {
			if !seen[raw] {
				seen[raw] = true
				normalized = append(normalized, raw)
			}
		} else {
			return nil, fmt.Errorf("invalid target '%s'. Available targets: claude, omp, agents, all", t)
		}
	}
	if len(normalized) == 0 {
		return nil, fmt.Errorf("no valid targets specified. Available targets: claude, omp, agents, all")
	}
	return normalized, nil
}

// GlobalTargetDirs returns absolute skill directories for specified normalized targets.
func GlobalTargetDirs(home string, targets []string) []string {
	var dirs []string
	for _, t := range targets {
		switch t {
		case "claude":
			dirs = append(dirs, filepath.Join(home, ".claude", "skills"))
		case "omp":
			dirs = append(dirs, filepath.Join(home, ".omp", "agent", "skills"))
		case "agents":
			dirs = append(dirs, filepath.Join(home, ".agents", "skills"))
		}
	}
	return dirs
}

// TargetSkillsDir returns the skill directory path for a given target name and scope.
func TargetSkillsDir(target string, isGlobal bool) (string, error) {
	norm, err := NormalizeGlobalTargets([]string{target})
	if err != nil || len(norm) == 0 {
		return "", fmt.Errorf("invalid target: %s", target)
	}
	t := norm[0]
	if isGlobal {
		home, err := os.UserHomeDir()
		if err != nil {
			return "", err
		}
		switch t {
		case "claude":
			return filepath.Join(home, ".claude", "skills"), nil
		case "omp":
			return filepath.Join(home, ".omp", "agent", "skills"), nil
		case "agents":
			return filepath.Join(home, ".agents", "skills"), nil
		}
	}
	switch t {
	case "claude":
		return filepath.Join(".claude", "skills"), nil
	case "omp":
		return filepath.Join(".omp", "skills"), nil
	case "agents":
		return filepath.Join(".agents", "skills"), nil
	}
	return "", fmt.Errorf("unsupported target: %s", target)
}

// ResolveTargetDirs returns the skill directories and normalized names for specified targets and scope.
func ResolveTargetDirs(targets []string, isGlobal bool) ([]string, []string, error) {
	normalized, err := NormalizeGlobalTargets(targets)
	if err != nil {
		return nil, nil, err
	}
	var dirs []string
	if isGlobal {
		home, err := os.UserHomeDir()
		if err != nil {
			return nil, nil, fmt.Errorf("failed to get user home dir: %w", err)
		}
		dirs = GlobalTargetDirs(home, normalized)
	} else {
		for _, t := range normalized {
			dir, _ := TargetSkillsDir(t, false)
			dirs = append(dirs, dir)
		}
	}
	return dirs, normalized, nil
}

// DetectProjectTargets checks current directory for existing harness folders.
// If any exist (.claude, .omp, .agents), it returns them. If none exist, returns [".claude"].
func DetectProjectTargets() []string {
	var detected []string
	for _, t := range []string{".claude", ".omp", ".agents"} {
		if fi, err := os.Stat(t); err == nil && fi.IsDir() {
			detected = append(detected, t)
		}
	}
	if len(detected) == 0 {
		return []string{".claude"}
	}
	return detected
}

func TargetExists(name string) bool {
	_, err := os.Lstat(name)
	return err == nil
}

type SkillInfo struct {
	Name        string
	Category    string
	SourcePath  string
	Description string
}

type SkillsConfig struct {
	Mode    string   `json:"mode"`
	Include []string `json:"include"`
	Exclude []string `json:"exclude"`
	Topics  []string `json:"topics,omitempty"`
}

type OptionsConfig struct {
	PreserveUserContent          bool `json:"preserveUserContent"`
	RefuseOverwriteNonSymlinkDir bool `json:"refuseOverwriteNonSymlinkDir"`
}

type Config struct {
	Schema         string        `json:"$schema,omitempty"`
	Version        string        `json:"version"`
	UpdatedAt      string        `json:"updatedAt"`
	InstallMode    string        `json:"installMode"`
	SymlinkScope   string        `json:"symlinkScope"`
	KitRepoPath    string        `json:"kitRepoPath"`
	IsGlobal       bool          `json:"isGlobal,omitempty"`
	Profile        string        `json:"profile,omitempty"`
	Targets        []string      `json:"targets"`
	SymlinkTargets []string      `json:"symlinkTargets"`
	Skills         SkillsConfig  `json:"skills"`
	Options        OptionsConfig `json:"options"`
}

func GetConfigPath(isGlobal bool) string {
	if isGlobal {
		home, err := os.UserHomeDir()
		if err == nil {
			return filepath.Join(home, ".config", "engineered", "config.json")
		}
	}
	return ConfigPath
}

func LoadConfigWithScope(isGlobal bool) *Config {
	path := GetConfigPath(isGlobal)
	data, err := os.ReadFile(path)
	if err != nil {
		return nil
	}
	var cfg Config
	if err := json.Unmarshal(data, &cfg); err != nil {
		return nil
	}
	return &cfg
}

func LoadConfig() *Config {
	return LoadConfigWithScope(false)
}

func SaveConfigWithScope(cfg *Config, isGlobal bool) error {
	path := GetConfigPath(isGlobal)
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return err
	}
	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}
	data = append(data, '\n')
	return os.WriteFile(path, data, 0o644)
}

func SaveConfig(cfg *Config) error {
	return SaveConfigWithScope(cfg, cfg.IsGlobal)
}

func ResolveKitRepoPath(flagPath string, isGlobal bool) string {
	if flagPath != "" {
		return flagPath
	}
	if env := os.Getenv("ENGINEERED_KIT_PATH"); env != "" {
		return env
	}
	if isGlobal {
		if cfg := LoadConfigWithScope(true); cfg != nil && cfg.KitRepoPath != "" {
			if _, err := os.Stat(filepath.Join(cfg.KitRepoPath, "skills", "engineering")); err == nil {
				return cfg.KitRepoPath
			}
		}
	}
	if cfg := LoadConfig(); cfg != nil && cfg.KitRepoPath != "" {
		if _, err := os.Stat(filepath.Join(cfg.KitRepoPath, "skills", "engineering")); err == nil {
			return cfg.KitRepoPath
		}
	}
	if pwd, err := os.Getwd(); err == nil {
		if _, err := os.Stat(filepath.Join(pwd, "skills", "engineering")); err == nil {
			return pwd
		}
	}
	if exe, err := os.Executable(); err == nil {
		parentDir := filepath.Dir(filepath.Dir(exe))
		if _, err := os.Stat(filepath.Join(parentDir, "skills", "engineering")); err == nil {
			return parentDir
		}
	}
	if home, err := os.UserHomeDir(); err == nil {
		defaultPath := filepath.Join(home, "workspace", "40-tools", "engineered-skills")
		if _, err := os.Stat(filepath.Join(defaultPath, "skills", "engineering")); err == nil {
			return defaultPath
		}
	}
	pwd, _ := os.Getwd()
	return pwd
}

type SkillTargetPaths struct {
	ClaudeSkillsDir string
	OmpSkillsDir    string
	AgentsSkillsDir string
}

func GetSkillTargetPaths(isGlobal bool) SkillTargetPaths {
	if isGlobal {
		home, _ := os.UserHomeDir()
		return SkillTargetPaths{
			ClaudeSkillsDir: filepath.Join(home, ".claude", "skills"),
			OmpSkillsDir:    filepath.Join(home, ".omp", "agent", "skills"),
			AgentsSkillsDir: filepath.Join(home, ".agents", "skills"),
		}
	}
	return SkillTargetPaths{
		ClaudeSkillsDir: filepath.Join(".claude", "skills"),
		OmpSkillsDir:    filepath.Join(".omp", "skills"),
		AgentsSkillsDir: filepath.Join(".agents", "skills"),
	}
}

func DiscoverSkills(kitRepoPath string) []SkillInfo {
	var skills []SkillInfo
	seen := make(map[string]bool)

	buckets := []struct {
		dir      string
		category string
	}{
		{dir: filepath.Join(kitRepoPath, "skills", "engineering"), category: "Engineering"},
		{dir: filepath.Join(kitRepoPath, "skills", "productivity"), category: "Productivity"},
		{dir: filepath.Join(kitRepoPath, "skills", "in-progress"), category: "In Progress"},
		{dir: filepath.Join(kitRepoPath, "skills", "misc"), category: "Misc"},
		{dir: filepath.Join(kitRepoPath, ".claude", "skills"), category: "Core Harness"},
	}

	for _, bucket := range buckets {
		if entries, err := os.ReadDir(bucket.dir); err == nil {
			for _, e := range entries {
				if e.IsDir() && !strings.HasPrefix(e.Name(), ".") && !seen[e.Name()] {
					relPath, _ := filepath.Rel(kitRepoPath, filepath.Join(bucket.dir, e.Name()))
					skills = append(skills, SkillInfo{
						Name:       e.Name(),
						Category:   bucket.category,
						SourcePath: relPath,
					})
					seen[e.Name()] = true
				}
			}
		}
	}

	return skills
}

func SkillSourcePath(kitRepoPath, skillName string) string {
	candidatePaths := []string{
		filepath.Join("skills", "engineering", skillName),
		filepath.Join("skills", "productivity", skillName),
		filepath.Join("skills", "in-progress", skillName),
		filepath.Join("skills", "misc", skillName),
		filepath.Join(".claude", "skills", skillName),
	}
	for _, p := range candidatePaths {
		full := filepath.Join(kitRepoPath, p)
		if fi, err := os.Stat(full); err == nil && fi.IsDir() {
			return p
		}
	}
	return filepath.Join("skills", "engineering", skillName)
}
