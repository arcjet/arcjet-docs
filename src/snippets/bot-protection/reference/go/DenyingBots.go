package main

import (
	"log"
	"os"

	"github.com/arcjet/arcjet-go"
)

var aj = must(arcjet.NewClient(arcjet.Config{
	Key: os.Getenv("ARCJET_KEY"),
	Rules: []arcjet.Rule{
		arcjet.DetectBot(arcjet.BotOptions{
			Mode: arcjet.ModeLive,
			Deny: []string{
				arcjet.BotCategoryAI,
				"CURL",
			},
		}),
	},
}))

func must[T any](v T, err error) T {
	if err != nil {
		log.Fatal(err)
	}
	return v
}
