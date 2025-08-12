import Admin from '@/app/admin/page'; // Adjust path as needed
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { getPeriod } from '@/utils/payperiod';
import { fetchBoth } from '@/utils/fetchboth';

// Mock dependencies
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

jest.mock('@/utils/payperiod', () => ({
    getPeriod: jest.fn(),
}));

jest.mock('@/utils/fetchboth', () => ({
    fetchBoth: jest.fn(),
}));

jest.mock('@/components/adminNav', () => ({
    AdminNav: () => <div data-testid="admin-nav">Admin Nav</div>,
}));

// Mock data
const mockUsers = [
    {
        username: 'john_doe',
        uid: 'Doe/John',
        email: 'john@example.com',
        isDomestic: true,
        lastConfirm: '2024-01-15',
    },
    {
        username: 'jane_smith',
        uid: 'Smith/Jane',
        email: 'jane@example.com',
        isDomestic: false,
        lastConfirm: '2024-01-14',
    },
];

const mockDays = [
    {
        username: 'john_doe',
        day: '2024-01-15',
        ship: 'BMCC',
        type: 'TECH',
    },
    {
        username: 'jane_smith',
        day: '2024-01-15',
        ship: 'EMMA',
        type: 'MARINE',
    },
];

const mockPeriod = [
    '2024-01-15',
    '2024-01-16',
    '2024-01-17',
    '2024-01-18',
    '2024-01-19',
    '2024-01-20',
    '2024-01-21',
];

describe('Admin Component', () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup router mock
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });

        // Setup period mock
        (getPeriod as jest.Mock).mockReturnValue(mockPeriod);

        // Setup fetch mocks
        (fetchBoth as jest.Mock).mockImplementation((url) => {
            if (url.includes('/api/admingetdays')) {
                return Promise.resolve({
                    json: () => Promise.resolve({ resp: mockDays }),
                });
            }
            if (url.includes('/api/getusers')) {
                return Promise.resolve({
                    json: () => Promise.resolve({ resp: mockUsers }),
                });
            }
            return Promise.reject(new Error('Unknown URL'));
        });
    });

    describe('Initial Render', () => {
        test('renders users', async () => {
            await act(async () => {
                render(<Admin />);
            });

            // Wait for data to load
            await waitFor(() => {
                // Check that both users are rendered
                expect(screen.getByText('Doe')).toBeInTheDocument();
                expect(screen.getByText('John')).toBeInTheDocument();
                expect(screen.getByText('Smith')).toBeInTheDocument();
                expect(screen.getByText('Jane')).toBeInTheDocument();
            });

            // Verify the user data is displayed correctly
            expect(screen.getByText('TECH')).toBeInTheDocument();
            expect(screen.getByText('MARINE')).toBeInTheDocument();

            // Verify API calls were made
            expect(fetchBoth).toHaveBeenCalledWith('/api/getusers');
            expect(fetchBoth).toHaveBeenCalledWith('/api/admingetdays?prev=0&tot=1');
        });
    });
});