export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  feedback: string[];
}

export function evaluatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  if (password.length === 0) {
    return { score: 0, label: '', color: '', feedback: [] };
  }

  // Length checks
  if (password.length >= 8) score++;
  else feedback.push('At least 8 characters');

  if (password.length >= 12) score++;

  // Character variety
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  else feedback.push('Mix of uppercase and lowercase');

  if (/\d/.test(password)) score++;
  else feedback.push('At least one number');

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else feedback.push('At least one special character');

  // Cap at 4
  score = Math.min(score, 4);

  // Penalty for common patterns
  const commonPatterns = [
    /^123/, /password/i, /qwerty/i, /abc123/i,
    /111/, /000/, /letmein/i, /admin/i,
  ];
  if (commonPatterns.some((p) => p.test(password))) {
    score = Math.max(score - 2, 0);
    feedback.push('Avoid common patterns');
  }

  const labels = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
  const colors = [
    'var(--color-error)',
    'var(--color-warning)',
    '#c49a3c',
    'var(--color-success)',
    'var(--color-accent-sage)',
  ];

  return {
    score,
    label: labels[score],
    color: colors[score],
    feedback,
  };
}

export function isPasswordStrong(password: string): boolean {
  return evaluatePasswordStrength(password).score >= 3;
}
