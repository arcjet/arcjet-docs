package main

import (
	"context"
	"encoding/json"
	"os"

	"github.com/anthropics/anthropic-sdk-go"
	"github.com/arcjet/arcjet-go"
	"github.com/arcjet/arcjet-go/agentframework"
	"github.com/arcjet/arcjet-go/sensitiveinfo/rampart"
	"github.com/microsoft/agent-framework-go/agent"
	"github.com/microsoft/agent-framework-go/provider/anthropicprovider"
	"github.com/microsoft/agent-framework-go/tool"
	"github.com/microsoft/agent-framework-go/tool/functool"
)

var guard = must(arcjet.NewGuardClient(arcjet.GuardConfig{
	SensitiveInfoBackend: must(rampart.New(rampart.Options{})),
}))

type user struct {
	id                string
	allowedRecipients []string
	record            map[string]string
}

type emailArgs struct {
	Recipient string `json:"recipient"`
	Body      string `json:"body"`
}

func runEmailAgent(ctx context.Context, u user, prompt string) (string, error) {
	getClientRecord := functool.MustNew(
		functool.Config{
			Name:        "get_client_record",
			Description: "Get the account details on file for the current customer.",
		},
		func(context.Context, struct{}) (map[string]string, error) {
			return u.record, nil
		},
	)
	sendEmail := functool.MustNew(
		functool.Config{Name: "send_email", Description: "Send an email."},
		func(_ context.Context, in emailArgs) (string, error) {
			return "sent", nil
		},
	)

	tools, err := agentframework.GuardTools(
		guard,
		[]tool.Tool{getClientRecord, sendEmail},
		func(t tool.Tool) (agentframework.ToolPolicy, bool) {
			if t.Name() != "send_email" {
				return agentframework.ToolPolicy{}, false
			}
			return agentframework.ToolPolicy{
				Action: "email.sent",
				Actor: func(context.Context, json.RawMessage) (string, error) {
					return u.id, nil
				},
				Inputs: func(_ context.Context, raw json.RawMessage) (
					map[string]arcjet.GuardPolicyInput, error,
				) {
					var in emailArgs
					if err := json.Unmarshal(raw, &in); err != nil {
						return nil, err
					}
					return map[string]arcjet.GuardPolicyInput{
						"recipient": arcjet.GuardPolicyServerString(
							in.Recipient,
						),
						"allowed_recipients": arcjet.GuardPolicyServerStringList(
							u.allowedRecipients,
						),
						"body": arcjet.GuardPolicyLocalString(in.Body),
					}, nil
				},
			}, true
		},
	)
	if err != nil {
		return "", err
	}

	a := anthropicprovider.NewAgent(anthropic.NewClient(), anthropicprovider.AgentConfig{
		Model: os.Getenv("ANTHROPIC_MODEL"),
		Instructions: "You are a support desk assistant. Use " +
			"get_client_record when the request needs account details. " +
			"Use send_email exactly once to complete the request. Don't " +
			"ask a follow-up question. Quote any account details you " +
			"retrieve in the email body exactly as returned, without " +
			"masking or summarizing them.",
		Config: agent.Config{Tools: tools},
	})

	ctx = arcjet.ContextWithCorrelationID(ctx, u.id)
	resp, err := a.RunText(ctx, prompt).Collect()
	if err != nil {
		return "", err
	}
	return resp.String(), nil
}

func must[T any](value T, err error) T {
	if err != nil {
		panic(err)
	}
	return value
}
