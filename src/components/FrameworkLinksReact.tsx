import Button from "@/components/Button";
import { Astro as IconAstro } from "@/components/icons/tech/Astro";
import { Bun as IconBun } from "@/components/icons/tech/Bun";
import { ClaudeAgentSdk as IconClaudeAgentSdk } from "@/components/icons/tech/ClaudeAgentSdk";
import { CrewAi as IconCrewAi } from "@/components/icons/tech/CrewAi";
import { Deno as IconDeno } from "@/components/icons/tech/Deno";
import { FastApi as IconFastApi } from "@/components/icons/tech/FastApi";
import { Fastify as IconFastify } from "@/components/icons/tech/Fastify";
import { Flask as IconFlask } from "@/components/icons/tech/Flask";
import { Genkit as IconGenkit } from "@/components/icons/tech/Genkit";
import { GitHub as IconGitHub } from "@/components/icons/tech/GitHub";
import { GoogleAdk as IconGoogleAdk } from "@/components/icons/tech/GoogleAdk";
import { LangChain as IconLangChain } from "@/components/icons/tech/LangChain";
import { LangGraph as IconLangGraph } from "@/components/icons/tech/LangGraph";
import { Mastra as IconMastra } from "@/components/icons/tech/Mastra";
import { NestJs as IconNestJs } from "@/components/icons/tech/NestJs";
import { NextJs as IconNextJs } from "@/components/icons/tech/NextJs";
import { NodeJs as IconNodeJs } from "@/components/icons/tech/NodeJs";
import { Nuxt as IconNuxt } from "@/components/icons/tech/Nuxt";
import { OpenAiAgents as IconOpenAiAgents } from "@/components/icons/tech/OpenAiAgents";
import { ReactRouter as IconReactRouter } from "@/components/icons/tech/ReactRouter";
import { Remix as IconRemix } from "@/components/icons/tech/Remix";
import { StrandsAgents as IconStrandsAgents } from "@/components/icons/tech/StrandsAgents";
import { SvelteKit as IconSvelteKit } from "@/components/icons/tech/SvelteKit";
import { TanStackAi as IconTanStackAi } from "@/components/icons/tech/TanStackAi";
import { VercelAi as IconVercelAi } from "@/components/icons/tech/VercelAi";
import { VercelEve as IconVercelEve } from "@/components/icons/tech/VercelEve";
import { frameworks, getStoredFramework, type FrameworkKey } from "@/lib/prefs";
import { GUARD_SDK_KEYS, hrefForLegacyFrameworkKey } from "@/lib/sdk";
import { queryParamFramework } from "@/store";
import { useStore } from "@nanostores/react";
import type { ForwardedRef, PropsWithChildren, ReactNode } from "react";
import { forwardRef, useEffect, useState } from "react";

import styles from "./FrameworkLinks.module.scss";

interface FrameworkLinksProps extends PropsWithChildren {
  title?: string;
  exclude?: FrameworkKey[];
  path?: string;
  alwaysShow?: boolean;
  grouped?: boolean;
}

/**
 * Coding agents Arcjet onboards through the hooks they already fire. They
 * are not frameworks in `prefs`: nothing on these pages switches by them, so
 * each is a plain link to its own guide.
 */
const codingAgents = [
  {
    key: "claude-code",
    label: "Claude Code",
    href: "/coding-agents/claude-code",
    icon: <IconClaudeAgentSdk />,
  },
  {
    key: "github-copilot",
    label: "GitHub Copilot",
    href: "/coding-agents/copilot",
    icon: <IconGitHub />,
  },
] as const;

const guardSdkKeys: ReadonlySet<string> = new Set(GUARD_SDK_KEYS);

function iconFor(key: FrameworkKey): ReactNode {
  switch (key) {
    case "astro":
      return <IconAstro />;
    case "bun":
    case "bun-hono":
      return <IconBun />;
    case "deno":
      return <IconDeno />;
    case "fastify":
      return <IconFastify />;
    case "genkit":
      return <IconGenkit />;
    case "nest-js":
      return <IconNestJs />;
    case "next-js":
      return <IconNextJs />;
    case "node-js":
    case "node-js-express":
    case "node-js-hono":
      return <IconNodeJs />;
    case "nuxt":
      return <IconNuxt />;
    case "python-fastapi":
      return <IconFastApi />;
    case "python-flask":
      return <IconFlask />;
    case "react-router":
      return <IconReactRouter />;
    case "remix":
      return <IconRemix />;
    case "strands-agents":
      return <IconStrandsAgents />;
    case "google-adk":
      return <IconGoogleAdk />;
    case "sveltekit":
      return <IconSvelteKit />;
    case "tanstack-ai":
      return <IconTanStackAi />;
    case "claude-agent-sdk":
    case "claude-managed-agents":
      return <IconClaudeAgentSdk />;
    case "crewai":
      return <IconCrewAi />;
    case "langchain":
      return <IconLangChain />;
    case "langgraph":
      return <IconLangGraph />;
    case "mastra":
      return <IconMastra />;
    case "openai-agents":
      return <IconOpenAiAgents />;
    case "vercel-ai":
      return <IconVercelAi />;
    case "vercel-eve":
      return <IconVercelEve />;
    default:
      return "";
  }
}

/**
 * Framework Links
 *
 * Renders a list of buttons that switch to a specific framework.
 *
 * @param title - The block title.
 * @param exclude - A list of framework to exclude from display.
 * @param path - An optional path to link to, defaults to the same page.
 * @param alwaysShow - Show the links even if a framework is selected or stored, defaults to false.
 * @param grouped - Split the links into coding agents, AI agent frameworks, and native SDKs, defaults to false.
 */
const FrameworkLinks = forwardRef(
  (
    {
      title = "Choose a framework",
      exclude,
      path = "",
      alwaysShow,
      grouped,
      ...props
    }: FrameworkLinksProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const [hide, setHide] = useState(true);

    const $queryParamFramework = useStore(queryParamFramework);

    const [basePath, setBasePath] = useState(path);

    useEffect(() => {
      if (!path) {
        setBasePath(window.location.pathname);
      }
    }, [path]);

    useEffect(() => {
      // Check if a framework is set in query params
      const params = new URLSearchParams(window.location.search);
      let f = params.get("f");

      // Else check for a stored framework selection
      if (!f) {
        const storedFramework = getStoredFramework();
        if (storedFramework) f = storedFramework;
      }

      // Hide if a framework is selected
      if (f && !alwaysShow) setHide(true);
      else setHide(false);
    }, [$queryParamFramework, alwaysShow]);

    let cls = "FrameworkLinks " + styles.FrameworkLinks;

    const visible = frameworks.filter((f) => !exclude?.includes(f.key));

    const renderFrameworks = (list: typeof visible) =>
      list.map((f, idx) => (
        <Button
          key={f.key + idx}
          as="link"
          size="lg"
          href={hrefForLegacyFrameworkKey(f.key, basePath || path || "/")}
          decoratorLeft={iconFor(f.key)}
        >
          {f.label}
        </Button>
      ));

    if (grouped) {
      const agentFrameworks = visible.filter((f) => guardSdkKeys.has(f.key));
      const nativeSdks = visible.filter((f) => !guardSdkKeys.has(f.key));

      return (
        !hide && (
          <div ref={ref} className={cls} {...props}>
            <h2 id="choose-a-framework">{title}</h2>
            <div className={styles.Group}>
              <h3 id="coding-agents">Coding agents</h3>
              <p>Enforce security policies on developer coding agents.</p>
              <div className={styles.Links}>
                {codingAgents.map((agent) => (
                  <Button
                    key={agent.key}
                    as="link"
                    size="lg"
                    href={agent.href}
                    decoratorLeft={agent.icon}
                  >
                    {agent.label}
                  </Button>
                ))}
              </div>
            </div>
            {agentFrameworks.length > 0 && (
              <div className={styles.Group}>
                <h3 id="ai-agent-frameworks">AI agent frameworks</h3>
                <p>
                  Protect custom-built agents with direct framework
                  integrations.
                </p>
                <div className={styles.Links}>
                  {renderFrameworks(agentFrameworks)}
                </div>
              </div>
            )}
            {nativeSdks.length > 0 && (
              <div className={styles.Group}>
                <h3 id="native-sdks">Native SDKs</h3>
                <p>
                  Create custom integrations and protect your application code.
                </p>
                <div className={styles.Links}>
                  {renderFrameworks(nativeSdks)}
                </div>
              </div>
            )}
          </div>
        )
      );
    }

    return (
      !hide && (
        <div ref={ref} className={cls} {...props}>
          <h2 id="choose-a-framework">{title}</h2>
          <div className={styles.Links}>{renderFrameworks(visible)}</div>
        </div>
      )
    );
  },
);
FrameworkLinks.displayName = "FrameworkLinks";

export default FrameworkLinks;
