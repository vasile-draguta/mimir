import type { Request, Response, NextFunction } from 'express';
import type { SelectionContext } from '../types/index.js';

const MAX_SELECTED_LENGTH = 1000;

export function validateContextRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const body = req.body as SelectionContext;

  if (!body || typeof body !== 'object') {
    res.status(400).json({ error: 'Invalid request body' });
    return;
  }

  if (!body.selected || typeof body.selected !== 'string') {
    res.status(400).json({ error: 'Missing or invalid "selected" field' });
    return;
  }

  if (body.selected.length > MAX_SELECTED_LENGTH) {
    res.status(400).json({
      error: `Selected text exceeds maximum length of ${MAX_SELECTED_LENGTH} characters`,
    });
    return;
  }

  if (body.before !== undefined && typeof body.before !== 'string') {
    res.status(400).json({ error: 'Invalid "before" field' });
    return;
  }

  if (body.after !== undefined && typeof body.after !== 'string') {
    res.status(400).json({ error: 'Invalid "after" field' });
    return;
  }

  next();
}
