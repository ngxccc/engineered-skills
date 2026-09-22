package config

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
)

const ConfigPath = ".claude/engineered-config.json"
// SkillDependencies maps parent skills to their required child skills.
var SkillDependencies = map[string][]string{
	"implement":                     {"tdd", "code-review", "git-flow"},
	"grill-with-docs":               {"grilling", "domain-modeling", "docs"},
	"improve-codebase-architecture": {"codebase-design", "grilling"},
	"wayfinder":                     {"grilling", "to-spec", "to-tickets"},
	"grill-me":                      {"grilling"},
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
	{Name: ".claude", Description: "Claude Code harness layer (SSOT)", Selected: true},
	{Name: ".agents", Description: "Agent skills compatibility layer", Selected: true},
	{Name: ".omp", Description: "Oh My Pi harness layer & plugins", Selected: true},
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
	Targets        []string      `json:"targets"`
	SymlinkTargets []string      `json:"symlinkTargets"`
	Skills         SkillsConfig  `json:"skills"`
	Options        OptionsConfig `json:"options"`
}

func LoadConfig() *Config {
	data, err := os.ReadFile(ConfigPath)
	if err != nil {
		return nil
	}
	var cfg Config
	if err := json.Unmarshal(data, &cfg); err != nil {
		return nil
	}
	return &cfg
}
func SaveConfig(cfg *Config) error {
	dir := filepath.Dir(ConfigPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}
	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}
	data = append(data, '\n')
	return os.WriteFile(ConfigPath, data, 0644)
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
