import { createHook } from "@nosecone/sveltekit";
import { sequence } from "@sveltejs/kit/hooks";

export const handle = sequence(createHook());
