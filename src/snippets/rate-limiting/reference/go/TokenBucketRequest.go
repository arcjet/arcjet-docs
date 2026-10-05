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
		arcjet.TokenBucket(arcjet.TokenBucketOptions{
			Mode:       arcjet.ModeLive,
			RefillRate: 40000,
			Interval:   24 * time.Hour,
			Capacity:   40000,
		}),
	},
}))

func handler(w http.ResponseWriter, r *http.Request) {
	decision, err := aj.Protect(r.Context(), r, arcjet.WithRequested(50))
	if err != nil {
		log.Printf("arcjet: %v", err)
	}
	if decision.IsDenied() {
		http.Error(w, "Too Many Requests", http.StatusTooManyRequests)
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
