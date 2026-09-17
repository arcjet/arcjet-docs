package main

import (
	"context"
	"encoding/json"

	"github.com/arcjet/arcjet-go"
	"github.com/arcjet/arcjet-go/agentframework"
	"github.com/microsoft/agent-framework-go/tool"
	"github.com/microsoft/agent-framework-go/tool/functool"
)

var guard = must(arcjet.NewGuardClient(arcjet.GuardConfig{}))

type orderArgs struct {
	OrderID string `json:"order_id"`
}

var lookupOrder = functool.MustNew(
	functool.Config{Name: "lookup_order", Description: "Look up an order by ID"},
	func(_ context.Context, in orderArgs) (map[string]string, error) {
		return map[string]string{"order_id": in.OrderID, "status": "shipped"}, nil
	},
)

func guardedLookup(userID string, ownedOrders []string) (tool.FuncTool, error) {
	return agentframework.GuardTool(guard, lookupOrder, agentframework.ToolPolicy{
		// The action selects the policy you published.
		Action: "order.looked-up",
		// Actor and the order list come from trusted application state.
		Actor: func(context.Context, json.RawMessage) (string, error) {
			return userID, nil
		},
		Inputs: func(_ context.Context, raw json.RawMessage) (map[string]arcjet.GuardPolicyInput, error) {
			var in orderArgs
			if err := json.Unmarshal(raw, &in); err != nil {
				return nil, err
			}
			return map[string]arcjet.GuardPolicyInput{
				"order_id":     arcjet.GuardPolicyServerString(in.OrderID),
				"owned_orders": arcjet.GuardPolicyServerStringList(ownedOrders),
			}, nil
		},
	})
}

func must[T any](value T, err error) T {
	if err != nil {
		panic(err)
	}
	return value
}
