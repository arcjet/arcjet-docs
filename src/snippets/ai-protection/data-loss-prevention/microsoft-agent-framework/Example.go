package main

import (
	"context"

	"github.com/arcjet/arcjet-go"
	"github.com/arcjet/arcjet-go/agentframework"
	"github.com/microsoft/agent-framework-go/tool"
	"github.com/microsoft/agent-framework-go/tool/functool"
)

type noteArgs struct {
	OrderID string `json:"order_id"`
	Note    string `json:"note"`
}

func saveNote(_ context.Context, in noteArgs) (map[string]string, error) {
	return map[string]string{"order_id": in.OrderID, "note": in.Note}, nil
}

func guardedSaveNote(guard *arcjet.GuardClient) (tool.FuncTool, error) {
	detectPII := must(arcjet.GuardSensitiveInfo(arcjet.GuardSensitiveInfoOptions{
		Mode: arcjet.ModeLive,
		Deny: []arcjet.EntityType{
			arcjet.SensitiveInfoEmail,
			arcjet.SensitiveInfoPhoneNumber,
			arcjet.SensitiveInfoIPAddress,
			arcjet.SensitiveInfoCreditCardNumber,
		},
	}))
	fn := functool.MustNew(
		functool.Config{Name: "save_note", Description: "Save a free-text note on an order"},
		saveNote,
	)
	return agentframework.GuardTool(guard, fn, agentframework.ToolPolicy{
		Action: "note.saved",
		Rules: agentframework.Args(func(_ context.Context, in noteArgs) ([]arcjet.GuardRuleInput, error) {
			return []arcjet.GuardRuleInput{detectPII.Text(in.Note)}, nil
		}),
	})
}

func must[T any](v T, err error) T {
	if err != nil {
		panic(err)
	}
	return v
}
