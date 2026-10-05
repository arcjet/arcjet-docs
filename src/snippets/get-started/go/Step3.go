package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/arcjet/arcjet-go"
)

var arcjetKey = func() string {
	key := os.Getenv("ARCJET_KEY")
	if key == "" {
		log.Fatal("ARCJET_KEY is required. Get one with: arcjet sites get-key" +
			" or from https://app.arcjet.com")
	}
	return key
}()

// Create a single Arcjet client and reuse it across requests.
var aj = must(arcjet.NewClient(arcjet.Config{
	Key: arcjetKey,
	Rules: []arcjet.Rule{
		// Detect and block prompt injection attacks in user messages.
		arcjet.DetectPromptInjection(arcjet.PromptInjectionOptions{
			Mode: arcjet.ModeLive,
		}),
		// Rate limit by token budget — refill 5 tokens every 10 seconds.
		arcjet.TokenBucket(arcjet.TokenBucketOptions{
			Mode:            arcjet.ModeLive,
			Characteristics: []string{"userId"},
			RefillRate:      5,
			Interval:        10 * time.Second,
			Capacity:        10,
		}),
		// Block automated clients. Empty allow list = block all bots.
		arcjet.DetectBot(arcjet.BotOptions{
			Mode:  arcjet.ModeLive,
			Allow: []string{},
		}),
		// Protect against common web attacks (SQLi, XSS, and similar).
		arcjet.Shield(arcjet.ShieldOptions{Mode: arcjet.ModeLive}),
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

	userID := "user_123" // Replace with a real user ID from the session.

	decision, err := aj.Protect(
		r.Context(),
		r,
		arcjet.WithRequested(5), // tokens consumed per request
		arcjet.WithCharacteristics(map[string]string{"userId": userID}),
		arcjet.WithDetectPromptInjectionMessage(body.Message),
	)
	if err != nil {
		// Arcjet fails open — log and continue serving.
		log.Printf("arcjet: %v", err)
	} else if decision.IsDenied() {
		status := http.StatusForbidden
		if decision.Reason.IsRateLimit() {
			status = http.StatusTooManyRequests
		} else if decision.Reason.IsPromptInjection() {
			status = http.StatusBadRequest
		}
		http.Error(w, "denied", status)
		return
	}

	// Safe to pass body.Message to your LLM.
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
