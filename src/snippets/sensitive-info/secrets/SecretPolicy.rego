package arcjet.guard

import rego.v1

# Deny a message that carries a credential, wherever it goes.
deny contains "secret-in-message" if {
	"SECRET" in input.signals.sensitive_info.secrets.entities
}

# Deny a message that carries any listed type when it leaves your
# organization.
deny contains "sensitive-info-to-external" if {
	input.signals.sensitive_info.secrets.detected
	input.values.external
}
