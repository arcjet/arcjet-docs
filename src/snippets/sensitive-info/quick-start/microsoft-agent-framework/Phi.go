package main

import (
	"context"
	"encoding/json"

	"github.com/arcjet/arcjet-go"
	"github.com/arcjet/arcjet-go/agentframework"
	"github.com/microsoft/agent-framework-go/tool"
	"github.com/microsoft/agent-framework-go/tool/functool"
)

type noteArgs struct {
	Note string `json:"note"`
}

func saveNote(_ context.Context, in noteArgs) (map[string]string, error) {
	return map[string]string{"note": in.Note}, nil
}

func guardedSaveNote(guard *arcjet.GuardClient) (tool.FuncTool, error) {
	fn := functool.MustNew(
		functool.Config{Name: "save_note", Description: "Save a free-text note"},
		saveNote,
	)
	return agentframework.GuardTool(guard, fn, agentframework.ToolPolicy{
		Action: "note.saved",
		// Arcjet's server-side detector reads the note for PHI.
		Inputs: func(_ context.Context, raw json.RawMessage) (map[string]arcjet.GuardPolicyInput, error) {
			var in noteArgs
			if err := json.Unmarshal(raw, &in); err != nil {
				return nil, err
			}
			return map[string]arcjet.GuardPolicyInput{
				"note": arcjet.GuardPolicyServerString(in.Note),
			}, nil
		},
	})
}
