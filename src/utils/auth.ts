import { VercelRequest } from "@vercel/node";

export type AuthenticatedRequest = {
  // No user info needed for static key auth
} & VercelRequest;

export function authenticate(req: AuthenticatedRequest): boolean {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return false;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return false;
    }

    const apiSecretKey = process.env.API_SECRET_KEY;

    // Simple comparison with static API key
    return token === apiSecretKey;
  } catch (error) {
    console.error("Authentication error:", error);
    return false;
  }
}
