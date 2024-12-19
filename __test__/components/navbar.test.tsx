import { render, screen, act, } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from '@/components/navbar';
import { getSession } from '@/actions';

// Mock getSession with proper TypeScript typings
jest.mock('@/actions', () => ({
	getSession: jest.fn() as jest.Mock<Promise<{ isLoggedIn: boolean }>>,
}));

// Mock next/link with proper typings for children and href
jest.mock('next/link', () => {
	return ({ children, href }: { children: React.ReactNode; href: string }) => (
    	<a href={href} data-testid="link">
        	{children}
    	</a>
	);
});

describe('Navbar Component', () => {
	it('renders nothing', async () => {
    	(getSession as jest.Mock).mockResolvedValueOnce({ isLoggedIn: false });

    	render(await Navbar());

    	expect(screen.getByTestId('logout padding')).toBeInTheDocument();

	});

	it('renders the Navbar with logout and other links when the user is logged in', async () => {
    	(getSession as jest.Mock).mockResolvedValueOnce({ isLoggedIn: true });

    	render(await Navbar());

    	expect(screen.getByText('Days Worked')).toBeInTheDocument();
    	expect(screen.getByText('info')).toBeInTheDocument();
    	expect(screen.getByRole('button', { name: 'Days Worked' })).toBeInTheDocument();
    	expect(screen.getByRole('button', { name: 'info' })).toBeInTheDocument();
	});

	it('renders Days Worked and info links correctly when logged in', async () => {
    	(getSession as jest.Mock).mockResolvedValueOnce({ isLoggedIn: true });

    	render(await Navbar());

    	const daysWorkedLink = screen.getByRole('button', { name: 'Days Worked' }).closest('a');
    	const infoLink = screen.getByRole('button', { name: 'info' }).closest('a');

    	expect(daysWorkedLink).toHaveAttribute('href', '/daysworked');
    	expect(infoLink).toHaveAttribute('href', '/info');
	});
});


