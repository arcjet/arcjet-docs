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

var (
	errPHI       = errors.New("remove health identifiers from the note")
	errUnchecked = errors.New("couldn't check the note for PHI, try again")
)

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
	if decision.IsDenied() {
		// The note carries PHI. Ask the user to remove it.
		return errPHI
	}
	if decision.HasFailedOpen() {
		// Arcjet couldn't complete the check, so the call failed open. Reject
		// the note to fail closed, or log the error and continue to fail open.
		return errUnchecked
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
		// Fails closed: if Arcjet can't complete the check, the tool doesn't
		// run. Set arcjet.OnGuardErrorAllow to run the tool anyway.
		OnGuardError: arcjet.OnGuardErrorDeny,
		// On a denial, tell the model how to recover.
		OnDeny: func(arcjet.GuardDecision) any {
			return map[string]string{
				"error": "The note contains health identifiers. Remove them and retry.",
			}
		},
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
