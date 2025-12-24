import { IUser } from "../models/User";

declare global {
  namespace Express {
    interface Request {
      user?: { 
        id: string;
        email?: string; 
      };
      subscription?: {
        isPremium: boolean;
        subscription: "free" | "premium";
      };
    }
  }
}
