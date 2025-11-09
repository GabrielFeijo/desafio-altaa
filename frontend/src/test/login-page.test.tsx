import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { loginAction } from '@/lib/actions/auth.actions'
import { toast } from 'sonner'
import LoginPage from '@/app/(auth)/login/page'

jest.mock('@/lib/actions/auth.actions')
jest.mock('sonner')
jest.mock('next/navigation')

describe('LoginPage', () => {
    const mockPush = jest.fn()
    const mockLoginAction = loginAction as jest.MockedFunction<typeof loginAction>
    const mockToast = toast as jest.Mocked<typeof toast>

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    })

    it('should render login form correctly', () => {
        render(<LoginPage />)

        expect(screen.getByText('Bem-vindo de volta')).toBeInTheDocument()
        expect(screen.getByLabelText('Email')).toBeInTheDocument()
        expect(screen.getByLabelText('Senha')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
        expect(screen.getByText(/não tem uma conta\?/i)).toBeInTheDocument()
    })

    it('should validate email field', async () => {
        render(<LoginPage />)
        const user = userEvent.setup()

        const emailInput = screen.getByLabelText('Email')
        const submitButton = screen.getByRole('button', { name: /entrar/i })

        await user.type(emailInput, 'invalid-email')
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('Email inválido')).toBeInTheDocument()
        })
    })

    it('should validate password field', async () => {
        render(<LoginPage />)
        const user = userEvent.setup()

        const emailInput = screen.getByLabelText('Email')
        const passwordInput = screen.getByLabelText('Senha')
        const submitButton = screen.getByRole('button', { name: /entrar/i })

        await user.type(emailInput, 'test@example.com')
        await user.type(passwordInput, '123')
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText(/senha deve ter no mínimo 6 caracteres/i)).toBeInTheDocument()
        })
    })

    it('should toggle password visibility', async () => {
        render(<LoginPage />)
        const user = userEvent.setup()

        const passwordInput = screen.getByLabelText('Senha') as HTMLInputElement
        expect(passwordInput.type).toBe('password')

        const toggleButton = screen.getByRole('button', { name: '' })
        await user.click(toggleButton)

        expect(passwordInput.type).toBe('text')

        await user.click(toggleButton)
        expect(passwordInput.type).toBe('password')
    })

    it('should handle successful login', async () => {
        mockLoginAction.mockResolvedValue({
            success: true,
            message: 'Login realizado com sucesso!',
        })

        render(<LoginPage />)
        const user = userEvent.setup()

        const emailInput = screen.getByLabelText('Email')
        const passwordInput = screen.getByLabelText('Senha')
        const submitButton = screen.getByRole('button', { name: /entrar/i })

        await user.type(emailInput, 'test@example.com')
        await user.type(passwordInput, 'password123')
        await user.click(submitButton)

        await waitFor(() => {
            expect(mockLoginAction).toHaveBeenCalled()
            expect(mockToast.success).toHaveBeenCalledWith('Login realizado com sucesso!')
            expect(mockPush).toHaveBeenCalledWith('/dashboard')
        })
    })

    it('should handle login error', async () => {
        mockLoginAction.mockResolvedValue({
            success: false,
            message: 'Credenciais inválidas',
        })

        render(<LoginPage />)
        const user = userEvent.setup()

        const emailInput = screen.getByLabelText('Email')
        const passwordInput = screen.getByLabelText('Senha')
        const submitButton = screen.getByRole('button', { name: /entrar/i })

        await user.type(emailInput, 'test@example.com')
        await user.type(passwordInput, 'wrongpassword')
        await user.click(submitButton)

        await waitFor(() => {
            expect(mockToast.error).toHaveBeenCalledWith('Credenciais inválidas')
            expect(mockPush).not.toHaveBeenCalled()
        })
    })

    it('should disable form during submission', async () => {
        mockLoginAction.mockImplementation(
            () => new Promise(resolve => setTimeout(() => resolve({ success: true, message: '' }), 1000))
        )

        render(<LoginPage />)
        const user = userEvent.setup()

        const emailInput = screen.getByLabelText('Email')
        const passwordInput = screen.getByLabelText('Senha')
        const submitButton = screen.getByRole('button', { name: /entrar/i })

        await user.type(emailInput, 'test@example.com')
        await user.type(passwordInput, 'password123')
        await user.click(submitButton)

        await waitFor(() => {
            expect(submitButton).toBeDisabled()
            expect(emailInput).toBeDisabled()
            expect(passwordInput).toBeDisabled()
            expect(screen.getByText(/entrando\.\.\./i)).toBeInTheDocument()
        })
    })

    it('should navigate to signup page', () => {
        render(<LoginPage />)

        const signupLink = screen.getByText('Cadastre-se')
        expect(signupLink).toHaveAttribute('href', '/signup')
    })
})