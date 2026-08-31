import { Astro as IconAstro } from "@/components/icons/tech/Astro";
import { Bun as IconBun } from "@/components/icons/tech/Bun";
import { ClaudeAgentSdk as IconClaudeAgentSdk } from "@/components/icons/tech/ClaudeAgentSdk";
import { CrewAi as IconCrewAi } from "@/components/icons/tech/CrewAi";
import { Deno as IconDeno } from "@/components/icons/tech/Deno";
import { Express as IconExpress } from "@/components/icons/tech/Express";
import { FastApi as IconFastApi } from "@/components/icons/tech/FastApi";
import { Fastify as IconFastify } from "@/components/icons/tech/Fastify";
import { Flask as IconFlask } from "@/components/icons/tech/Flask";
import { Genkit as IconGenkit } from "@/components/icons/tech/Genkit";
import { Hono as IconHono } from "@/components/icons/tech/Hono";
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
import { VercelAi as IconVercelAi } from "@/components/icons/tech/VercelAi";
import { VercelEve as IconVercelEve } from "@/components/icons/tech/VercelEve";
import type { Props as SelectProps } from "@/components/Select";
import Select from "@/components/Select";
import type { Framework, FrameworkKey } from "@/lib/prefs";
import {
  defaultSelectedFramework,
  getClosestFrameworkMatch,
  getFrameworks,
  getStoredFramework,
  isValidFrameworkKey,
  storeFramework,
} from "@/lib/prefs";
import {
  docPathFromSdkPathname,
  hrefForLegacyFrameworkKey,
  sdkFromPathname,
} from "@/lib/sdk";
import {
  availableFrameworks,
  displayedFramework,
  queryParamFramework,
} from "@/store";
import { useStore } from "@nanostores/react";
import { forwardRef, useEffect, useState, type ForwardedRef } from "react";

const frameworkIcon = {
  astro: <IconAstro />,
  "bun-hono": <IconBun />,
  bun: <IconBun />,
  "claude-agent-sdk": <IconClaudeAgentSdk />,
  crewai: <IconCrewAi />,
  deno: <IconDeno />,
  express: <IconExpress />,
  fastify: <IconFastify />,
  genkit: <IconGenkit />,
  hono: <IconHono />,
  langchain: <IconLangChain />,
  "langchain-js": <IconLangChain />,
  langgraph: <IconLangGraph />,
  mastra: <IconMastra />,
  "nest-js": <IconNestJs />,
  "next-js": <IconNextJs />,
  "node-js-express": <IconNodeJs />,
  "node-js-hono": <IconNodeJs />,
  "node-js": <IconNodeJs />,
  nuxt: <IconNuxt />,
  "openai-agents": <IconOpenAiAgents />,
  "openai-agents-py": <IconOpenAiAgents />,
  "python-fastapi": <IconFastApi />,
  "python-flask": <IconFlask />,
  "react-router": <IconReactRouter />,
  remix: <IconRemix />,
  "strands-agents": <IconStrandsAgents />,
  sveltekit: <IconSvelteKit />,
  "vercel-ai": <IconVercelAi />,
  "vercel-eve": <IconVercelEve />,
};

interface Props extends React.HTMLAttributes<HTMLSelectElement> {
  frameworks?: FrameworkKey[];
  select?: SelectProps;
}

/**
 * Framework Switcher
 * Selects one of the available frameworks.
 * Composes the options from the provided `frameworks`.
 *
 * @param frameworks - The list of framework options to display.
 */
const FrameworkSwitcher = forwardRef(
  (
    { frameworks, select, ...props }: Props,
    ref: ForwardedRef<HTMLSelectElement>,
  ) => {
    let cls = "FrameworkSwitcher";
    if (props.className) cls += " " + props.className;

    const [options, setOptions] = useState(
      frameworks ? getFrameworks(frameworks) : undefined,
    );

    const $availableFrameworks = useStore(availableFrameworks);
    const $displayedFramework = useStore(displayedFramework);
    const $queryParamFramework = useStore(queryParamFramework);

    // The selected framework option
    const [selected, setSelected] = useState<FrameworkKey>();

    // Select change callback
    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      if (!isValidFrameworkKey(val)) return;

      storeFramework(val);

      const currentPath = window.location.pathname;
      const docPath = sdkFromPathname(currentPath)
        ? docPathFromSdkPathname(currentPath)
        : currentPath;
      const target = hrefForLegacyFrameworkKey(val as FrameworkKey, docPath);
      window.location.replace(target);
    };

    // Sync store with current page frontmatter
    useEffect(() => {
      if (frameworks && frameworks.length > 0) {
        availableFrameworks.set(getFrameworks(frameworks));
      }
    }, [frameworks]);

    // Sync with query param for framework or local storage value if present
    useEffect(() => {
      let framework: FrameworkKey | undefined = undefined;

      // Get the framework to display from query params
      const params = new URLSearchParams(window.location.search);
      const f = params.get("f");

      if (f && f != $queryParamFramework && isValidFrameworkKey(f)) {
        framework = f as FrameworkKey;
        queryParamFramework.set(f as FrameworkKey);
        storeFramework(f);
      }

      // Or get it from storage, then the site default. Pages that omit
      // `next-js` still need a rematch so slots are not empty.
      if (!framework) {
        framework = getStoredFramework() ?? defaultSelectedFramework;
      }

      if ($availableFrameworks.length > 0) {
        // Not all stored frameworks may be in the list currently,
        // so we try to return the closest match
        const match = getClosestFrameworkMatch(
          framework,
          $availableFrameworks.map((f) => f.key),
        );

        displayedFramework.set(match);
      }
    }, [$availableFrameworks, $queryParamFramework]);

    // Handle change in the displayed framework
    // If the nano store for this has changed then we assume local storage
    // has also been updated and only change the displayed selection.
    useEffect(() => {
      setSelected($displayedFramework);
    }, [$displayedFramework]);

    // Handle change in the framework options
    useEffect(() => {
      setOptions($availableFrameworks);
    }, [$availableFrameworks]);

    // Loading handling
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (selected) setLoading(false);
    }, [selected]);

    return (
      !loading &&
      options && (
        <Select
          className={cls}
          ref={ref}
          onChange={onChange}
          value={selected}
          decoratorLeft={selected && frameworkIcon[selected]}
          {...props}
          {...select}
        >
          {options.map((framework: Framework, idx: number) => {
            return (
              <option key={`framework-option-${idx}`} value={framework.key}>
                {framework.label}
              </option>
            );
          })}
        </Select>
      )
    );
  },
);
FrameworkSwitcher.displayName = "FrameworkSwitcher";

export default FrameworkSwitcher;
