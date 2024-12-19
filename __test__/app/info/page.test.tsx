import {
    render,
    screen,
    act,
    waitFor,
    fireEvent,
} from "@testing-library/react";
import Profile from "@/app/info/page"; // Adjust the import path as per your project structure
import { redirect } from "next/navigation";

// Mock the useRouter hook to prevent actual navigation during tests
jest.mock("next/navigation", () => ({
    redirect: jest.fn(),
}));

describe("profile componnent", () => {
    beforeEach(() => {
        const dummy = { resp: "" };
        global.fetch = jest.fn().mockResolvedValueOnce({
            json: jest.fn().mockResolvedValue(dummy),
        }); // jobs
    });

    it("renders", async () => {
        const dummyinfo = {
            resp: {
                userId: "test/test",
                username: "test",
                userEmail: "test",
                isLoggedIn: true,
                isAdmin: false,
                isDomestic: false,
            },
        };

        global.fetch = jest.fn().mockResolvedValueOnce({
            json: jest.fn().mockResolvedValue(dummyinfo),
        }); // mocks resp

        await act(async () => {
            render(<Profile />);
        });
        await waitFor(() =>
            expect(screen.getByText("username: test")).toBeInTheDocument()
        ); // wait payload to arrive
        expect(screen.getByText("username: test")).toBeInTheDocument(); // make sure data properly populates
        expect(screen.getByText("email: test")).toBeInTheDocument();
        expect(screen.getByText("full name:test test")).toBeInTheDocument();
    });

    it("redirect when not log in ", async () => {
        const dummyinfo = {
            resp: {
                isLoggedIn: false,
            },
        };

        global.fetch = jest.fn().mockResolvedValueOnce({
            json: jest.fn().mockResolvedValue(dummyinfo),
        }); // mocks resp

        await act(async () => {
            render(<Profile />);
        });

        await waitFor(() => {
            expect(redirect).toHaveBeenCalledWith("../../../");
        });
    });

    it("redirect when no fetch input ", async () => {
        const dummyinfo = {
            resp: {},
        };

        global.fetch = jest.fn().mockResolvedValueOnce({
            json: jest.fn().mockResolvedValue(dummyinfo),
        }); // mocks resp

        await act(async () => {
            render(<Profile />);
        });

        await waitFor(() => {
            expect(redirect).toHaveBeenCalledWith("../../../");
        });
    });

    it("lets me swap foreign to domestic", async () => {
        const dummyinfo1 = {
            resp: {
                userId: "test/test",
                username: "test",
                userEmail: "test",
                isLoggedIn: true,
                isAdmin: false,
                isDomestic: false,
            },
        };
        const updater = {
            resp: {
                updateUser: [
                    {
                        fieldCount: 0,
                        affectedRows: 1,
                        insertId: 0,
                        info: "Rows matched: 1  Changed: 1  Warnings: 0",
                        serverStatus: 34,
                        warningStatus: 0,
                        changedRows: 1,
                    },
                    null,
                ],
                updateDay: [
                    {
                        fieldCount: 0,
                        affectedRows: 0,
                        insertId: 0,
                        info: "Rows matched: 0  Changed: 0  Warnings: 0",
                        serverStatus: 34,
                        warningStatus: 0,
                        changedRows: 0,
                    },
                    null,
                ],
                isDomestic: true,
            },
        };
        const dummyinfo2 = {
            resp: {
                userId: "test/test",
                username: "test",
                userEmail: "test",
                isLoggedIn: true,
                isAdmin: false,
                isDomestic: true,
            },
        };
        global.fetch = jest.fn()
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyinfo1),
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(updater),
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyinfo2),
            }); // mocks resp
    
        await act(async () => {
            render(<Profile />);
        });
    
        // Wait for the initial render and username to be present
        await waitFor(() =>
            expect(screen.getByText("username: test")).toBeInTheDocument()
        );
    
        const domesticButton = screen.getByText('domestic');
        const foreignButton = screen.getByText('foreign');
    
        // Check initial button states
        expect(domesticButton).not.toHaveClass('select');
        expect(foreignButton).toHaveClass('select');
    
        // Click domestic button and wait for state update
        await act(async () => {
            fireEvent.click(domesticButton);
        });
    
        // Wait for the button state to update
        await waitFor(() => {
            expect(domesticButton).toHaveClass('select');
            expect(foreignButton).not.toHaveClass('select');
        });
    });

});