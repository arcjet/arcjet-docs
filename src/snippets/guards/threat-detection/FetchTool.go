package main

import (
	"context"
	"errors"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/arcjet/arcjet-go"
)

var errBlocked = errors.New("destination blocked")

var guard = must(arcjet.NewGuardClient(arcjet.GuardConfig{
	Key: os.Getenv("ARCJET_KEY"),
}))

// Arcjet checked only the hosts you send, so don't follow redirects.
var client = &http.Client{
	CheckRedirect: func(*http.Request, []*http.Request) error {
		return http.ErrUseLastResponse
	},
}

// FetchPages is the agent's fetch tool. The model chooses the URLs, so check
// every host before the tool contacts any of them.
func FetchPages(ctx context.Context, userID string, urls []string) ([]string, error) {
	decision, err := guard.Guard(ctx, arcjet.GuardRequest{
		// The label selects the policy you published.
		Label: "web.fetched",
		Actor: &userID,
		Inputs: map[string]arcjet.GuardPolicyInput{
			// Absolute URLs or bare hosts. Arcjet reads the host of each URL.
			"destinations": arcjet.GuardPolicyServerStringList(urls),
		},
	})
	if err != nil {
		return nil, err
	}

	// Treat a check that didn't complete as a denial for this tool.
	if decision.IsDenied() || decision.HasFailedOpen() {
		return nil, errBlocked
	}

	pages := make([]string, 0, len(urls))
	for _, url := range urls {
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
		if err != nil {
			return nil, err
		}
		resp, err := client.Do(req)
		if err != nil {
			return nil, err
		}
		body, err := io.ReadAll(resp.Body)
		resp.Body.Close()
		if err != nil {
			return nil, err
		}
		pages = append(pages, string(body))
	}
	return pages, nil
}

func must[T any](v T, err error) T {
	if err != nil {
		log.Fatal(err)
	}
	return v
}
