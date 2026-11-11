package main

import (
	"context"
	"encoding/json"
	"errors"

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

var errPHI = errors.New("remove health identifiers from the note")

// screenNote runs before the agent. It rejects a note that carries PHI, so the
// model never receives it.
func screenNote(ctx context.Context, guard *arcjet.GuardClient, userID, note string) error {
	decision, err := guard.Guard(ctx, arcjet.GuardRequest{
		Label: "note.saved",
		Actor: &userID,
		Inputs: map[string]arcjet.GuardPolicyInput{
			"note": arcjet.GuardPolicyServerString(note),
		},
	})
	if err != nil {
		return err
	}
	// A direct call fails open, so reject failed-open decisions as well.
	if decision.IsDenied() || decision.HasFailedOpen() {
		return errPHI
	}
	return nil
}

// guardedSaveNote stops the tool if its note carries PHI. The model has
// already read this text.
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
