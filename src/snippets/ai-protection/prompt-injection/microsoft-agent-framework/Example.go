package main

import (
	"context"

	"github.com/arcjet/arcjet-go"
	"github.com/arcjet/arcjet-go/agentframework"
	"github.com/microsoft/agent-framework-go/agent"
)

func inbound(guard *arcjet.GuardClient) (agent.Middleware, error) {
	promptScan := must(arcjet.GuardPromptInjection(arcjet.GuardPromptInjectionOptions{
		Mode: arcjet.ModeLive,
	}))
	return agentframework.GuardMiddleware(guard, agentframework.MiddlewareConfig{
		Inbound: &agentframework.InboundPolicy{
			Action: "message.received",
			Rules: func(_ context.Context, text string) ([]arcjet.GuardRuleInput, error) {
				return []arcjet.GuardRuleInput{promptScan.Text(text)}, nil
			},
		},
	})
}

func must[T any](v T, err error) T {
	if err != nil {
		panic(err)
	}
	return v
}
