import { Router } from 'express';
import { generateContext } from '../services/llm.js';
import { validateContextRequest } from '../middleware/validate.js';
import type {
  SelectionContext,
  ContextResponse,
  ErrorResponse,
} from '../types/index.js';

const router = Router();

router.post<{}, ContextResponse | ErrorResponse, SelectionContext>(
  '/',
  validateContextRequest,
  async (req, res) => {
    try {
      const context = await generateContext(req.body);
      res.json({ context });
    } catch (error) {
      console.error('[Context] Error generating context:', error);
      res.status(500).json({ error: 'Failed to generate context' });
    }
  }
);

export default router;
