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
	Key: os.Getenv("ARCJET_KEY"), // Get your site key from https://console.arcjet.com
	Rules: []arcjet.Rule{
		// Create a token bucket rate limit. Other algorithms are supported.
		arcjet.TokenBucket(arcjet.TokenBucketOptions{
			Mode:            arcjet.ModeLive, // Blocks requests. Use ModeDryRun to log only.
			Characteristics: []string{"userId"}, // Track requests by a custom user ID.
			RefillRate:      5,                  // Refill 5 tokens per interval.
			Interval:        10 * time.Second,   // Refill every 10 seconds.
			Capacity:        10,                 // Bucket maximum capacity of 10 tokens.
		}),
	},
}))

func handler(w http.ResponseWriter, r *http.Request) {
	userID := "user123" // Replace with your authenticated user ID.
	decision, err := aj.Protect(
		r.Context(),
		r,
		arcjet.WithCharacteristics(map[string]string{"userId": userID}),
		arcjet.WithRequested(5), // Deduct 5 tokens from the bucket.
	)
	if err != nil {
		log.Printf("arcjet: %v", err)
	}
	log.Printf("Arcjet decision %+v", decision)

	if decision.IsDenied() {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusTooManyRequests)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Too Many Requests"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{"message": "Hello world"})
}

func main() {
	http.HandleFunc("/", handler)
	log.Fatal(http.ListenAndServe(":8000", nil))
}

func must[T any](v T, err error) T {
	if err != nil {
		log.Fatal(err)
	}
	return v
}
