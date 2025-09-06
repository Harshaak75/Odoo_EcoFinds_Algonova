// src/types/express/index.d.ts

declare namespace Express {
  export interface Request {
    user?: {
      user_id: string;
      role: string;
    };
  }
}

// Ensures the file is treated as a module.
export {};