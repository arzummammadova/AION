import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email vacibdir' })
    .email('Email düzgün deyil'),
  password: z
    .string({ required_error: 'Şifrə vacibdir' })
    .min(6, 'Şifrə minimum 6 simvol olmalıdır'),
});
export const forgotPasswordUserSchema=z.object({
  email:z.string({required_error:'Email vacibdir'})
})
export type LoginInput = z.infer<typeof loginSchema>;
export type forgotPasswordUserInput=z.infer<typeof forgotPasswordUserSchema>
