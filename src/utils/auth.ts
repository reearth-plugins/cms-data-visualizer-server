export type AuthenticatedRequest = {
  headers: Record<string, string | string[] | undefined> & {
    authorization?: string;
  };
  method?: string;
  body?: unknown;
  query?: Record<string, string | string[] | undefined>;
};

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
