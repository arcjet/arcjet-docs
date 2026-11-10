package main

import (
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
			Deny: []arcjet.EntityType{
				arcjet.SensitiveInfoGivenName,
				arcjet.SensitiveInfoSurname,
				arcjet.SensitiveInfoEmail,
				arcjet.SensitiveInfoSSN,
			},
			Backend: backend,
		}),
	},
}))

func handler(w http.ResponseWriter, r *http.Request) {
	message := r.FormValue("message")
	// Rampart scans at most rampart.DefaultMaxInputChars characters and skips
	// the rest. Deny longer input so sensitive data can't hide past the limit.
	if utf8.RuneCountInString(message) > rampart.DefaultMaxInputChars {
		http.Error(w, "Message too long", http.StatusRequestEntityTooLarge)
		return
	}

	decision, err := aj.Protect(r.Context(), r, arcjet.WithSensitiveInfoValue(message))
	// Fail closed when Arcjet can't be reached.
	if err != nil {
		log.Printf("arcjet: %v", err)
		http.Error(w, "Service unavailable", http.StatusServiceUnavailable)
		return
	}
	if decision.IsDenied() {
		if decision.Reason.IsSensitiveInfo() {
			http.Error(w, "Please remove personal information", http.StatusBadRequest)
			return
		}
		// Block other denials too, such as one from a remote rule.
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}
	// Fail closed when Arcjet couldn't complete the check.
	if decision.IsErrored() {
		log.Printf("arcjet: %v", decision.Err())
		http.Error(w, "Service unavailable", http.StatusServiceUnavailable)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func must[T any](v T, err error) T {
	if err != nil {
		log.Fatal(err)
	}
	return v
}
