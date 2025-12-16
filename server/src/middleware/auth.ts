import type { Request, Response, NextFunction } from 'express';

const ALLOWED_ORIGIN = 'chrome-extension://lfoegjnbfagbmgjejbhdioboalmdfmok';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const apiKey = req.headers['x-api-key'];
  const validKey = process.env.MIMIR_CLIENT_KEY;

  const origin = req.headers.origin;
  if (origin && origin !== ALLOWED_ORIGIN) {
    console.warn(`[Auth] Blocked request from unauthorized origin: ${origin}`);
    res.status(403).json({ error: 'Forbidden Origin' });
    return;
  }

  if (!validKey) {
    console.error('[Auth] MIMIR_CLIENT_KEY not configured');
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  if (!apiKey || apiKey !== validKey) {
    console.warn(`[Auth] Invalid API key attempt from ${req.ip}`);
    res.status(401).json({ error: 'Invalid API key' });
    return;
  }

  next();
}
