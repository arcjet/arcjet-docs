package main

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/arcjet/arcjet-go"
)

var guard = must(arcjet.NewGuardClient(arcjet.GuardConfig{
	Key: os.Getenv("ARCJET_KEY"),
}))

var lookupLimit = must(arcjet.GuardTokenBucket(arcjet.GuardTokenBucketOptions{
	Mode:       arcjet.ModeLive,
	RefillRate: 5,
	Interval:   10 * time.Second,
	Capacity:   10,
	Bucket:     "lookups",
}))

func check(ctx context.Context, userID string) {
	decision, err := guard.Guard(ctx, arcjet.GuardRequest{
		Label: "order.looked-up",
		Rules: []arcjet.GuardRuleInput{lookupLimit.Key(userID, 5)},
	})
	if err != nil {
		log.Printf("arcjet: %v", err)
		return
	}
	log.Printf("conclusion=%s reason=%s", decision.Conclusion, decision.Reason)
	if decision.IsDenied() {
		log.Printf("denied")
	}
}

func must[T any](v T, err error) T {
	if err != nil {
		log.Fatal(err)
	}
	return v
}
