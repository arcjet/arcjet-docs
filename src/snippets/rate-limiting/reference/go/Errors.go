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
			Mode:            arcjet.ModeLive,
			Characteristics: []string{"userId"},
			RefillRate:      5,
			Interval:        10 * time.Second,
			Capacity:        10,
		}),
	},
}))

func handler(w http.ResponseWriter, r *http.Request) {
	userID := "user123"
	decision, err := aj.Protect(
		r.Context(),
		r,
		arcjet.WithCharacteristics(map[string]string{"userId": userID}),
		arcjet.WithRequested(5),
	)
	if err != nil {
		// Fail open by logging the error and continuing.
		log.Printf("arcjet: %v", err)
	}

	for _, result := range decision.Results {
		if result.Reason.IsError() {
			log.Printf("Arcjet error: %s", result.Reason.Message)
		}
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
