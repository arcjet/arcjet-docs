package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/arcjet/arcjet-go"
)

var aj = must(arcjet.NewClient(arcjet.Config{
	Key: os.Getenv("ARCJET_KEY"),
	Rules: []arcjet.Rule{
		arcjet.DetectBot(arcjet.BotOptions{
			Mode:  arcjet.ModeLive,
			Allow: []string{},
		}),
	},
}))

func handler(w http.ResponseWriter, r *http.Request) {
	decision, err := aj.Protect(r.Context(), r)
	if err != nil {
		log.Printf("arcjet: %v", err)
	}

	for _, result := range decision.Results {
		if result.Reason.IsBot() && result.Reason.Bot != nil {
			log.Printf("allowed bots %v", result.Reason.Bot.Allowed)
			log.Printf("denied bots %v", result.Reason.Bot.Denied)
			if result.Reason.Bot.Spoofed {
				log.Printf("spoofed bot detected")
			}
			if result.Reason.Bot.Verified {
				log.Printf("verified bot detected")
			}
		}
	}

	if decision.IsDenied() {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}
	if decision.IsSpoofedBot() {
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
