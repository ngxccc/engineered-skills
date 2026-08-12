package tui

import (
	"fmt"

	tea "github.com/charmbracelet/bubbletea"
)

type CheckboxItem struct {
	Name        string
	Description string
	Selected    bool
}

type CheckboxModel struct {
	Title     string
	Items     []CheckboxItem
	Cursor    int
	Confirmed bool
	Quitting  bool
}

func (m CheckboxModel) Init() tea.Cmd { return nil }

func (m CheckboxModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
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
				m.Cursor = len(m.Items) - 1
			}
		case "down", "j":
			if m.Cursor < len(m.Items)-1 {
				m.Cursor++
			} else {
				m.Cursor = 0
			}
		case " ":
			m.Items[m.Cursor].Selected = !m.Items[m.Cursor].Selected
		case "a", "A":
			allSelected := true
			for _, item := range m.Items {
				if !item.Selected {
					allSelected = false
					break
				}
			}
			for i := range m.Items {
				m.Items[i].Selected = !allSelected
			}
		case "enter":
			m.Confirmed = true
			return m, tea.Quit
		}
	}
	return m, nil
}

func (m CheckboxModel) View() string {
	if m.Confirmed {
		selectedCount := 0
		for _, item := range m.Items {
			if item.Selected {
				selectedCount++
			}
		}
		summary := fmt.Sprintf("%d selected", selectedCount)
		return GreenStyle.Render("✓ "+m.Title+":") + " " + BoldStyle.Render(summary) + "\n"
	}
	if m.Quitting {
		return ""
	}
	s := CyanStyle.Render("? "+m.Title) + " " + GrayStyle.Render("(Use ↑/↓ or j/k, SPACE toggle, 'a' select all, ENTER confirm)") + "\n"
	for i, item := range m.Items {
		pointer := UnselectedPointerStyle.Render(" ")
		if m.Cursor == i {
			pointer = PointerStyle.Render("❯")
		}
		checked := GrayStyle.Render("[ ]")
		if item.Selected {
			checked = GreenStyle.Render("[x]")
		}
		name := item.Name
		if m.Cursor == i {
			name = BoldStyle.Render(name)
		}
		desc := ""
		if item.Description != "" {
			desc = " " + GrayStyle.Render("- "+item.Description)
		}
		s += fmt.Sprintf("%s%s %s%s\n", pointer, checked, name, desc)
	}
	return s
}

func RunCheckbox(title string, items []CheckboxItem) ([]string, bool, error) {
	p := tea.NewProgram(CheckboxModel{Title: title, Items: items})
	m, err := p.Run()
	if err != nil {
		return nil, false, err
	}
	if cbModel, ok := m.(CheckboxModel); ok {
		if cbModel.Quitting {
			return nil, true, nil
		}
		selected := []string{}
		for _, item := range cbModel.Items {
			if item.Selected {
				selected = append(selected, item.Name)
			}
		}
		return selected, false, nil
	}
	return nil, false, nil
}
