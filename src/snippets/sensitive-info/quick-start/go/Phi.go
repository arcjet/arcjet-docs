package main

import (
	"context"
	"errors"

	"github.com/arcjet/arcjet-go"
)

// NewGuardClient reads ARCJET_KEY from the environment.
var guard = must(arcjet.NewGuardClient(arcjet.GuardConfig{}))

var (
	errPHI       = errors.New("remove health identifiers from the note")
	errUnchecked = errors.New("couldn't check the note for PHI, try again")
)

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
	// Arcjet couldn't be reached. Return the error to fail closed.
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
