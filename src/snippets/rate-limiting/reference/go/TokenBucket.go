package main

import (
	"os"
	"time"

	"github.com/arcjet/arcjet-go"
)

var aj = must(arcjet.NewClient(arcjet.Config{
	Key: os.Getenv("ARCJET_KEY"),
	Rules: []arcjet.Rule{
		arcjet.TokenBucket(arcjet.TokenBucketOptions{
			Mode:       arcjet.ModeLive, // Blocks requests. Use ModeDryRun to log only.
			RefillRate: 10,              // Refill 10 tokens per interval.
			Interval:   time.Minute,     // 60 second interval.
			Capacity:   100,             // Bucket maximum capacity of 100 tokens.
		}),
	},
}))

func must[T any](v T, err error) T {
	if err != nil {
		log.Fatal(err)
	}
	return v
}
