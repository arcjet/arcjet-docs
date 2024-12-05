import nosecone, {
  NoseconeOptions,
  defaults,
  withVercelToolbar,
} from "nosecone";

const noseconeConfig: NoseconeOptions = {
  ...defaults,
  // Any customizations needed
};

const headers = nosecone(
  process.env.VERCEL_ENV === "preview"
    ? withVercelToolbar(noseconeConfig)
    : noseconeConfig,
);
