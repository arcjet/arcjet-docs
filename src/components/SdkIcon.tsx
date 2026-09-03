import { Astro as AstroIcon } from "@/components/icons/tech/Astro";
import { Bun } from "@/components/icons/tech/Bun";
import { ClaudeAgentSdk } from "@/components/icons/tech/ClaudeAgentSdk";
import { CloudflareThink } from "@/components/icons/tech/CloudflareThink";
import { CrewAi } from "@/components/icons/tech/CrewAi";
import { Deno } from "@/components/icons/tech/Deno";
import { Express } from "@/components/icons/tech/Express";
import { FastApi } from "@/components/icons/tech/FastApi";
import { Fastify } from "@/components/icons/tech/Fastify";
import { Flask } from "@/components/icons/tech/Flask";
import { Genkit } from "@/components/icons/tech/Genkit";
import { GoogleAdk } from "@/components/icons/tech/GoogleAdk";
import { Hono } from "@/components/icons/tech/Hono";
import { LangChain } from "@/components/icons/tech/LangChain";
import { LangGraph } from "@/components/icons/tech/LangGraph";
import { Mastra } from "@/components/icons/tech/Mastra";
import { NestJs } from "@/components/icons/tech/NestJs";
import { NextJs } from "@/components/icons/tech/NextJs";
import { NodeJs } from "@/components/icons/tech/NodeJs";
import { Nuxt } from "@/components/icons/tech/Nuxt";
import { OpenAiAgents } from "@/components/icons/tech/OpenAiAgents";
import { Python } from "@/components/icons/tech/Python";
import { ReactRouter } from "@/components/icons/tech/ReactRouter";
import { Remix } from "@/components/icons/tech/Remix";
import { StrandsAgents } from "@/components/icons/tech/StrandsAgents";
import { SvelteKit } from "@/components/icons/tech/SvelteKit";
import { TanStackAi } from "@/components/icons/tech/TanStackAi";
import { VercelAi } from "@/components/icons/tech/VercelAi";
import { VercelEve } from "@/components/icons/tech/VercelEve";
import type { ArcjetRouteSdkKey, ArcjetSdkVariantKey } from "@/lib/sdk";
import type { ComponentType, HTMLProps } from "react";

type IconComponent = ComponentType<HTMLProps<SVGSVGElement>>;

const sdkIcons: Record<ArcjetRouteSdkKey, IconComponent> = {
  astro: AstroIcon,
  bun: Bun,
  "claude-agent-sdk": ClaudeAgentSdk,
  "claude-managed-agents": ClaudeAgentSdk,
  "cloudflare-think": CloudflareThink,
  crewai: CrewAi,
  deno: Deno,
  fastify: Fastify,
  genkit: Genkit,
  "google-adk": GoogleAdk,
  "google-adk-py": GoogleAdk,
  langchain: LangChain,
  langgraph: LangGraph,
  mastra: Mastra,
  nest: NestJs,
  next: NextJs,
  node: NodeJs,
  nuxt: Nuxt,
  "openai-agents": OpenAiAgents,
  python: Python,
  "react-router": ReactRouter,
  remix: Remix,
  "strands-agents": StrandsAgents,
  sveltekit: SvelteKit,
  "tanstack-ai": TanStackAi,
  "vercel-ai": VercelAi,
  "vercel-eve": VercelEve,
};

const variantIcons: Record<ArcjetSdkVariantKey, IconComponent> = {
  express: Express,
  fastapi: FastApi,
  flask: Flask,
  hono: Hono,
};

export type SdkIconProps = {
  sdk: ArcjetRouteSdkKey;
  variant?: ArcjetSdkVariantKey;
  className?: string;
};

/**
 * Icon for an SDK switcher row.
 *
 * Variant pairings (FastAPI, Flask, Express, Hono) use the framework mark so
 * every option has a distinct icon. The parent SDK icon is the fallback.
 */
export function SdkIcon({ sdk, variant, className }: SdkIconProps) {
  const Icon = (variant && variantIcons[variant]) || sdkIcons[sdk] || Python;
  return <Icon className={className} aria-hidden="true" />;
}
