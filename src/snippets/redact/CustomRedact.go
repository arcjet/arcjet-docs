package main

import (
	"context"

	"github.com/arcjet/arcjet-go/redact"
)

func example(ctx context.Context) error {
	r, err := redact.New(ctx, redact.Options{
		Replace: func(entity, plaintext string) (string, bool) {
			if entity == redact.EntityEmail {
				return "redacted-email", true
			}
			return "", false
		},
	})
	if err != nil {
		return err
	}
	defer r.Close(ctx)
	_, _, err = r.Redact(ctx, "Contact me at test@example.com")
	return err
}
