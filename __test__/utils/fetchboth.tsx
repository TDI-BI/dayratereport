import {fetchBoth} from '@/utils/fetchboth'; // Adjust path as needed

// Mock fetch globally
global.fetch = jest.fn();

describe('fetchBoth utility function', () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

    beforeEach(() => {
        jest.clearAllMocks();

        // Set up environment variables
        process.env.NEXT_PUBLIC_TYPE = 'https://';
        process.env.NEXT_PUBLIC_URL = 'example.com';
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('Successful primary fetch', () => {
        test('returns response when primary fetch succeeds', async () => {
            const mockResponse = new Response('success', {status: 200});
            mockFetch.mockResolvedValueOnce(mockResponse);

            const result = await fetchBoth('/api/test');

            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/test');
            expect(result).toBe(mockResponse);
        });

        test('constructs URL correctly with environment variables', async () => {
            const mockResponse = new Response('success', {status: 200});
            mockFetch.mockResolvedValueOnce(mockResponse);

            await fetchBoth('/api/users');

            expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/users');
        });

        test('handles different endpoint paths', async () => {
            const mockResponse = new Response('success', {status: 200});
            mockFetch.mockResolvedValueOnce(mockResponse);

            await fetchBoth('/api/admingetdays?prev=0&tot=1');

            expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/admingetdays?prev=0&tot=1');
        });
    });

    describe('Fallback to www subdomain', () => {
        test('tries www subdomain when primary fetch fails', async () => {
            const primaryError = new Error('Network error');
            const fallbackResponse = new Response('fallback success', {status: 200});

            mockFetch
                .mockRejectedValueOnce(primaryError)
                .mockResolvedValueOnce(fallbackResponse);

            const result = await fetchBoth('/api/test');

            expect(mockFetch).toHaveBeenCalledTimes(2);
            expect(mockFetch).toHaveBeenNthCalledWith(1, 'https://example.com/api/test');
            expect(mockFetch).toHaveBeenNthCalledWith(2, 'https://www.example.com/api/test');
            expect(result).toBe(fallbackResponse);
        });

        test('constructs www URL correctly', async () => {
            mockFetch
                .mockRejectedValueOnce(new Error('Primary failed'))
                .mockResolvedValueOnce(new Response('success', {status: 200}));

            await fetchBoth('/api/users');

            expect(mockFetch).toHaveBeenNthCalledWith(2, 'https://www.example.com/api/users');
        });

        test('handles different types of primary fetch errors', async () => {
            const fallbackResponse = new Response('fallback success', {status: 200});

            // Test with TypeError (common for network issues)
            mockFetch
                .mockRejectedValueOnce(new TypeError('Failed to fetch'))
                .mockResolvedValueOnce(fallbackResponse);

            const result = await fetchBoth('/api/test');

            expect(result).toBe(fallbackResponse);
            expect(mockFetch).toHaveBeenCalledTimes(2);
        });
    });

    describe('Both fetches fail', () => {
        test('throws error when both primary and fallback fail', async () => {
            const primaryError = new Error('Primary failed');
            const fallbackError = new Error('Fallback failed');

            mockFetch
                .mockRejectedValueOnce(primaryError)
                .mockRejectedValueOnce(fallbackError);

            await expect(fetchBoth('/api/test')).rejects.toThrow('Fallback failed');

            expect(mockFetch).toHaveBeenCalledTimes(2);
            expect(mockFetch).toHaveBeenNthCalledWith(1, 'https://example.com/api/test');
            expect(mockFetch).toHaveBeenNthCalledWith(2, 'https://www.example.com/api/test');
        });
    });

    describe('Environment variable handling', () => {
        test('handles different protocol types', async () => {
            process.env.NEXT_PUBLIC_TYPE = 'http://';
            process.env.NEXT_PUBLIC_URL = 'localhost:3000';

            const mockResponse = new Response('success', {status: 200});
            mockFetch.mockResolvedValueOnce(mockResponse);

            await fetchBoth('/api/test');

            expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/test');
        });

        test('handles URLs with ports', async () => {
            process.env.NEXT_PUBLIC_TYPE = 'https://';
            process.env.NEXT_PUBLIC_URL = 'api.example.com:8080';

            const mockResponse = new Response('success', {status: 200});
            mockFetch
                .mockRejectedValueOnce(new Error('Primary failed'))
                .mockResolvedValueOnce(mockResponse);

            await fetchBoth('/api/test');

            expect(mockFetch).toHaveBeenNthCalledWith(1, 'https://api.example.com:8080/api/test');
            expect(mockFetch).toHaveBeenNthCalledWith(2, 'https://www.api.example.com:8080/api/test');
        });

        test('handles empty or undefined environment variables', async () => {
            process.env.NEXT_PUBLIC_TYPE = '';
            process.env.NEXT_PUBLIC_URL = '';

            const mockResponse = new Response('success', {status: 200});
            mockFetch.mockResolvedValueOnce(mockResponse);

            await fetchBoth('/api/test');

            expect(mockFetch).toHaveBeenCalledWith('/api/test');
        });
    });

    describe('Edge cases', () => {
        test('handles empty endpoint string', async () => {
            const mockResponse = new Response('success', {status: 200});
            mockFetch.mockResolvedValueOnce(mockResponse);

            await fetchBoth('');

            expect(mockFetch).toHaveBeenCalledWith('https://example.com');
        });

        test('handles endpoint without leading slash', async () => {
            const mockResponse = new Response('success', {status: 200});
            mockFetch.mockResolvedValueOnce(mockResponse);

            await fetchBoth('api/test');

            expect(mockFetch).toHaveBeenCalledWith('https://example.comapi/test');
        });

        test('preserves query parameters in fallback', async () => {
            const fallbackResponse = new Response('success', {status: 200});
            mockFetch
                .mockRejectedValueOnce(new Error('Primary failed'))
                .mockResolvedValueOnce(fallbackResponse);

            await fetchBoth('/api/test?param1=value1&param2=value2');

            expect(mockFetch).toHaveBeenNthCalledWith(1, 'https://example.com/api/test?param1=value1&param2=value2');
            expect(mockFetch).toHaveBeenNthCalledWith(2, 'https://www.example.com/api/test?param1=value1&param2=value2');
        });
    });
});