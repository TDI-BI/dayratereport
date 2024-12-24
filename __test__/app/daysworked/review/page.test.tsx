import Page from "@/app/daysworked/review/page";
import {
    render,
    screen,
    act,
    waitFor,
    fireEvent,
    getByRole,
} from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";

// Mock the useRouter hook to prevent actual navigation during tests
jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn(),
}));

describe("Home componnent", () => {

    beforeEach(() => {
        (useSearchParams as jest.Mock).mockReturnValue({
            get: jest.fn().mockImplementation((key: string) => {
                if (key === "prev") return "0"; // doesnt really matter
                return null;
            }),
        });
    });

    const dummyperinf = {
        resp: [
            {
                uid: "test/user",
                day: "2024-12-16",
                ship: "EMMA",
                username: "bleh",
                type: "MARINE",
            },
            {
                uid: "test/user",
                day: "2024-12-17",
                ship: "",
                username: "bleh",
                type: "",
            },
            {
                uid: "test/user",
                day: "2024-12-18",
                ship: "BMCC",
                username: "bleh",
                type: "MARINE",
            },
            {
                uid: "test/user",
                day: "2024-12-19",
                ship: "",
                username: "bleh",
                type: "",
            },
            {
                uid: "test/user",
                day: "2024-12-20",
                ship: "",
                username: "bleh",
                type: "",
            },
            {
                uid: "test/user",
                day: "2024-12-21",
                ship: "",
                username: "bleh",
                type: "",
            },
            {
                uid: "test/user",
                day: "2024-12-22",
                ship: "",
                username: "bleh",
                type: "",
            },
            { uid: "", day: "-1", ship: "1", username: "bleh", type: "" },
        ],
    };
    const dummyverdate = {
        resp: [
            "2024-12-16",
            "2024-12-17",
            "2024-12-18",
            "2024-12-19",
            "2024-12-20",
            "2024-12-21",
            "2024-12-22",
        ],
    };

    it("renders", async () => {

        global.fetch = jest
            .fn()
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyperinf),
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyverdate),
            })
        
        await act(async () => {
            render(<Page />);
        });

        await waitFor(()=>{
            expect(screen.getByText('EMMA')).toBeInTheDocument();
        });

        //header
        expect(screen.getByText('PERIOD REPORT FOR: test user')).toBeInTheDocument();

        //dates
        expect(screen.getByText('2024-12-16')).toBeInTheDocument();
        expect(screen.getByText('2024-12-17')).toBeInTheDocument();
        expect(screen.getByText('2024-12-18')).toBeInTheDocument();
        expect(screen.getByText('2024-12-19')).toBeInTheDocument();
        expect(screen.getByText('2024-12-20')).toBeInTheDocument();
        expect(screen.getByText('2024-12-21')).toBeInTheDocument();
        expect(screen.getByText('2024-12-22')).toBeInTheDocument();

        //footer
        expect(screen.getByText('crew type: domestic')).toBeInTheDocument();
        expect(screen.getByText('TOTAL DAYS: 2')).toBeInTheDocument();

        //confirm
        expect(screen.getByText(': I acknowledge and certify that the information on this document is true and accurate')).toBeInTheDocument();

        //buttons
        expect(screen.getByText('back'));
        expect(screen.getByText('confirm and submit'));
    });

    it("has a working back button", async () => {

        const push = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ push });

        global.fetch = jest
            .fn()
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyperinf),
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyverdate),
            })
        
        await act(async () => {
            render(<Page />);
        });

        await waitFor(()=>{
            expect(screen.getByText('EMMA')).toBeInTheDocument();
        });

        const button = screen.getByText('back');
        fireEvent.click(button);

        await waitFor(() => { 
            expect(push).toHaveBeenCalledWith("../");
        });
    
    });

    it("lets me confirm and submit", async () => {

        const push = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ push });

        global.fetch = jest
            .fn()
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyperinf),
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyverdate),
            })
        
        await act(async () => {
            render(<Page />);
        });

        await waitFor(()=>{
            expect(screen.getByText('EMMA')).toBeInTheDocument();
        });

        //verify our report is correct
        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox)

        const button = screen.getByText('confirm and submit');
        fireEvent.click(button);

        await waitFor(() => { 
            expect(push).toHaveBeenCalledWith("review/thanks");
        });
    
    });

    it("blocks if i dont check the box", async () => {

        const push = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ push });

        global.fetch = jest
            .fn()
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyperinf),
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyverdate),
            })
        
        await act(async () => {
            render(<Page />);
        });

        await waitFor(()=>{
            expect(screen.getByText('EMMA')).toBeInTheDocument();
        });

        const button = screen.getByText('confirm and submit');
        fireEvent.click(button);

        await waitFor(() => { 
            expect(push).not.toHaveBeenCalledWith("review/thanks");
        });
    
    });

    it("will tell you its not this weeks report", async () => {

        (useSearchParams as jest.Mock).mockReturnValue({
            get: jest.fn().mockImplementation((key: string) => {
                if (key === "prev") return "1"; // doesnt really matter
                return null;
            }),
        });

        const push = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ push });

        global.fetch = jest
            .fn()
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyperinf),
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyverdate),
            })
        
        await act(async () => {
            render(<Page />);
        });

        await waitFor(()=>{ // wait on payload delivery
            expect(screen.getByText('EMMA')).toBeInTheDocument();
        });

        expect(screen.getByText("NOT THIS WEEK'S REPORT")).toBeInTheDocument();

    });

    it("blocks page access if our input is empty", async () => {

        const bad = {error: 'you shuoldnt be here'}

        const push = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ push });

        global.fetch = jest
            .fn()
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(bad),
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyverdate),
            })
        
        await act(async () => {
            render(<Page />);
        });

        await waitFor(() => { 
            expect(push).toHaveBeenCalledWith("../../");
        });

    });
    

    it("displays foreign correctly", async () => {

        const dummyperinf = {
            resp: [
                {
                    uid: "test/user",
                    day: "2024-12-16",
                    ship: "EMMA",
                    username: "bleh",
                    type: "MARINE",
                },
                {
                    uid: "test/user",
                    day: "2024-12-17",
                    ship: "",
                    username: "bleh",
                    type: "",
                },
                {
                    uid: "test/user",
                    day: "2024-12-18",
                    ship: "BMCC",
                    username: "bleh",
                    type: "MARINE",
                },
                {
                    uid: "test/user",
                    day: "2024-12-19",
                    ship: "",
                    username: "bleh",
                    type: "",
                },
                {
                    uid: "test/user",
                    day: "2024-12-20",
                    ship: "",
                    username: "bleh",
                    type: "",
                },
                {
                    uid: "test/user",
                    day: "2024-12-21",
                    ship: "",
                    username: "bleh",
                    type: "",
                },
                {
                    uid: "test/user",
                    day: "2024-12-22",
                    ship: "",
                    username: "bleh",
                    type: "",
                },
                { uid: "", day: "-1", ship: "0", username: "bleh", type: "" },
            ],
        };

        const push = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ push });

        global.fetch = jest
            .fn()
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyperinf),
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyverdate),
            })
        
        await act(async () => {
            render(<Page />);
        });

        await waitFor(()=>{
            expect(screen.getByText('EMMA')).toBeInTheDocument();
        })

        //just check sure our flag works
        expect(screen.getByText('crew type: foreign')).toBeInTheDocument();

    });
});
