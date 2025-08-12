import {
    render,
    screen,
    act,
    waitFor,
    fireEvent,
} from "@testing-library/react";
import Home from "@/app/daysworked/page"; // Adjust the import path as per your project structure
import {useRouter} from "next/navigation";

// Create the mock before your tests
jest.mock("@/utils/flashDiv", () => ({
    flashDiv: jest.fn(),
}));

// Mock the useRouter hook to prevent actual navigation during tests
jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn(),
}));

describe("Home componnent", () => {
    // default payloads
    const dummyperinf = {resp: []};
    const dummydates = {
        resp: [
            "2024-12-16",
            "2024-12-17",
            "2024-12-18",
            "2024-12-19",
            "2024-12-20",
            "2024-12-21",
            "2024-12-22",
        ],
    }; // this is our curr week
    const justfirst = {
        resp: ["2024-12-16"],
    }; // this just checks our like current month
    const dummysesh = {
        resp: {
            userId: "thomas/hall",
            username: "test",
            userEmail: "test",
            isLoggedIn: true,
            isAdmin: false,
            isDomestic: true, // default user is domesticated :3
        },
    };

    beforeAll(() => {
        global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
    });


    it("renders", async () => {
        // just start with empys
        //mock our fetch order
        global.fetch = jest
            .fn()
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyperinf),
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummydates),
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(justfirst),
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummysesh), // defaults end here
            }); // mocks resp

        await act(async () => {
            render(<Home/>);
        });

        await waitFor(() =>
            expect(screen.getByText("Mon, 12-16")).toBeInTheDocument()
        ); // wait payload to arrive

        //make sure dates populatege
        expect(screen.getByText("Mon, 12-16")).toBeInTheDocument();
        expect(screen.getByText("Tue, 12-17")).toBeInTheDocument();
        expect(screen.getByText("Wed, 12-18")).toBeInTheDocument();
        expect(screen.getByText("Thu, 12-19")).toBeInTheDocument();
        expect(screen.getByText("Fri, 12-20")).toBeInTheDocument();
        expect(screen.getByText("Sat, 12-21")).toBeInTheDocument();
        expect(screen.getByText("Sun, 12-22")).toBeInTheDocument();
    });


    it("bound checks properly w/ domestic users", async () => {
        //domestic period inf
        const dummyDomPer = {
            resp: [
                "2024-12-16",
                "2024-12-17",
                "2024-12-18",
                "2024-12-19",
                "2024-12-20",
                "2024-12-21",
                "2024-12-22",
                "2024-12-23",
                "2024-12-24",
                "2024-12-25",
                "2024-12-26",
                "2024-12-27",
                "2024-12-28",
                "2024-12-29",
            ],
            day: "2024-12-17",
        };
        const dummyPrev1 = {
            resp: [
                "2024-12-09",
                "2024-12-10",
                "2024-12-11",
                "2024-12-12",
                "2024-12-13",
                "2024-12-14",
                "2024-12-15",
            ],
        };
        const dummyPrev2 = {
            resp: [
                "2024-12-23",
                "2024-12-24",
                "2024-12-25",
                "2024-12-26",
                "2024-12-27",
                "2024-12-28",
                "2024-12-29",
            ],
        };

        //mock our fetch order
        global.fetch = jest
            .fn()
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyperinf),
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummydates),
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(justfirst),
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummysesh), // defaults end here
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyPrev1), // prev=1
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyDomPer), // fullperiod
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyPrev2), // prev=-1
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyDomPer), // fullperiod
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyperinf), // remock stuff
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyPrev2),
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(justfirst),
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummysesh), // remock ends here
            });

        await act(async () => {
            render(<Home/>);
        });

        await waitFor(() =>
            expect(screen.getByText("Mon, 12-16")).toBeInTheDocument()
        ); // wait payload to arrive

        //snag buttons
        const backbtn = screen.getByText("last week");
        const forwbtn = screen.getByText("next week");
        await act(async () => {
            fireEvent.click(backbtn);
        });
        expect(screen.getByText("Mon, 12-16")).toBeInTheDocument(); // expecting we do not go back, date should be stagnant

        await act(async () => {
            fireEvent.click(forwbtn);
        });
        await waitFor(() =>
            expect(screen.getByText("Sat, 12-28")).toBeInTheDocument()
        ); // wait payload to arrive
        expect(screen.getByText("Sat, 12-28")).toBeInTheDocument(); // we should be going forward here
    });


    it("tries to save", async () => {
        const dummySaveRet = {
            resp: {
                fieldCount: 0,
                affectedRows: 8,
                insertId: 0,
                info: "Records: 8  Duplicates: 0  Warnings: 0",
                serverStatus: 2,
                warningStatus: 0,
                changedRows: 0,
            },
        };

        // Optional: log fetch calls for debugging

        // First 5 fetch calls for component initialization and save
        global.fetch = jest
            .fn()
            .mockResolvedValueOnce({json: jest.fn().mockResolvedValue(dummyperinf)})
            .mockResolvedValueOnce({json: jest.fn().mockResolvedValue(dummydates)})
            .mockResolvedValueOnce({json: jest.fn().mockResolvedValue(justfirst)})
            .mockResolvedValueOnce({json: jest.fn().mockResolvedValue(dummysesh)})
            .mockResolvedValueOnce({json: jest.fn().mockResolvedValue(dummySaveRet)})
            .mockResolvedValue({json: jest.fn().mockResolvedValue({})}); // fallback

        // render the component
        await act(async () => {
            render(<Home/>);
        });

        // wait for page to be ready
        await waitFor(() =>
            expect(screen.getByText("Mon, 12-16")).toBeInTheDocument()
        );
        screen.debug();


        const savebtn = screen.getByText("save");

        // click save
        await act(async () => {
            fireEvent.click(savebtn);
        });

        // check that the saving text appears
        await waitFor(() => {
            expect(screen.getByText("saving...")).toBeInTheDocument();
        });

        // check that the success message eventually appears
        await waitFor(() => {
            expect(screen.getByText("success!")).toBeInTheDocument();
        });

    });

    /*

    it("attempts to redirect on next click", async () => {
        const push = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({push});

        // Mock fetch responses
        global.fetch = jest
            .fn()
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyperinf),
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummydates),
            }) // Adjust dummydates as needed
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(justfirst),
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummysesh),
            });

        await act(async () => {
            render(<Home/>);
        });

        // Wait for data to be loaded
        await waitFor(() =>
            expect(screen.getByText("2024-12-16")).toBeInTheDocument()
        );

        await waitFor(() =>
            expect(screen.getByText("Mon, 12-16")).toBeInTheDocument()
        ); // wait payload to arrive

        const savebtn = screen.getByText("next");
        fireEvent.click(savebtn);


        // Find the dropdown and change its value to an empty string
        const dropdown2 = screen.getByTestId("2024-12-20_ship");
        expect(dropdown2).toHaveValue(""); // Verify initial value

        fireEvent.change(dropdown2, {target: {value: "BMCC"}});


        const nextbtn = screen.getByText("next");
        fireEvent.click(nextbtn);

        await waitFor(() => { // make sure we dont redirect :D
            expect(dropdown).toHaveValue("BMCC"); // if we dont redirect the page should re-render
        });
    });


    it("pushes to review on success", async () => {
        const push = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({push});

        const dummyforsesh = {
            resp: {
                userId: "foreign/user",
                username: "test",
                userEmail: "test",
                isLoggedIn: true,
                isAdmin: false,
                isDomestic: false,
            },
        };

        const dummySaveRet = {
            resp: {
                fieldCount: 0,
                affectedRows: 8,
                insertId: 0,
                info: "Records: 8  Duplicates: 0  Warnings: 0",
                serverStatus: 2,
                warningStatus: 0,
                changedRows: 0,
            },
        };
        // just start with empys
        //mock our fetch order
        global.fetch = jest
            .fn()
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyperinf),
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummydates),
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(justfirst),
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyforsesh), // defaults end here
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummySaveRet),
            }); // mocks save resp

        await act(async () => {
            render(<Home/>);
        });

        await waitFor(() =>
            expect(screen.getByText("2024-12-16")).toBeInTheDocument()
        ); // wait payload to arrive

        const nextbtn = screen.getByText("next");
        fireEvent.click(nextbtn);

        await waitFor(() => {
            expect(push).toHaveBeenCalledWith("/daysworked/review?prev=0");
        });
    });

    it("tests forward and back for foreign users", async () => {

        const dummydatesFotm = {
            resp: [
                "2024-11-25",
                "2024-11-26",
                "2024-11-27",
                "2024-11-28",
                "2024-11-29",
                "2024-11-30",
                "2024-12-1", // sunday
            ],
        }; // this is our curr week

        const dummyprev3 = {
            resp: [
                "2024-12-2",
                "2024-12-3",
                "2024-12-4",
                "2024-12-5",
                "2024-12-6",
                "2024-12-7",
                "2024-12-8", // sunday
            ],
        }

        const dummyprev4 = {
            resp: [
                "2024-11-18",
                "2024-11-19",
                "2024-11-20",
                "2024-11-21",
                "2024-11-22",
                "2024-11-23",
                "2024-11-24", // sunday
            ],
        }; // this is our curr week

        const dummyforsesh = {
            resp: {
                userId: "foreign/user",
                username: "test",
                userEmail: "test",
                isLoggedIn: true,
                isAdmin: false,
                isDomestic: false,
            },
        };


        // just start with empys
        //mock our fetch order
        global.fetch = jest
            .fn()
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyperinf),
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummydatesFotm),
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummydatesFotm),
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyforsesh), // defaults end here
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyprev3), // prev=1
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyprev4), // prev=-1
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyperinf), // remock stuff
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyprev4),
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummyprev4),
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummysesh), // remock ends here
            });
        ; // mocks resp

        await act(async () => {
            render(<Home/>);
        });

        await waitFor(() =>
            expect(screen.getByText("2024-11-25")).toBeInTheDocument()
        ); // wait payload to arrive

        //snag buttons
        const forwbtn = screen.getByText("forward a week >");
        await act(async () => {
            fireEvent.click(forwbtn);
        });
        expect(screen.getByText("2024-11-25")).toBeInTheDocument(); // expecting we do not go forwards, date should be stagnant

        const backbtn = screen.getByText("< back a week");
        await act(async () => {
            fireEvent.click(backbtn);
        });
        await waitFor(() => expect(screen.getByText("2024-11-18")).toBeInTheDocument())
        expect(screen.getByText("2024-11-22")).toBeInTheDocument()
    });

    it("pushes login on no resp", async () => {

        const push = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({push});

        const errPerInf = {error: 'bweh :p oopsy'}
        global.fetch = jest
            .fn()
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(errPerInf),
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummydates),
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(justfirst),
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummysesh), // defaults end here
            }); // mocks resp

        await act(async () => {
            render(<Home/>);
        });

        await waitFor(() => {
            expect(push).toHaveBeenCalledWith("../../");
        });
    });

    it("has a working workertype dropdown", async () => {

        const push = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({push});

        const errPerInf = {error: 'bweh :p oopsy'}
        global.fetch = jest
            .fn()
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(errPerInf),
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummydates),
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(justfirst),
            })
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(dummysesh), // defaults end here
            }); // mocks resp

        await act(async () => {
            render(<Home/>);
        });

        // Find the dropdown and change its value to an empty string
        const dropdown = screen.getByTestId("2024-12-16_job");
        expect(dropdown).toHaveValue(""); // Verify initial value

        fireEvent.change(dropdown, {target: {value: "TECH"}});

        expect(dropdown).toHaveValue("TECH");


    });
    */
});
