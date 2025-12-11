import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`[RateLimit] Rate limit exceeded for ${req.ip}`);
    res
      .status(429)
      .json({ error: 'Too many requests, please try again later' });
  },
});
