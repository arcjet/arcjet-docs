package main

import (
	"context"
	"encoding/json"
	"time"

	"github.com/arcjet/arcjet-go"
	"github.com/arcjet/arcjet-go/agentframework"
)

var lookupLimit = must(arcjet.GuardTokenBucket(arcjet.GuardTokenBucketOptions{
	Mode:       arcjet.ModeLive,
	RefillRate: 5,
	Interval:   10 * time.Second,
	Capacity:   10,
	Bucket:     "lookups",
}))

func policyFor(userID string) agentframework.ToolPolicy {
	return agentframework.ToolPolicy{
		Action: "order.looked-up",
		Actor: func(context.Context, json.RawMessage) (string, error) {
			return userID, nil
		},
		// Key the bucket on a trusted application identity, not a model argument.
		Rules: agentframework.Args(func(context.Context, json.RawMessage) ([]arcjet.GuardRuleInput, error) {
			return []arcjet.GuardRuleInput{lookupLimit.Key(userID, 5)}, nil
		}),
	}
}

func must[T any](v T, err error) T {
	if err != nil {
		panic(err)
	}
	return v
}
