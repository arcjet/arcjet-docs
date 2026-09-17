package main

import (
	"context"
	"encoding/json"
	"fmt"

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

func guardedLookup(
	guard *arcjet.GuardClient,
	userID string,
	ownedOrders []string,
) (tool.FuncTool, error) {
	lookup := functool.MustNew(
		functool.Config{Name: "lookup_order", Description: "Look up an order by ID"},
		lookupOrder,
	)

	// GuardTool evaluates the policy before the function runs.
	return agentframework.GuardTool(guard, lookup, agentframework.ToolPolicy{
		Action: "order.looked-up",
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

func main() {
	guard, err := arcjet.NewGuardClient(arcjet.GuardConfig{})
	if err != nil {
		panic(fmt.Errorf("arcjet guard client: %w", err))
	}
	defer func() { _ = guard.Close(context.Background()) }()

	lookup, err := guardedLookup(guard, "user_123", []string{"1001"})
	if err != nil {
		panic(err)
	}

	// Hand `lookup` to the agent as a tool. A denial reaches the model as
	// arcjet.GuardDenialResult rather than a Go error.
	_ = lookup
}
