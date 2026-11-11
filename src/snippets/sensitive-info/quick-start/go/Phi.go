package main

import (
	"context"
	"errors"

	"github.com/arcjet/arcjet-go"
)

// NewGuardClient reads ARCJET_KEY from the environment.
var guard = must(arcjet.NewGuardClient(arcjet.GuardConfig{}))

var errPHI = errors.New("remove health identifiers from the note")

// screenNote runs before you store the note or pass it to a model.
func screenNote(ctx context.Context, userID, note string) error {
	decision, err := guard.Guard(ctx, arcjet.GuardRequest{
		Label: "note.saved",
		Actor: &userID,
		// Arcjet's server-side detector reads the note for PHI.
		Inputs: map[string]arcjet.GuardPolicyInput{
			"note": arcjet.GuardPolicyServerString(note),
		},
	})
	// Fail closed when Arcjet can't be reached.
	if err != nil {
		return err
	}
	// A direct call fails open, so reject failed-open decisions as well.
	if decision.IsDenied() || decision.HasFailedOpen() {
		return errPHI
	}
	return nil
}
