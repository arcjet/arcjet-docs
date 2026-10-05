package main

import (
	"context"
	"encoding/json"
	"time"

	"github.com/arcjet/arcjet-go"
	"github.com/arcjet/arcjet-go/agentframework"
	"github.com/microsoft/agent-framework-go/tool"
	"github.com/microsoft/agent-framework-go/tool/functool"
)

type orderArgs struct {
	OrderID string `json:"order_id"`
}

func lookupOrder(_ context.Context, in orderArgs) (map[string]string, error) {
	return map[string]string{"order_id": in.OrderID, "status": "shipped"}, nil
}

func guardedLookup(guard *arcjet.GuardClient, userID string) (tool.FuncTool, error) {
	lookup := functool.MustNew(
		functool.Config{Name: "lookup_order", Description: "Look up an order by ID"},
		lookupOrder,
	)
	lookupLimit := must(arcjet.GuardTokenBucket(arcjet.GuardTokenBucketOptions{
		Mode:       arcjet.ModeLive,
		RefillRate: 5,
		Interval:   10 * time.Second,
		Capacity:   10,
		Bucket:     "lookups",
	}))

	return agentframework.GuardTool(guard, lookup, agentframework.ToolPolicy{
		Action: "order.looked-up",
		Actor: func(context.Context, json.RawMessage) (string, error) {
			return userID, nil
		},
		Rules: agentframework.Args(func(_ context.Context, in orderArgs) ([]arcjet.GuardRuleInput, error) {
			return []arcjet.GuardRuleInput{lookupLimit.Key(userID, 5)}, nil
		}),
	})
}

func must[T any](v T, err error) T {
	if err != nil {
		panic(err)
	}
	return v
}
