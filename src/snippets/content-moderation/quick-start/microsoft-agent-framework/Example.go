package main

import (
	"context"
	"encoding/json"

	"github.com/arcjet/arcjet-go"
	"github.com/arcjet/arcjet-go/agentframework"
	"github.com/microsoft/agent-framework-go/tool"
	"github.com/microsoft/agent-framework-go/tool/functool"
)

type messageArgs struct {
	Text string `json:"text"`
}

func postMessage(_ context.Context, in messageArgs) (map[string]bool, error) {
	return map[string]bool{"ok": true}, nil
}

func guardedPost(guard *arcjet.GuardClient) (tool.FuncTool, error) {
	moderate := must(arcjet.GuardModerateContent(arcjet.GuardModerateContentOptions{
		Mode: arcjet.ModeLive,
	}))
	fn := functool.MustNew(
		functool.Config{Name: "post_message", Description: "Post a user message"},
		postMessage,
	)
	return agentframework.GuardTool(guard, fn, agentframework.ToolPolicy{
		Action: "message.posted",
		Rules: agentframework.Args(func(_ context.Context, in messageArgs) ([]arcjet.GuardRuleInput, error) {
			return []arcjet.GuardRuleInput{moderate.Text(in.Text)}, nil
		}),
	})
}

func must[T any](v T, err error) T {
	if err != nil {
		panic(err)
	}
	return v
}
