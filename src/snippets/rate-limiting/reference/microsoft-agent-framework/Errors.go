package main

import (
	"context"
	"errors"
	"log"
	"os"
	"time"

	"github.com/arcjet/arcjet-go"
)

var errDenied = errors.New("rate limited")

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

func check(ctx context.Context, userID string) error {
	decision, err := guard.Guard(ctx, arcjet.GuardRequest{
		Label: "order.looked-up",
		Rules: []arcjet.GuardRuleInput{lookupLimit.Key(userID, 5)},
	})
	if err != nil {
		return err
	}
	if decision.HasFailedOpen() {
		log.Printf("guard failed open")
	}
	if decision.IsDenied() {
		return errDenied
	}
	return nil
}

func must[T any](v T, err error) T {
	if err != nil {
		log.Fatal(err)
	}
	return v
}
