package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"unicode/utf8"

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
			// Run detection on-device with the Rampart NER model.
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
	// Rampart scans at most rampart.DefaultMaxInputChars characters and skips
	// the rest. Deny longer input so sensitive data can't hide past the limit.
	if utf8.RuneCount(message) > rampart.DefaultMaxInputChars {
		http.Error(w, "Message too long", http.StatusRequestEntityTooLarge)
		return
	}

	decision, err := aj.Protect(
		r.Context(),
		r,
		arcjet.WithSensitiveInfoValue(string(message)),
	)
	// Fail closed when Arcjet can't be reached.
	if err != nil {
		log.Printf("arcjet: %v", err)
		http.Error(w, "Service unavailable", http.StatusServiceUnavailable)
		return
	}

	if decision.IsDenied() {
		http.Error(w, "Bad request - sensitive information detected", http.StatusBadRequest)
		return
	}

	// Fail closed when Arcjet couldn't complete the check.
	if decision.IsErrored() {
		log.Printf("arcjet: %v", decision.Err())
		http.Error(w, "Service unavailable", http.StatusServiceUnavailable)
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
