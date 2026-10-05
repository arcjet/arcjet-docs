package main

import (
	"context"
	"fmt"
	"log"

	"github.com/arcjet/arcjet-go/redact"
)

func main() {
	ctx := context.Background()
	r, err := redact.New(ctx, redact.Options{
		Entities: []string{redact.EntityEmail},
	})
	if err != nil {
		log.Fatal(err)
	}
	defer r.Close(ctx)

	redacted, unredact, err := r.Redact(ctx, "My email address is test@example.com")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(redacted)
	// My email address is <Redacted email #0>

	fmt.Println(unredact("Your email address is <Redacted email #0>"))
	// Your email address is test@example.com
}
