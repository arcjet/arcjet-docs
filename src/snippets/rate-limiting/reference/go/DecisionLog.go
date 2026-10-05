package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/arcjet/arcjet-go"
)

var aj = must(arcjet.NewClient(arcjet.Config{
	Key: os.Getenv("ARCJET_KEY"),
	Rules: []arcjet.Rule{
		arcjet.FixedWindow(arcjet.FixedWindowOptions{
			Mode:        arcjet.ModeLive,
			Window:      time.Hour,
			MaxRequests: 60,
		}),
		arcjet.DetectBot(arcjet.BotOptions{
			Mode:  arcjet.ModeLive,
			Allow: []string{}, // Block all detected bots.
		}),
	},
}))

func handler(w http.ResponseWriter, r *http.Request) {
	decision, err := aj.Protect(r.Context(), r)
	if err != nil {
		log.Printf("arcjet: %v", err)
	}

	for _, result := range decision.Results {
		log.Printf("Rule Result %+v", result)
		if result.Reason.IsRateLimit() {
			log.Printf("Rate limit rule %+v", result)
		}
		if result.Reason.IsBot() {
			log.Printf("Bot protection rule %+v", result)
		}
	}

	if decision.IsDenied() {
		if decision.Reason.IsRateLimit() {
			http.Error(w, "Too Many Requests", http.StatusTooManyRequests)
			return
		}
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}
	_ = json.NewEncoder(w).Encode(map[string]string{"message": "Hello world"})
}

func must[T any](v T, err error) T {
	if err != nil {
		log.Fatal(err)
	}
	return v
}
