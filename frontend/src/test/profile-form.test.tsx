import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { updateUserProfileAction } from '@/lib/actions/user.actions'
import { toast } from 'sonner'
import { User } from '@/types'
import { ProfileForm } from '@/components/forms/profile-form'

jest.mock('@/lib/actions/user.actions', () => ({
    updateUserProfileAction: jest.fn(),
}))

jest.mock('sonner')
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn(),
}))

jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}))

jest.mock('next/headers', () => ({
    cookies: jest.fn(() => ({
        delete: jest.fn(),
    })),
}))

const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    activeCompanyId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
}

describe('ProfileForm', () => {
    const mockRefresh = jest.fn()
    const mockUpdateUserProfileAction = updateUserProfileAction as jest.MockedFunction<
        typeof updateUserProfileAction
    >
    const mockToast = toast as jest.Mocked<typeof toast>

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useRouter as jest.Mock).mockReturnValue({ refresh: mockRefresh })
    })

    it('should render form with user data', () => {
        render(<ProfileForm user={mockUser} />)

        const nameInput = screen.getByLabelText('Nome completo') as HTMLInputElement
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement

        expect(nameInput.value).toBe(mockUser.name)
        expect(emailInput.value).toBe(mockUser.email)
    })

    it('should validate name field', async () => {
        render(<ProfileForm user={mockUser} />)
        const user = userEvent.setup()

        const nameInput = screen.getByLabelText('Nome completo')
        const submitButton = screen.getByRole('button', { name: /salvar alterações/i })

        await user.clear(nameInput)
        await user.type(nameInput, 'A')
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText(/nome deve ter no mínimo 2 caracteres/i)).toBeInTheDocument()
        })
    })

    it('should validate email field', async () => {
        render(<ProfileForm user={mockUser} />)
        const user = userEvent.setup()

        const emailInput = screen.getByLabelText('Email')
        const submitButton = screen.getByRole('button', { name: /salvar alterações/i })

        await user.clear(emailInput)
        await user.type(emailInput, 'invalid-email')
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('Email inválido')).toBeInTheDocument()
        })
    })

    it('should update profile successfully', async () => {
        mockUpdateUserProfileAction.mockResolvedValue({
            success: true,
            data: { ...mockUser, name: 'Updated Name' },
        })

        render(<ProfileForm user={mockUser} />)
        const user = userEvent.setup()

        const nameInput = screen.getByLabelText('Nome completo')
        await user.clear(nameInput)
        await user.type(nameInput, 'Updated Name')

        const submitButton = screen.getByRole('button', { name: /salvar alterações/i })
        await user.click(submitButton)

        await waitFor(() => {
            expect(mockUpdateUserProfileAction).toHaveBeenCalled()
            expect(mockToast.success).toHaveBeenCalledWith('Perfil atualizado com sucesso!')
            expect(mockRefresh).toHaveBeenCalled()
        })
    })

    it('should handle update error', async () => {
        mockUpdateUserProfileAction.mockResolvedValue({
            success: false,
            message: 'Email já está em uso',
        })

        render(<ProfileForm user={mockUser} />)
        const user = userEvent.setup()

        const emailInput = screen.getByLabelText('Email')
        await user.clear(emailInput)
        await user.type(emailInput, 'existing@example.com')

        const submitButton = screen.getByRole('button', { name: /salvar alterações/i })
        await user.click(submitButton)

        await waitFor(() => {
            expect(mockToast.error).toHaveBeenCalledWith('Email já está em uso')
            expect(mockRefresh).not.toHaveBeenCalled()
        })
    })

    it('should disable form during submission', async () => {
        mockUpdateUserProfileAction.mockImplementation(
            () => new Promise(resolve => setTimeout(() => resolve({ success: true, data: mockUser }), 1000))
        )

        render(<ProfileForm user={mockUser} />)
        const user = userEvent.setup()

        const nameInput = screen.getByLabelText('Nome completo')
        const emailInput = screen.getByLabelText('Email')
        const submitButton = screen.getByRole('button', { name: /salvar alterações/i })

        await user.clear(nameInput)
        await user.type(nameInput, 'New Name')
        await user.click(submitButton)

        await waitFor(() => {
            expect(submitButton).toBeDisabled()
            expect(nameInput).toBeDisabled()
            expect(emailInput).toBeDisabled()
            expect(screen.getByText(/salvando\.\.\./i)).toBeInTheDocument()
        })
    })
})