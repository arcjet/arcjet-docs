package main

import (
	"os"
	"time"

	"github.com/arcjet/arcjet-go"
)

var aj = must(arcjet.NewClient(arcjet.Config{
	Key: os.Getenv("ARCJET_KEY"),
	Rules: []arcjet.Rule{
		arcjet.FixedWindow(arcjet.FixedWindowOptions{
			Mode:        arcjet.ModeLive, // Blocks requests. Use ModeDryRun to log only.
			Window:      time.Minute,     // 60 second fixed window.
			MaxRequests: 100,             // Allow a maximum of 100 requests.
		}),
	},
}))

func must[T any](v T, err error) T {
	if err != nil {
		log.Fatal(err)
	}
	return v
}
