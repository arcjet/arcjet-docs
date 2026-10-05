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

	redacted, _, err := r.Redact(ctx, "my email address is test@example.com")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(redacted)
	// my email address is <Redacted email #0>
}
