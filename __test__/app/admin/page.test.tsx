import {
    render,
    screen,
    act,
    waitFor,
    fireEvent,
} from "@testing-library/react";
import Admin from "@/app/admin/page"; // Adjust the import path as per your project structure
import { useRouter } from "next/navigation";

// Mock the useRouter hook to prevent actual navigation during tests
jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn(),
}));


describe("Home componnent", () => {

    const dummyGQ = {}

    const dummyUsr = {}

    beforeEach(() => {
        global.fetch = jest
            .fn()
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyGQ),
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyUsr),
            })
    });


});
