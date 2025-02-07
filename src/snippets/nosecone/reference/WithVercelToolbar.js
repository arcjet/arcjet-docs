import nosecone, { defaults, withVercelToolbar } from "nosecone";

const noseconeConfig = {
  ...defaults,
  // Any customizations needed
};

const headers = nosecone(
  process.env.VERCEL_ENV === "preview"
    ? withVercelToolbar(noseconeConfig)
    : noseconeConfig,
);
