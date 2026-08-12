package tui

import (
	"fmt"

	tea "github.com/charmbracelet/bubbletea"
)

type ModeSelectModel struct {
	Choices  []string
	Hints    []string
	Cursor   int
	Selected string
	Quitting bool
}

func (m ModeSelectModel) Init() tea.Cmd { return nil }

func (m ModeSelectModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "ctrl+c":
			m.Quitting = true
			return m, tea.Quit
		case "up", "k":
			if m.Cursor > 0 {
				m.Cursor--
			} else {
				m.Cursor = len(m.Choices) - 1
			}
		case "down", "j":
			if m.Cursor < len(m.Choices)-1 {
				m.Cursor++
			} else {
				m.Cursor = 0
			}
		case "enter":
			m.Selected = m.Choices[m.Cursor]
			return m, tea.Quit
		}
	}
	return m, nil
}

func (m ModeSelectModel) View() string {
	if m.Selected != "" {
		return GreenStyle.Render("✓ Select Install Mode:") + " " + BoldStyle.Render(m.Selected) + "\n"
	}
	if m.Quitting {
		return ""
	}
	s := CyanStyle.Render("? Select Install Mode:") + " " + GrayStyle.Render("(Use ↑/↓ or j/k, Press ENTER)") + "\n"
	for i, choice := range m.Choices {
		pointer := UnselectedPointerStyle.Render(" ")
		choiceText := choice
		if m.Cursor == i {
			pointer = PointerStyle.Render("❯")
			choiceText = CyanStyle.Render(BoldStyle.Render(choice))
		}
		s += fmt.Sprintf("%s%s %s\n", pointer, choiceText, GrayStyle.Render("("+m.Hints[i]+")"))
	}
	return s
}

func RunModeSelect(choices []string, hints []string) (string, bool, error) {
	p := tea.NewProgram(ModeSelectModel{
		Choices: choices,
		Hints:   hints,
	})
	m, err := p.Run()
	if err != nil {
		return "", false, err
	}
	if selModel, ok := m.(ModeSelectModel); ok {
		return selModel.Selected, selModel.Quitting, nil
	}
	return "", false, nil
}
