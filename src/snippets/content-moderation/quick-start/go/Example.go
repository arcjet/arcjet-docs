package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/arcjet/arcjet-go"
)

var guard = must(arcjet.NewGuardClient(arcjet.GuardConfig{
	Key: os.Getenv("ARCJET_KEY"),
}))

var moderate = must(arcjet.GuardModerateContent(arcjet.GuardModerateContentOptions{
	Mode: arcjet.ModeLive,
}))

type messageRequest struct {
	Message string `json:"message"`
}

func handler(w http.ResponseWriter, r *http.Request) {
	var body messageRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	decision, err := guard.Guard(r.Context(), arcjet.GuardRequest{
		Label: "message.received",
		Rules: []arcjet.GuardRuleInput{moderate.Text(body.Message)},
	})
	if err != nil {
		log.Printf("arcjet: %v", err)
	}

	if decision.IsDenied() && decision.Reason == arcjet.ReasonModerateContent {
		http.Error(w, "Harmful content detected – rephrase your message", http.StatusBadRequest)
		return
	}

	_ = json.NewEncoder(w).Encode(map[string]bool{"ok": true})
}

func main() {
	http.HandleFunc("/messages", handler)
	log.Fatal(http.ListenAndServe(":8000", nil))
}

func must[T any](v T, err error) T {
	if err != nil {
		log.Fatal(err)
	}
	return v
}
