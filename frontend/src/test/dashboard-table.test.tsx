import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCompaniesAction, selectCompanyAction } from '@/lib/actions/company.actions'
import { toast } from 'sonner'
import { Role } from '@/types'
import { CompaniesTable } from '@/components/dashboard/companies-table'

jest.mock('@/lib/actions/company.actions', () => ({
    getCompaniesAction: jest.fn(),
    selectCompanyAction: jest.fn(),
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

const mockCompaniesData = {
    success: true,
    data: {
        data: [
            {
                id: '1',
                name: 'Empresa 1',
                logo: null,
                role: Role.OWNER,
                joinedAt: '2024-01-01T00:00:00.000Z',
            },
            {
                id: '2',
                name: 'Empresa 2',
                logo: null,
                role: Role.ADMIN,
                joinedAt: '2024-01-02T00:00:00.000Z',
            },
            {
                id: '3',
                name: 'Empresa 3',
                logo: null,
                role: Role.MEMBER,
                joinedAt: '2024-01-03T00:00:00.000Z',
            },
        ],
        meta: {
            total: 3,
            page: 1,
            limit: 10,
            totalPages: 1,
        },
    },
}

describe('CompaniesTable', () => {
    const mockPush = jest.fn()
    const mockGetCompaniesAction = getCompaniesAction as jest.MockedFunction<typeof getCompaniesAction>
    const mockSelectCompanyAction = selectCompanyAction as jest.MockedFunction<typeof selectCompanyAction>
    const mockToast = toast as jest.Mocked<typeof toast>

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useRouter as jest.Mock).mockReturnValue({ push: mockPush })
            ; (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams())
        mockGetCompaniesAction.mockResolvedValue(mockCompaniesData)
    })

    it('should render companies table with data', async () => {
        await act(async () => {
            render(<CompaniesTable />);
        });

        await waitFor(() => {
            expect(screen.getByText('Empresa 1')).toBeInTheDocument()
            expect(screen.getByText('Empresa 2')).toBeInTheDocument()
            expect(screen.getByText('Empresa 3')).toBeInTheDocument()
        })

        expect(screen.getByText('Proprietário')).toBeInTheDocument()
        expect(screen.getByText('Administrador')).toBeInTheDocument()
        expect(screen.getByText('Membro')).toBeInTheDocument()
    })

    it('should display loading skeleton initially', async () => {
        await act(async () => {
            render(<CompaniesTable />);
        });

        expect(screen.getByText('Minhas Empresas')).toBeInTheDocument()
    })

    it('should show empty state when no companies', async () => {
        mockGetCompaniesAction.mockResolvedValue({
            success: true,
            data: {
                data: [],
                meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
            },
        })

        await act(async () => {
            render(<CompaniesTable />);
        });

        await waitFor(() => {
            expect(screen.getByText(/você ainda não faz parte de nenhuma empresa/i)).toBeInTheDocument()
        })
    })

    it('should handle company selection', async () => {
        mockSelectCompanyAction.mockResolvedValue({ success: true })

        await act(async () => {
            render(<CompaniesTable />);
        });

        const user = userEvent.setup()

        await waitFor(() => {
            expect(screen.getByText('Empresa 1')).toBeInTheDocument()
        })

        const viewButton = screen.getAllByText(/visualizar/i)[0]
        await user.click(viewButton)

        await waitFor(() => {
            expect(mockSelectCompanyAction).toHaveBeenCalledWith('1')
            expect(mockToast.success).toHaveBeenCalledWith('Empresa selecionada com sucesso!')
            expect(mockPush).toHaveBeenCalledWith('/company/1')
        })
    })

    it('should handle selection error', async () => {
        mockSelectCompanyAction.mockResolvedValue({
            success: false,
            message: 'Erro ao selecionar empresa',
        })

        await act(async () => {
            render(<CompaniesTable />);
        });

        const user = userEvent.setup()

        await waitFor(() => {
            expect(screen.getByText('Empresa 1')).toBeInTheDocument()
        })

        const viewButton = screen.getAllByText(/visualizar/i)[0]
        await user.click(viewButton)

        await waitFor(() => {
            expect(mockToast.error).toHaveBeenCalledWith('Erro ao selecionar empresa')
            expect(mockPush).not.toHaveBeenCalled()
        })
    })

    it('should handle pagination', async () => {
        const mockPaginatedData = {
            ...mockCompaniesData,
            data: {
                ...mockCompaniesData.data,
                meta: {
                    total: 25,
                    page: 1,
                    limit: 10,
                    totalPages: 3,
                },
            },
        }

        mockGetCompaniesAction.mockResolvedValue(mockPaginatedData)

        await act(async () => {
            render(<CompaniesTable />);
        });

        const user = userEvent.setup()

        await waitFor(() => {
            expect(screen.getByText('Página 1 de 3')).toBeInTheDocument()
        })

        const nextButton = screen.getByTitle('Próxima página')
        await user.click(nextButton)

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('?page=2', { scroll: false });
        });
    })

    it('should disable pagination buttons appropriately', async () => {
        const mockPaginatedData = {
            ...mockCompaniesData,
            data: {
                ...mockCompaniesData.data,
                meta: {
                    total: 25,
                    page: 3,
                    limit: 10,
                    totalPages: 3,
                },
            },
        }

        mockGetCompaniesAction.mockResolvedValue(mockPaginatedData)
            ; (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('page=3'))

        await act(async () => {
            render(<CompaniesTable />);
        });

        await waitFor(() => {
            expect(screen.getByText('Página 3 de 3')).toBeInTheDocument()
        })

        const nextButton = screen.getByTitle('Próxima página')
        const lastButton = screen.getByTitle('Última página')

        expect(nextButton).toBeDisabled()
        expect(lastButton).toBeDisabled()
    })

    it('should refresh data when company is created', async () => {
        await act(async () => {
            render(<CompaniesTable />);
        });

        await waitFor(() => {
            expect(mockGetCompaniesAction).toHaveBeenCalledWith(1, 10)
        })

        await act(async () => {
            window.dispatchEvent(new CustomEvent('companyCreated'));
        });

        await waitFor(() => {
            expect(mockGetCompaniesAction).toHaveBeenCalledTimes(2)
        })
    })

    it('should show correct item count information', async () => {
        await act(async () => {
            render(<CompaniesTable />);
        });

        await waitFor(() => {
            expect(screen.getByText(/3\s+empresas\s+encontrada\(s\)/i)).toBeInTheDocument();
        });
    })

    it('should handle API error gracefully', async () => {
        mockGetCompaniesAction.mockResolvedValue({
            success: false,
            message: 'Erro ao carregar empresas',
            data: {
                data: [],
                meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
            },
        })

        await act(async () => {
            render(<CompaniesTable />);
        });

        await waitFor(() => {
            expect(mockToast.error).toHaveBeenCalledWith('Erro ao carregar empresas')
        })
    })
})