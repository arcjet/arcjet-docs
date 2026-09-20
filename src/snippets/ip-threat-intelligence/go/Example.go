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
		arcjet.Filter(arcjet.FilterOptions{
			// Deny hosting (data center) IPs, VPNs, proxies, and Tor.
			// This does not deny privacy relays such as Apple Private Relay.
			Deny: []string{
				"ip.src.hosting or ip.src.vpn or ip.src.proxy or ip.src.tor",
			},
			// Block requests with ModeLive, use ModeDryRun to log only.
			Mode: arcjet.ModeLive,
		}),
	},
}))

func handler(w http.ResponseWriter, r *http.Request) {
	decision, err := aj.Protect(r.Context(), r)
	if err != nil {
		// Fail-open: ERROR decision plus err. Log it and continue.
		log.Printf("arcjet: %v", err)
	} else if decision.IsDenied() {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("Hello world"))
}

func main() {
	http.HandleFunc("/", handler)
	log.Fatal(http.ListenAndServe(":3000", nil))
}

func must[T any](value T, err error) T {
	if err != nil {
		panic(err)
	}
	return value
}
