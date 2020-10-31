declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test'
      PORT: string
    }
  }
}

// This file has no import/export statements,
// then by adding an empty export statement convert it into a module
export {}