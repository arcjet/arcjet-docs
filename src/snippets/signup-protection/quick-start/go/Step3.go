package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/arcjet/arcjet-go"
)

var aj = must(arcjet.NewClient(arcjet.Config{
	Key: os.Getenv("ARCJET_KEY"),
	Rules: append(
		[]arcjet.Rule{arcjet.Shield(arcjet.ShieldOptions{Mode: arcjet.ModeLive})},
		arcjet.ProtectSignup(arcjet.ProtectSignupOptions{
			RateLimit: arcjet.SlidingWindowOptions{
				Mode:        arcjet.ModeLive,
				Interval:    10 * time.Minute,
				MaxRequests: 5,
			},
			Bots: arcjet.BotOptions{
				Mode:  arcjet.ModeLive,
				Allow: []string{"CURL"},
			},
			Email: arcjet.EmailOptions{
				Mode: arcjet.ModeLive,
				Deny: []arcjet.EmailType{
					arcjet.EmailTypeDisposable,
					arcjet.EmailTypeInvalid,
					arcjet.EmailTypeNoMXRecords,
				},
			},
		})...,
	),
}))

func signup(w http.ResponseWriter, r *http.Request) {
	email := r.FormValue("email")
	decision, err := aj.Protect(r.Context(), r, arcjet.WithEmail(email))
	if err != nil {
		log.Printf("arcjet: %v", err)
	}
	if decision.IsDenied() {
		if decision.Reason.IsEmail() {
			http.Error(w, "Invalid email", http.StatusBadRequest)
			return
		}
		if decision.Reason.IsRateLimit() {
			http.Error(w, "Too Many Requests", http.StatusTooManyRequests)
			return
		}
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}
	_ = json.NewEncoder(w).Encode(map[string]string{"message": "Hello world", "email": email})
}

func main() {
	http.HandleFunc("/signup", signup)
	log.Fatal(http.ListenAndServe(":8000", nil))
}

func must[T any](v T, err error) T {
	if err != nil {
		log.Fatal(err)
	}
	return v
}
