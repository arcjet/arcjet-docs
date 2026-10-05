package main

import (
	"context"
	"strings"

	"github.com/arcjet/arcjet-go/redact"
)

func detect(tokens []string) []string {
	out := make([]string, len(tokens))
	for i, tok := range tokens {
		if strings.HasPrefix(tok, "sk-") {
			out[i] = "api-key"
		}
	}
	return out
}

func example(ctx context.Context) error {
	r, err := redact.New(ctx, redact.Options{
		Detect:            detect,
		ContextWindowSize: 1,
	})
	if err != nil {
		return err
	}
	defer r.Close(ctx)
	_, _, err = r.Redact(ctx, "token sk-example")
	return err
}
