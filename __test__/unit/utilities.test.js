const { validateEmail } = require('../../utils/validation');

describe('validateEmail', () => {
    it('returns true for valid email', () => {
        expect(validateEmail('test@example.com')).toBe(true);
    });

    it('returns false for invalid email', () => {
        expect(validateEmail('invalid-email')).toBe(false);
        expect(validateEmail('invalid-email@')).toBe(false);
        expect(validateEmail('invalid-email@domain')).toBe(false);
        expect(validateEmail('invalid-email@domain.')).toBe(false);
        expect(validateEmail('invalid-email@domain.c')).toBe(false);
    });
});
