package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/arcjet/arcjet-go"
)

var aj = must(arcjet.NewClient(arcjet.Config{
	Key: os.Getenv("ARCJET_KEY"),
	Rules: arcjet.ProtectSignup(arcjet.ProtectSignupOptions{
		RateLimit: arcjet.SlidingWindowOptions{Mode: arcjet.ModeLive, Interval: time.Hour, MaxRequests: 5},
		Bots:      arcjet.BotOptions{Mode: arcjet.ModeLive, Allow: []string{}},
		Email:     arcjet.EmailOptions{Mode: arcjet.ModeLive, Deny: []arcjet.EmailType{arcjet.EmailTypeDisposable}},
	}),
}))

func handler(w http.ResponseWriter, r *http.Request) {
	decision, err := aj.Protect(r.Context(), r, arcjet.WithEmail(r.FormValue("email")))
	if err != nil {
		log.Printf("arcjet: %v", err)
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
