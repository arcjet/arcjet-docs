package main

import (
	"io"
	"log"
	"net/http"
	"os"

	"github.com/arcjet/arcjet-go"
)

var aj = must(arcjet.NewClient(arcjet.Config{
	Key: os.Getenv("ARCJET_KEY"),
	Rules: []arcjet.Rule{
		arcjet.SensitiveInfo(arcjet.SensitiveInfoOptions{
			Mode: arcjet.ModeLive,
			Deny: []arcjet.EntityType{arcjet.SensitiveInfoEmail},
		}),
	},
}))

func handler(w http.ResponseWriter, r *http.Request) {
	message, _ := io.ReadAll(r.Body)
	decision, err := aj.Protect(r.Context(), r, arcjet.WithSensitiveInfoValue(string(message)))
	if err != nil {
		log.Printf("arcjet: %v", err)
	}
	if si := decision.Reason.SensitiveInfo; si != nil {
		for _, e := range si.Denied {
			log.Printf("blocked %s at [%d:%d]", e.Type, e.Start, e.End)
		}
	}
	if decision.IsDenied() {
		http.Error(w, "bad request", http.StatusBadRequest)
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
