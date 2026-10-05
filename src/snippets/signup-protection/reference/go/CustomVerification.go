package main

import (
	"os"
	"time"

	"github.com/arcjet/arcjet-go"
)

var aj = must(arcjet.NewClient(arcjet.Config{
	Key: os.Getenv("ARCJET_KEY"),
	Rules: arcjet.ProtectSignup(arcjet.ProtectSignupOptions{
		RateLimit: arcjet.SlidingWindowOptions{
			Mode:        arcjet.ModeLive,
			Interval:    time.Hour,
			MaxRequests: 5,
		},
		Bots: arcjet.BotOptions{Mode: arcjet.ModeLive, Allow: nil},
		Email: arcjet.EmailOptions{
			Mode: arcjet.ModeLive,
			Deny: []arcjet.EmailType{arcjet.EmailTypeDisposable, arcjet.EmailTypeInvalid},
		},
	}),
}))

func must[T any](v T, err error) T {
	if err != nil {
		log.Fatal(err)
	}
	return v
}
