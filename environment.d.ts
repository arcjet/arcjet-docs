declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly ARCJET_KEY: string;
    }
  }
}

export {};
