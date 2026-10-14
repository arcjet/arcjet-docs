package main

import (
	"log"
	"os"
	"regexp"

	"github.com/arcjet/arcjet-go"
	"github.com/arcjet/arcjet-go/sensitiveinfo/rampart"
)

var ibanPattern = regexp.MustCompile(`\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b`)

// detectIBAN is a recognizer: it receives the full text and returns the spans
// it matched. This one reports IBANs as bank account numbers.
func detectIBAN(value string) []rampart.DetectedSpan {
	var spans []rampart.DetectedSpan
	for _, m := range ibanPattern.FindAllStringIndex(value, -1) {
		spans = append(spans, rampart.DetectedSpan{
			Start: m[0],
			End:   m[1],
			Type:  arcjet.SensitiveInfoBankAccount,
		})
	}
	return spans
}

var backend = must(rampart.New(rampart.Options{
	// Keep the default recognizers and add your own.
	Recognizers: append(rampart.DefaultRecognizers, detectIBAN),
}))

var aj = must(arcjet.NewClient(arcjet.Config{
	Key: os.Getenv("ARCJET_KEY"),
	Rules: []arcjet.Rule{
		arcjet.SensitiveInfo(arcjet.SensitiveInfoOptions{
			Mode:    arcjet.ModeLive,
			Deny:    []arcjet.EntityType{arcjet.SensitiveInfoEmail, arcjet.SensitiveInfoBankAccount},
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
