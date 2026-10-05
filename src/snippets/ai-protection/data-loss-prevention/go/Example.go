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
		arcjet.SensitiveInfo(arcjet.SensitiveInfoOptions{
			Mode: arcjet.ModeLive,
			Deny: []arcjet.EntityType{
				arcjet.SensitiveInfoCreditCardNumber,
				arcjet.SensitiveInfoEmail,
			},
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
		arcjet.WithSensitiveInfoValue(body.Message),
	)
	if err != nil {
		log.Printf("arcjet: %v", err)
	} else if decision.IsDenied() && decision.Reason.IsSensitiveInfo() {
		http.Error(w, "Sensitive information detected – remove it from your prompt", http.StatusBadRequest)
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
