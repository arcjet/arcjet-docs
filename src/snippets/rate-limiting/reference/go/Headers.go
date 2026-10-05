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
	},
}))

func handler(w http.ResponseWriter, r *http.Request) {
	decision, err := aj.Protect(r.Context(), r)
	if err != nil {
		log.Printf("arcjet: %v", err)
	}
	arcjet.SetRateLimitHeaders(w, decision)
	if decision.IsDenied() {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusTooManyRequests)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Too Many Requests"})
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
