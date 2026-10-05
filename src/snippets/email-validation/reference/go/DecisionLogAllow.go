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
		arcjet.ValidateEmail(arcjet.EmailOptions{
			Mode:  arcjet.ModeLive,
			Allow: []arcjet.EmailType{arcjet.EmailTypeFree},
		}),
	},
}))

func handler(w http.ResponseWriter, r *http.Request) {
	decision, err := aj.Protect(r.Context(), r, arcjet.WithEmail(r.FormValue("email")))
	if err != nil {
		log.Printf("arcjet: %v", err)
	}
	if decision.Reason.IsEmail() && decision.Reason.Email != nil {
		log.Printf("email types %v", decision.Reason.Email.Types)
	}
	if decision.IsDenied() {
		http.Error(w, "Invalid email", http.StatusBadRequest)
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
