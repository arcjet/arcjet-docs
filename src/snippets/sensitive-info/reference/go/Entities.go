package main

import (
	"log"
	"os"

	"github.com/arcjet/arcjet-go"
	"github.com/arcjet/arcjet-go/sensitiveinfo/rampart"
)

var backend = must(rampart.New(rampart.Options{}))

var aj = must(arcjet.NewClient(arcjet.Config{
	Key: os.Getenv("ARCJET_KEY"),
	Rules: []arcjet.Rule{
		arcjet.SensitiveInfo(arcjet.SensitiveInfoOptions{
			Mode:    arcjet.ModeLive,
			Deny:    rampart.Entities(),
			Backend: backend,
		}),
	},
}))

func must[T any](v T, err error) T {
	if err != nil {
		log.Fatal(err)
	}
	return v
}
