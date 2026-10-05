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
	RefillRate: 40000,
	Interval:   24 * time.Hour,
	Capacity:   40000,
	Bucket:     "lookups",
}))

var policy = agentframework.ToolPolicy{
	Action: "order.looked-up",
	Rules: agentframework.Args(func(_ context.Context, _ json.RawMessage) ([]arcjet.GuardRuleInput, error) {
		return []arcjet.GuardRuleInput{lookupLimit.Key("user123", 50)}, nil
	}),
}

func must[T any](v T, err error) T {
	if err != nil {
		panic(err)
	}
	return v
}
