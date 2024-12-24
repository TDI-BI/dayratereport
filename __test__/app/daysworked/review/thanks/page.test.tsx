import Thanks from "@/app/daysworked/review/thanks/page";
import {
    render,
    screen,
    act,
    waitFor,
    fireEvent,
    getByRole,
} from "@testing-library/react";
import { useRouter } from "next/navigation";

//this page is pretty static so mostly this is just a formality

// Mock the useRouter hook to prevent actual navigation during tests
jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}));

describe("Thanks componnent", () => {
    const dummysession = {
        resp: {
            userId: "test/user",
            username: "demo",
            userEmail: "test@user.com",
            isLoggedIn: true,
            isAdmin: true,
            isDomestic: false,
        },
    };

    it("renders properly", async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            json: jest.fn().mockResolvedValue(dummysession),
        });
        await act(async () => {
            render(<Thanks />);
        });

        await waitFor(() => {
            expect(screen.getByText("THANK YOU test user")).toBeInTheDocument();
        });
        //random line
        expect(
            screen.getByText(
                "you are only required to submit one report per pay period"
            )
        ).toBeInTheDocument();
    });

    it("has a workin redirect button", async () => {
        const push = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ push });

        global.fetch = jest.fn().mockResolvedValueOnce({
            json: jest.fn().mockResolvedValue(dummysession),
        });
        await act(async () => {
            render(<Thanks />);
        });

        await waitFor(() => {
            expect(screen.getByText("THANK YOU test user")).toBeInTheDocument();
        });
        //random line
        const homebtn = screen.getByText("home");
        fireEvent.click(homebtn);

        await waitFor(() => {
            expect(push).toHaveBeenCalledWith("../../../");
        });
    });

    it("redirects w. no login", async () => {
        const push = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ push });

        const baduser = { resp: { isLoggedIn: false } };

        global.fetch = jest.fn().mockResolvedValueOnce({
            json: jest.fn().mockResolvedValue(baduser),
        });
        await act(async () => {
            render(<Thanks />);
        });

        await waitFor(() => {
            expect(push).toHaveBeenCalledWith("/login");
        });
    });
});
