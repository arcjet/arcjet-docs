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

type promptArgs struct {
	Prompt          string `json:"prompt"`
	EstimatedTokens int    `json:"estimated_tokens"`
}

func completePrompt(_ context.Context, in promptArgs) (map[string]string, error) {
	return map[string]string{"prompt": in.Prompt}, nil
}

func guardedComplete(guard *arcjet.GuardClient, userID string) (tool.FuncTool, error) {
	tokenBudget := must(arcjet.GuardTokenBucket(arcjet.GuardTokenBucketOptions{
		Mode:       arcjet.ModeLive,
		RefillRate: 2000,
		Interval:   time.Hour,
		Capacity:   5000,
		Bucket:     "ai-tokens",
	}))
	fn := functool.MustNew(
		functool.Config{Name: "complete_prompt", Description: "Complete a user prompt"},
		completePrompt,
	)
	return agentframework.GuardTool(guard, fn, agentframework.ToolPolicy{
		Action: "prompt.completed",
		Actor: func(context.Context, json.RawMessage) (string, error) {
			return userID, nil
		},
		Rules: agentframework.Args(func(_ context.Context, in promptArgs) ([]arcjet.GuardRuleInput, error) {
			requested := in.EstimatedTokens
			if requested < 1 {
				requested = 1
			}
			return []arcjet.GuardRuleInput{tokenBudget.Key(userID, requested)}, nil
		}),
	})
}

func must[T any](v T, err error) T {
	if err != nil {
		panic(err)
	}
	return v
}
