import React, {useState, useRef, useEffect} from "react";
import {Loader2} from "lucide-react";

const DayCell = ({
                   ship,
                   day,
                   vessels,
                   onUpdate,
                 }: {
  ship: string;
  day: string;
  vessels: string[];
  onUpdate: (day: string, vessel: string) => Promise<void>;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cellRef = useRef<HTMLTableCellElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cellRef.current && !cellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = async (vessel: string) => {
    setIsOpen(false);
    setIsSubmitting(true);
    try {
      await onUpdate(day, vessel);
    } catch (err) {
      console.error(`Failed to update ${day}:`, err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <td ref={cellRef} className="px-1 py-2 text-center relative">
      {isSubmitting ? (
        <span className="inline-flex items-center justify-center text-tdi-blue text-xs px-2 py-1">
          <Loader2 size={12} className="animate-spin"/>
        </span>
      ) : ship ? (
        <span
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-semibold uppercase tracking-tight text-tdi-blue bg-tdi-blue/10 hover:bg-tdi-blue/25 transition-colors cursor-pointer px-2 py-1">
          {ship}
        </span>
      ) : (
        <span
          onClick={() => setIsOpen(!isOpen)}
          className="text-primary/15 hover:text-primary/40 hover:bg-tdi-blue/10 transition-colors cursor-pointer text-xs px-2 py-1">
          —
        </span>
      )}

      {isOpen && !isSubmitting && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-10 bg-white border border-gray-200 shadow-md min-w-[80px]">
          <div
            onClick={() => handleSelect('')}
            className="px-3 py-1.5 text-xs uppercase tracking-tight text-tdi-blue hover:bg-tdi-blue/10 cursor-pointer whitespace-nowrap">
            —
          </div>
          {vessels.map((vessel) => (
            <div
              key={vessel}
              onClick={() => handleSelect(vessel)}
              className="px-3 py-1.5 text-xs uppercase tracking-tight text-tdi-blue hover:bg-tdi-blue/10 cursor-pointer whitespace-nowrap">
              {vessel}
            </div>
          ))}
        </div>
      )}
    </td>
  );
}

export default DayCell;
