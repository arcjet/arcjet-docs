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
			RefillRate:      2000,
			Interval:        time.Hour,
			Capacity:        5000,
		}),
	},
}))

type chatRequest struct {
	Message string `json:"message"`
}

func chat(w http.ResponseWriter, r *http.Request) {
	var body chatRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	userID := "user-123"
	estimate := (len(body.Message) + 3) / 4
	if estimate < 1 {
		estimate = 1
	}

	decision, err := aj.Protect(
		r.Context(),
		r,
		arcjet.WithRequested(estimate),
		arcjet.WithCharacteristics(map[string]string{"userId": userID}),
	)
	if err != nil {
		log.Printf("arcjet: %v", err)
	} else if decision.IsDenied() {
		http.Error(w, "AI usage limit exceeded", http.StatusTooManyRequests)
		return
	}

	_ = json.NewEncoder(w).Encode(map[string]string{"reply": "..."})
}

func main() {
	http.HandleFunc("/chat", chat)
	log.Fatal(http.ListenAndServe(":8000", nil))
}

func must[T any](v T, err error) T {
	if err != nil {
		log.Fatal(err)
	}
	return v
}
