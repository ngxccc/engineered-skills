package tui

import "github.com/charmbracelet/lipgloss"

var (
	// Modern Studio Color Palette (TrueColor / Hex)
	CyanStyle   = lipgloss.NewStyle().Foreground(lipgloss.Color("#00E5FF")).Bold(true)
	GreenStyle  = lipgloss.NewStyle().Foreground(lipgloss.Color("#10B981"))
	YellowStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("#F59E0B"))
	RedStyle    = lipgloss.NewStyle().Foreground(lipgloss.Color("#EF4444"))
	GrayStyle   = lipgloss.NewStyle().Foreground(lipgloss.Color("#64748B"))
	BoldStyle   = lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("#F8FAFC"))
	BadgeStyle  = lipgloss.NewStyle().Foreground(lipgloss.Color("#A855F7")).Bold(true)

	PointerStyle           = lipgloss.NewStyle().Foreground(lipgloss.Color("#00E5FF")).Bold(true).Width(2)
	UnselectedPointerStyle = lipgloss.NewStyle().Width(2)
)
// Clean Studio Terminal Indicators (Monochrome Unicode Symbols)
const (
	IconCheck  = "✓"
	IconUpdate = "↻"
	IconInfo   = "ℹ"
	IconWarn   = "▲"
	IconError  = "✖"
	IconLogo   = "✦"
)
