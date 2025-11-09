import { formatDate, formatDateTime, translateRole, getInitials, cn } from "@/lib/utils"

describe('Utils', () => {
    describe('formatDate', () => {
        it('should format date correctly', () => {
            const date = new Date('2024-01-15T10:30:00.000Z')
            const formatted = formatDate(date)
            expect(formatted).toMatch(/15\/01\/2024/)
        })

        it('should handle string date input', () => {
            const formatted = formatDate('2024-01-15T10:30:00.000Z')
            expect(formatted).toMatch(/15\/01\/2024/)
        })
    })

    describe('formatDateTime', () => {
        it('should format datetime correctly', () => {
            const date = new Date('2024-01-15T10:30:00.000Z')
            const formatted = formatDateTime(date)
            expect(formatted).toMatch(/15\/01\/2024/)
            expect(formatted).toContain(':')
        })

        it('should handle string datetime input', () => {
            const formatted = formatDateTime('2024-01-15T10:30:00.000Z')
            expect(formatted).toMatch(/15\/01\/2024/)
        })
    })

    describe('translateRole', () => {
        it('should translate OWNER role', () => {
            expect(translateRole('OWNER')).toBe('Proprietário')
        })

        it('should translate ADMIN role', () => {
            expect(translateRole('ADMIN')).toBe('Administrador')
        })

        it('should translate MEMBER role', () => {
            expect(translateRole('MEMBER')).toBe('Membro')
        })

        it('should return original value for unknown role', () => {
            expect(translateRole('UNKNOWN')).toBe('UNKNOWN')
        })
    })

    describe('getInitials', () => {
        it('should get initials from full name', () => {
            expect(getInitials('John Doe')).toBe('JD')
        })

        it('should get initial from single name', () => {
            expect(getInitials('John')).toBe('J')
        })

        it('should handle multiple spaces', () => {
            expect(getInitials('John  Middle  Doe')).toBe('JD')
        })

        it('should handle leading/trailing spaces', () => {
            expect(getInitials('  John Doe  ')).toBe('JD')
        })

        it('should handle empty string', () => {
            expect(getInitials('')).toBe('')
        })

        it('should uppercase initials', () => {
            expect(getInitials('john doe')).toBe('JD')
        })
    })

    describe('cn (className merger)', () => {
        it('should merge class names', () => {
            const result = cn('class1', 'class2')
            expect(result).toContain('class1')
            expect(result).toContain('class2')
        })

        it('should handle conditional classes', () => {
            const result = cn('base', false && 'conditional', 'always')
            expect(result).toContain('base')
            expect(result).toContain('always')
            expect(result).not.toContain('conditional')
        })

        it('should handle undefined and null', () => {
            const result = cn('base', undefined, null, 'end')
            expect(result).toContain('base')
            expect(result).toContain('end')
        })

        it('should handle Tailwind conflicts', () => {
            const result = cn('px-2 py-1', 'px-4')
            expect(result).toContain('px-4')
            expect(result).toContain('py-1')
        })

        it('should handle empty input', () => {
            const result = cn()
            expect(result).toBe('')
        })

        it('should handle array of classes', () => {
            const result = cn(['class1', 'class2'], 'class3')
            expect(result).toContain('class1')
            expect(result).toContain('class2')
            expect(result).toContain('class3')
        })
    })
})