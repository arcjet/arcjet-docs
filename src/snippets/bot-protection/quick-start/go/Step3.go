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
		arcjet.DetectBot(arcjet.BotOptions{
			Mode: arcjet.ModeLive, // Blocks requests. Use ModeDryRun to log only.
			Allow: []string{
				arcjet.BotCategorySearchEngine, // Google, Bing, etc.
				// arcjet.BotCategoryMonitor,    // Uptime monitoring
				// arcjet.BotCategoryPreview,    // Link previews (Slack, Discord)
			},
		}),
	},
}))

func handler(w http.ResponseWriter, r *http.Request) {
	decision, err := aj.Protect(r.Context(), r)
	if err != nil {
		log.Printf("arcjet: %v", err)
	}

	if decision.IsDenied() {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	// Requests from hosting IPs are often bots. Allow them on API endpoints
	// if your clients run in data centers.
	// https://docs.arcjet.com/blueprints/vpn-proxy-detection
	if decision.IP.IsHosting {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	if decision.IsSpoofedBot() {
		http.Error(w, "Forbidden", http.StatusForbidden)
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
