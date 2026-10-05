package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/arcjet/arcjet-go"
	"github.com/arcjet/arcjet-go/sensitiveinfo/rampart"
)

var backend = must(rampart.New(rampart.Options{}))

var aj = must(arcjet.NewClient(arcjet.Config{
	Key: os.Getenv("ARCJET_KEY"),
	Rules: []arcjet.Rule{
		arcjet.SensitiveInfo(arcjet.SensitiveInfoOptions{
			Mode: arcjet.ModeLive,
			// Detect names and email addresses. See the reference for the full list.
			Deny: []arcjet.EntityType{
				arcjet.SensitiveInfoEmail,
				arcjet.SensitiveInfoGivenName,
				arcjet.SensitiveInfoSurname,
			},
			// Use the on-device Rampart NER model instead of the built-in analyzer.
			Backend: backend,
		}),
	},
}))

func handler(w http.ResponseWriter, r *http.Request) {
	message, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	decision, err := aj.Protect(
		r.Context(),
		r,
		arcjet.WithSensitiveInfoValue(string(message)),
	)
	if err != nil {
		log.Printf("arcjet: %v", err)
	}

	if decision.IsDenied() {
		http.Error(w, "Bad request - sensitive information detected", http.StatusBadRequest)
		return
	}
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
