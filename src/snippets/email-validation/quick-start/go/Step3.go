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
		arcjet.ValidateEmail(arcjet.EmailOptions{
			Mode: arcjet.ModeLive,
			Deny: []arcjet.EmailType{
				arcjet.EmailTypeDisposable,
				arcjet.EmailTypeInvalid,
				arcjet.EmailTypeNoMXRecords,
			},
		}),
	},
}))

func handler(w http.ResponseWriter, r *http.Request) {
	email := r.FormValue("email")
	log.Printf("Email received: %s", email)

	decision, err := aj.Protect(r.Context(), r, arcjet.WithEmail(email))
	if err != nil {
		log.Printf("arcjet: %v", err)
	}

	if decision.IsDenied() {
		if decision.Reason.IsEmail() {
			http.Error(w, "Invalid email", http.StatusBadRequest)
			return
		}
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}
	_ = json.NewEncoder(w).Encode(map[string]string{"message": "Hello world", "email": email})
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
