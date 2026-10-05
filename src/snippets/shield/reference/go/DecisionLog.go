package main

import (
	"log"
	"net/http"
	"os"

	"github.com/arcjet/arcjet-go"
)

var aj = must(arcjet.NewClient(arcjet.Config{
	Key: os.Getenv("ARCJET_KEY"),
	Rules: []arcjet.Rule{
		arcjet.Shield(arcjet.ShieldOptions{Mode: arcjet.ModeLive}),
	},
}))

func handler(w http.ResponseWriter, r *http.Request) {
	decision, err := aj.Protect(r.Context(), r)
	if err != nil {
		log.Printf("arcjet: %v", err)
	}
	for _, result := range decision.Results {
		log.Printf("Rule Result %+v", result)
		if result.Reason.IsShield() {
			log.Printf("Shield rule %+v", result)
		}
	}
	if decision.IsDenied() {
		http.Error(w, "Forbidden", http.StatusForbidden)
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
