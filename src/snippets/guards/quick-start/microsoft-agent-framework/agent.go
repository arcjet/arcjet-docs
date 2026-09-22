package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"

	"github.com/anthropics/anthropic-sdk-go"
	"github.com/microsoft/agent-framework-go/agent"
	"github.com/microsoft/agent-framework-go/provider/anthropicprovider"
	"github.com/microsoft/agent-framework-go/tool"
	"github.com/microsoft/agent-framework-go/tool/functool"

	"github.com/arcjet/arcjet-go"
	"github.com/arcjet/arcjet-go/agentframework"
	"github.com/arcjet/arcjet-go/sensitiveinfo/rampart"
)

// User is the authenticated caller. The allow list is application state, so a
// model that proposes a recipient cannot widen it.
type User struct {
	ID                string
	AllowedRecipients []string
	Record            map[string]string
}

type userKey struct{}

// WithUser puts the authenticated user on the context. The policy resolvers
// below read it from there rather than from the model's arguments.
func WithUser(ctx context.Context, u *User) context.Context {
	return context.WithValue(ctx, userKey{}, u)
}

func userFrom(ctx context.Context) (*User, error) {
	u, ok := ctx.Value(userKey{}).(*User)
	if !ok {
		// A resolver error counts as policy that was not evaluated, so this
		// fails closed rather than sending the call without an actor.
		return nil, errors.New("no authenticated user on the context")
	}
	return u, nil
}

type emailArgs struct {
	Recipient string `json:"recipient"`
	Body      string `json:"body"`
}

// Rampart detects BANK_ACCOUNT and ROUTING_NUMBER on this machine, so the
// email body is never sent to Arcjet, which receives the verdict only. That
// covers the guard call; it says nothing about what your own tools hand the
// model.
var backend = must(rampart.New(rampart.Options{}))

var guard = must(arcjet.NewGuardClient(arcjet.GuardConfig{
	SensitiveInfoBackend: backend,
}))

// This tool returns real account details so the third scenario has something
// for the policy to catch. Its result goes to the model provider like any tool
// result: Rampart keeps the guard's inspection of the email body on this
// machine, which is a different thing from keeping the record out of the
// prompt. Return only what the model needs, and put a guard on the tool that
// reads it if that set is itself sensitive.
var getClientRecord = functool.MustNew(
	functool.Config{
		Name:        "get_client_record",
		Description: "Get the account details on file for the current customer",
	},
	func(ctx context.Context, _ struct{}) (map[string]string, error) {
		u, err := userFrom(ctx)
		if err != nil {
			return nil, err
		}
		return u.Record, nil
	},
)

var sendEmail = functool.MustNew(
	functool.Config{Name: "send_email", Description: "Send an email"},
	func(_ context.Context, in emailArgs) (string, error) {
		// Your mail transport goes here.
		return fmt.Sprintf("sent to %s", in.Recipient), nil
	},
)

// The action matches the guard label you published in step 1, and the three
// inputs match the names that policy declares.
var guardedSendEmail = agentframework.MustGuardTool(guard, sendEmail, agentframework.ToolPolicy{
	Action: "email.sent",
	Actor: func(ctx context.Context, _ json.RawMessage) (string, error) {
		u, err := userFrom(ctx)
		if err != nil {
			return "", err
		}
		return u.ID, nil
	},
	Inputs: func(ctx context.Context, raw json.RawMessage) (map[string]arcjet.GuardPolicyInput, error) {
		u, err := userFrom(ctx)
		if err != nil {
			return nil, err
		}
		var in emailArgs
		if err := json.Unmarshal(raw, &in); err != nil {
			return nil, err
		}
		return map[string]arcjet.GuardPolicyInput{
			"recipient":          arcjet.GuardPolicyServerString(in.Recipient),
			"allowed_recipients": arcjet.GuardPolicyServerStringList(u.AllowedRecipients),
			"body":               arcjet.GuardPolicyLocalString(in.Body),
		}, nil
	},
	Metadata: arcjet.SecurityMetadata{Destination: "email", Reversibility: "irreversible"}.Metadata(),
})

var emailAgent = anthropicprovider.NewAgent(anthropic.NewClient(), anthropicprovider.AgentConfig{
	Model: os.Getenv("ANTHROPIC_MODEL"),
	Instructions: "You send email only to approved recipients. You never ask a " +
		"follow-up question, and you quote any account details you retrieve " +
		"exactly as returned, without masking them.",
	Config: agent.Config{
		Tools: []tool.Tool{getClientRecord, guardedSendEmail},
	},
})

// RunEmailAgent runs one turn for a user. The correlation ID groups every
// decision from this turn into one Sequence in the Arcjet console.
func RunEmailAgent(ctx context.Context, u *User, prompt string) (string, error) {
	ctx = WithUser(ctx, u)
	ctx = arcjet.ContextWithCorrelationID(ctx, "turn_"+u.ID)

	resp, err := emailAgent.RunText(ctx, prompt).Collect()
	if err != nil {
		return "", err
	}
	return resp.String(), nil
}

func must[T any](v T, err error) T {
	if err != nil {
		panic(err)
	}
	return v
}
