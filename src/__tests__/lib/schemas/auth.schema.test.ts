import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  verifyEmailSchema,
  loginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from '@/lib/schemas/auth.schema';

describe('registerSchema', () => {
  const validData = {
    fullName: 'Nguyen Van A',
    email: 'test@example.com',
    password: 'Password1',
    confirmPassword: 'Password1',
    consentAccepted: true,
    role: 'student' as const,
  };

  it('accepts valid registration data', () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('lowercases email via transform', () => {
    const result = registerSchema.safeParse({
      ...validData,
      email: 'Test@Example.COM',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('test@example.com');
    }
  });

  it('rejects email with leading/trailing spaces', () => {
    const result = registerSchema.safeParse({
      ...validData,
      email: '  test@example.com  ',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty fullName', () => {
    const result = registerSchema.safeParse({ ...validData, fullName: '' });
    expect(result.success).toBe(false);
  });

  it('rejects fullName exceeding 100 chars', () => {
    const result = registerSchema.safeParse({
      ...validData,
      fullName: 'a'.repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({ ...validData, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects password shorter than 8 chars', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'Pass1',
      confirmPassword: 'Pass1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without digits', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'PasswordOnly',
      confirmPassword: 'PasswordOnly',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without letters', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: '12345678',
      confirmPassword: '12345678',
    });
    expect(result.success).toBe(false);
  });

  it('rejects mismatched confirmPassword', () => {
    const result = registerSchema.safeParse({
      ...validData,
      confirmPassword: 'Different1',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('confirmPassword');
    }
  });

  it('rejects consentAccepted = false', () => {
    const result = registerSchema.safeParse({
      ...validData,
      consentAccepted: false,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid role', () => {
    const result = registerSchema.safeParse({
      ...validData,
      role: 'admin',
    });
    expect(result.success).toBe(false);
  });

  it('accepts teacher role', () => {
    const result = registerSchema.safeParse({
      ...validData,
      role: 'teacher',
    });
    expect(result.success).toBe(true);
  });
});

describe('verifyEmailSchema', () => {
  it('accepts 6-digit OTP', () => {
    const result = verifyEmailSchema.safeParse({ otp: '123456' });
    expect(result.success).toBe(true);
  });

  it('rejects OTP shorter than 6 digits', () => {
    const result = verifyEmailSchema.safeParse({ otp: '12345' });
    expect(result.success).toBe(false);
  });

  it('rejects OTP longer than 6 digits', () => {
    const result = verifyEmailSchema.safeParse({ otp: '1234567' });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('accepts valid login data', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'mypassword',
    });
    expect(result.success).toBe(true);
  });

  it('lowercases email via transform', () => {
    const result = loginSchema.safeParse({
      email: 'USER@Example.COM',
      password: 'mypassword',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('user@example.com');
    }
  });

  it('rejects email with surrounding spaces', () => {
    const result = loginSchema.safeParse({
      email: '  user@example.com  ',
      password: 'mypassword',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty email', () => {
    const result = loginSchema.safeParse({ email: '', password: 'mypassword' });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: '' });
    expect(result.success).toBe(false);
  });

  it('rejects password exceeding 100 chars', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'a'.repeat(101),
    });
    expect(result.success).toBe(false);
  });
});

describe('ForgotPasswordSchema', () => {
  it('accepts valid email', () => {
    const result = ForgotPasswordSchema.safeParse({ email: 'user@example.com' });
    expect(result.success).toBe(true);
  });

  it('rejects empty email', () => {
    const result = ForgotPasswordSchema.safeParse({ email: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = ForgotPasswordSchema.safeParse({ email: 'invalid' });
    expect(result.success).toBe(false);
  });
});

describe('ResetPasswordSchema', () => {
  const validData = {
    email: 'user@example.com',
    otp: '123456',
    password: 'Str0ng@Pass',
    confirmPassword: 'Str0ng@Pass',
  };

  it('accepts valid reset password data', () => {
    const result = ResetPasswordSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects password without uppercase', () => {
    const result = ResetPasswordSchema.safeParse({
      ...validData,
      password: 'str0ng@pass',
      confirmPassword: 'str0ng@pass',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without special character', () => {
    const result = ResetPasswordSchema.safeParse({
      ...validData,
      password: 'Str0ngPass',
      confirmPassword: 'Str0ngPass',
    });
    expect(result.success).toBe(false);
  });

  it('rejects mismatched confirmPassword', () => {
    const result = ResetPasswordSchema.safeParse({
      ...validData,
      confirmPassword: 'Different@1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects OTP not exactly 6 chars', () => {
    const result = ResetPasswordSchema.safeParse({
      ...validData,
      otp: '12345',
    });
    expect(result.success).toBe(false);
  });
});
