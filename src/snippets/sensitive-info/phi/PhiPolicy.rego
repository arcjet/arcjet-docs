package arcjet.guard

import rego.v1

# The identifier types that taxonomy version 2 adds for PHI.
phi_types := {
	"MEDICAL_RECORD_NUMBER",
	"HEALTH_PLAN_BENEFICIARY_NUMBER",
	"LICENSE_PLATE_NUMBER",
	"VEHICLE_IDENTIFICATION_NUMBER",
	"DEVICE_IDENTIFIER",
}

# Deny a note that carries a PHI identifier.
deny contains "phi-in-note" if {
	some entity in input.signals.sensitive_info.phi.entities
	entity in phi_types
}

# Deny a note that carries any listed identifier when it leaves your
# organization.
deny contains "identifiers-to-external" if {
	input.signals.sensitive_info.phi.detected
	input.values.external
}
