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
			Deny: []arcjet.EntityType{
				arcjet.SensitiveInfoEmail,
				arcjet.SensitiveInfoGivenName,
				arcjet.SensitiveInfoSurname,
				arcjet.SensitiveInfoStreetName,
				arcjet.SensitiveInfoSSN,
			},
			Backend: backend,
		}),
	},
}))

func handler(w http.ResponseWriter, r *http.Request) {
	message, _ := io.ReadAll(r.Body)
	decision, err := aj.Protect(
		r.Context(),
		r,
		arcjet.WithSensitiveInfoValue(string(message)),
	)
	if err != nil {
		log.Printf("arcjet: %v", err)
	}

	for _, result := range decision.Results {
		log.Printf("Rule Result %+v", result)
		if result.Reason.IsSensitiveInfo() {
			log.Printf("Sensitive info rule %+v", result)
		}
	}

	if decision.IsDenied() {
		if decision.Reason.IsSensitiveInfo() {
			http.Error(w, "Unexpected sensitive info detected", http.StatusBadRequest)
			return
		}
		http.Error(w, "Forbidden", http.StatusForbidden)
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
