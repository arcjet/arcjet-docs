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
		arcjet.Shield(arcjet.ShieldOptions{Mode: arcjet.ModeLive}),
		arcjet.DetectPromptInjection(arcjet.PromptInjectionOptions{
			Mode: arcjet.ModeLive,
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

	decision, err := aj.Protect(
		r.Context(),
		r,
		arcjet.WithDetectPromptInjectionMessage(body.Message),
	)
	if err != nil {
		log.Printf("arcjet: %v", err)
	} else if decision.IsDenied() {
		if decision.Reason.IsPromptInjection() {
			http.Error(w, "Prompt injection detected – rephrase your message", http.StatusBadRequest)
			return
		}
		http.Error(w, "Forbidden", http.StatusForbidden)
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
