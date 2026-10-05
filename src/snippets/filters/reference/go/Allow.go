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
		arcjet.Filter(arcjet.FilterOptions{
			Mode: arcjet.ModeLive,
			Allow: []string{
				`http.request.method eq "GET" and ip.src.country eq "US" and not ip.src.vpn`,
				`local["userId"] == "admin"`,
			},
		}),
	},
}))

func handler(w http.ResponseWriter, r *http.Request) {
	decision, err := aj.Protect(
		r.Context(),
		r,
		arcjet.WithFilterLocal(map[string]string{"userId": "admin"}),
	)
	if err != nil {
		log.Printf("arcjet: %v", err)
	}
	if decision.IsDenied() {
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
