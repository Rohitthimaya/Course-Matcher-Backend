const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email().endsWith('@mytru.ca'),
  password: z.string().min(6),
  name: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email().endsWith('@mytru.ca'),
  password: z.string(),
});

module.exports = { registerSchema, loginSchema };
