import { z } from 'zod';

// Allowed profile categories
export const ALLOWED_CATEGORIES = ['corretor', 'investidor', 'proprietario', 'rede_varejo'] as const;

// Profile validation schema
export const profileSchema = z.object({
  name: z
    .string()
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[\p{L}\p{N}\s'-]*$/u, 'Nome contém caracteres inválidos')
    .optional()
    .nullable()
    .transform(val => val?.trim() || null),
  phone: z
    .string()
    .max(20, 'Telefone deve ter no máximo 20 caracteres')
    .regex(/^[\d\s()+-]*$/, 'Telefone deve conter apenas números e símbolos válidos')
    .optional()
    .nullable()
    .transform(val => val?.replace(/\s/g, '') || null),
  category: z
    .enum(ALLOWED_CATEGORIES, { errorMap: () => ({ message: 'Categoria inválida' }) })
    .optional()
    .nullable(),
});

// User creation schema (extends profile with email/password)
export const userCreationSchema = profileSchema.extend({
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres'),
  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(72, 'Senha deve ter no máximo 72 caracteres'),
});

// Signup schema (profile with required fields for registration)
export const signupSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres'),
  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(72, 'Senha deve ter no máximo 72 caracteres'),
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[\p{L}\p{N}\s'-]+$/u, 'Nome contém caracteres inválidos')
    .transform(val => val.trim()),
  phone: z
    .string()
    .min(10, 'Telefone deve ter pelo menos 10 dígitos')
    .max(20, 'Telefone deve ter no máximo 20 caracteres')
    .regex(/^[\d\s()+-]+$/, 'Telefone deve conter apenas números e símbolos válidos')
    .transform(val => val.replace(/\s/g, '')),
  category: z
    .enum(ALLOWED_CATEGORIES, { errorMap: () => ({ message: 'Categoria inválida' }) })
    .optional(),
});

// Validate and return result
export function validateProfile(data: unknown) {
  return profileSchema.safeParse(data);
}

export function validateUserCreation(data: unknown) {
  return userCreationSchema.safeParse(data);
}

export function validateSignup(data: unknown) {
  return signupSchema.safeParse(data);
}

// Helper to get first validation error message
export function getValidationError(result: z.SafeParseReturnType<unknown, unknown>): string {
  if (result.success) return '';
  const firstError = result.error.errors[0];
  return firstError?.message || 'Dados inválidos';
}
