import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DropDown from "@/components/reportDropDown";

describe("DropDown Component", () => {
    const mockSetter = jest.fn();
    const options = ["Option 1", "Option 2", "Option 3"];
    const val = "Option 2";
    const inid = "dropdown-id";

    it("renders the component correctly", () => {
        render(
            <DropDown
                val={val}
                inid={inid}
                options={options}
                setter={mockSetter}
            />
        );
        const selectElement = screen.getByRole("combobox");
        expect(selectElement).toBeInTheDocument();
        expect(selectElement).toHaveClass("hoverLn shipInput");
    });

    it("displays the correct options", () => {
        render(
            <DropDown
                val={val}
                inid={inid}
                options={options}
                setter={mockSetter}
            />
        );
        const optionElements = screen.getAllByRole("option");
        expect(optionElements.length).toBe(options.length + 1); // +1 for the default empty option
        expect(optionElements[1]).toHaveTextContent("Option 1");
        expect(optionElements[2]).toHaveTextContent("Option 2");
        expect(optionElements[3]).toHaveTextContent("Option 3");
    });

    it("sets the correct initial value", () => {
        render(
            <DropDown
                val={val}
                inid={inid}
                options={options}
                setter={mockSetter}
            />
        );
        const selectElement = screen.getByRole("combobox");
        expect(selectElement).toHaveValue(val);
    });

    it("handles onChange correctly", () => {
        let vessels = { day1: "BMCC" };
        const setVessels = jest.fn((newState) => {
          vessels = newState;
        });
      
        const mockSetter = jest.fn((e: any) => {
          const updatedVessels = JSON.parse(JSON.stringify(vessels)); // Deep clone
          updatedVessels["day1"] = e.target.value;
          setVessels(updatedVessels);
        });
      
        const { rerender } = render(
          <DropDown
            val={vessels["day1"]}
            inid="day1_ship"
            setter={mockSetter}
            options={["BMCC", "EMMA", "PROT", "GYRE", "NAUT", "3RD"]}
          />
        );
      
        const selectElement = screen.getByRole("combobox");
        expect(selectElement).toHaveValue("BMCC"); // Initial value
      
        fireEvent.change(selectElement, { target: { value: "EMMA" } });
      
        // Assert setter is called
        expect(mockSetter).toHaveBeenCalledTimes(1);
      
        // Check that the mockSetter updates vessels correctly
        expect(vessels["day1"]).toBe("EMMA");
        expect(setVessels).toHaveBeenCalledTimes(1);
      
        // Rerender with updated state
        rerender(
          <DropDown
            val={vessels["day1"]}
            inid="day1_ship"
            setter={mockSetter}
            options={["BMCC", "EMMA", "PROT", "GYRE", "NAUT", "3RD"]}
          />
        );
      
        // Ensure the DOM reflects the updated value
        expect(selectElement).toHaveValue("EMMA");
      });
      

});
