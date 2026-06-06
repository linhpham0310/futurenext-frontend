import { describe, it, expect } from 'vitest';
import { updateProfileSchema } from '@/lib/schemas/user.schema';

describe('updateProfileSchema', () => {
  const validTimestamp = '2024-01-15T10:30:00.000Z';

  it('accepts valid profile update with all fields', () => {
    const result = updateProfileSchema.safeParse({
      fullName: 'Nguyen Van B',
      avatarUrl: 'https://example.com/avatar.png',
      updatedAt: validTimestamp,
    });
    expect(result.success).toBe(true);
  });

  it('accepts update with only updatedAt (optional fields omitted)', () => {
    const result = updateProfileSchema.safeParse({
      updatedAt: validTimestamp,
    });
    expect(result.success).toBe(true);
  });

  it('accepts null avatarUrl (to clear avatar)', () => {
    const result = updateProfileSchema.safeParse({
      avatarUrl: null,
      updatedAt: validTimestamp,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing updatedAt', () => {
    const result = updateProfileSchema.safeParse({
      fullName: 'Test',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid updatedAt format', () => {
    const result = updateProfileSchema.safeParse({
      updatedAt: 'not-a-datetime',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty fullName', () => {
    const result = updateProfileSchema.safeParse({
      fullName: '',
      updatedAt: validTimestamp,
    });
    expect(result.success).toBe(false);
  });

  it('rejects fullName exceeding 100 chars', () => {
    const result = updateProfileSchema.safeParse({
      fullName: 'a'.repeat(101),
      updatedAt: validTimestamp,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid avatarUrl', () => {
    const result = updateProfileSchema.safeParse({
      avatarUrl: 'not-a-url',
      updatedAt: validTimestamp,
    });
    expect(result.success).toBe(false);
  });

  it('rejects avatarUrl exceeding 1024 chars', () => {
    const result = updateProfileSchema.safeParse({
      avatarUrl: 'https://example.com/' + 'a'.repeat(1010),
      updatedAt: validTimestamp,
    });
    expect(result.success).toBe(false);
  });

  it('trims fullName whitespace', () => {
    const result = updateProfileSchema.safeParse({
      fullName: '  Nguyen Van C  ',
      updatedAt: validTimestamp,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fullName).toBe('Nguyen Van C');
    }
  });
});
