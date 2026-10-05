package main

import (
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
	decision, err := aj.Protect(r.Context(), r, arcjet.WithSensitiveInfoValue(message))
	if err != nil {
		log.Printf("arcjet: %v", err)
	}
	if decision.Reason.IsSensitiveInfo() {
		http.Error(w, "Please remove personal information", http.StatusBadRequest)
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
