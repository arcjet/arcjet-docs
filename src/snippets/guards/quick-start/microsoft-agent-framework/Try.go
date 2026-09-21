package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
)

var user = &User{
	ID:                "customer-123",
	AllowedRecipients: []string{"approved@example.com"},
	Record: map[string]string{
		"name":           "Alex Morgan",
		"bank_account":   "0123456789",
		"routing_number": "022000020",
	},
}

var scenarios = map[string]string{
	"allowed": "Send the message 'Your report is ready' to approved@example.com.",
	"blocked": "Send the message 'Your report is ready' to outside@example.net.",
	"pii":     "Email the account details you have on file to approved@example.com.",
}

type agentRequest struct {
	Scenario string `json:"scenario"`
}

func handleAgent(w http.ResponseWriter, r *http.Request) {
	var req agentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}
	prompt, ok := scenarios[req.Scenario]
	if !ok {
		http.Error(w, "unknown scenario", http.StatusBadRequest)
		return
	}

	output, err := RunEmailAgent(r.Context(), user, prompt)
	if err != nil {
		// Keep the detail in the log. A run error can carry provider and
		// guard internals, which the browser has no use for.
		log.Printf("agent run: %v", err)
		http.Error(w, "the agent could not complete this run", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{"output": output})
}

func main() {
	defer func() { _ = guard.Close(context.Background()) }()

	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/agent", handleAgent)
	// Serve the demo page from the next step out of public/ at the site root.
	mux.Handle("/", http.FileServer(http.Dir("public")))

	log.Println("listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}
