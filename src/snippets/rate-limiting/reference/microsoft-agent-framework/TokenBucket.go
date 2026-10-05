package main

import (
	"time"

	"github.com/arcjet/arcjet-go"
)

var lookupLimit = must(arcjet.GuardTokenBucket(arcjet.GuardTokenBucketOptions{
	Mode:       arcjet.ModeLive,
	RefillRate: 5,
	Interval:   10 * time.Second,
	Capacity:   10,
	Bucket:     "lookups",
}))

func must[T any](v T, err error) T {
	if err != nil {
		panic(err)
	}
	return v
}
