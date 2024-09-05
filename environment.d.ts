declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly [key: string]: string | undefined;
    }
  }
}

export {};
