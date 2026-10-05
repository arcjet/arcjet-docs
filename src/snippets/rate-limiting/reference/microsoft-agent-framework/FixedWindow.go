package main

import (
	"time"

	"github.com/arcjet/arcjet-go"
)

var lookupLimit = must(arcjet.GuardFixedWindow(arcjet.GuardFixedWindowOptions{
	Mode:        arcjet.ModeLive,
	Window:      time.Minute,
	MaxRequests: 100,
	Bucket:      "lookups",
}))

func must[T any](v T, err error) T {
	if err != nil {
		panic(err)
	}
	return v
}
