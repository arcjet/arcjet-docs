package main

import (
	"context"
	"log"
	"os"
	"strings"

	"github.com/arcjet/arcjet-go"
)

var aj = must(arcjet.NewClient(arcjet.Config{
	Key: os.Getenv("ARCJET_KEY"),
	SensitiveInfoDetect: func(_ context.Context, tokens []string) []arcjet.EntityType {
		out := make([]arcjet.EntityType, len(tokens))
		for i, tok := range tokens {
			if strings.HasPrefix(tok, "sk-") {
				out[i] = "API_KEY"
			}
		}
		return out
	},
	Rules: []arcjet.Rule{
		arcjet.SensitiveInfo(arcjet.SensitiveInfoOptions{
			Mode: arcjet.ModeLive,
			Deny: []arcjet.EntityType{"API_KEY"},
		}),
	},
}))

func must[T any](v T, err error) T {
	if err != nil {
		log.Fatal(err)
	}
	return v
}
