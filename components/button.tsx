import {ReactNode} from "react";

interface ButtonProps {
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  children: ReactNode;
  className?: string;
}

export const Button = ({
                         onClick,
                         type = 'button',
                         children,
                         className = '',
                       }: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-tdi-blue text-secondary px-6 py-3 font-semibold uppercase tracking-tight hover:bg-secondary/100 hover:text-primary transition-all duration-300 ease-in-out ${className} shadow relative group overflow-visible`}
    >
      {/* Top-left corner */}
      <span className="absolute top-0 left-0 h-[2px] w-0 bg-tdi-blue group-hover:w-4 transition-all duration-300 ease-in-out" />
      <span className="absolute top-0 left-0 w-[2px] h-0 bg-tdi-blue group-hover:h-4 transition-all duration-300 ease-in-out" />

      {/* Top-right corner */}
      <span className="absolute top-0 right-0 h-[2px] w-0 bg-tdi-blue group-hover:w-4 transition-all duration-300 ease-in-out" />
      <span className="absolute top-0 right-0 w-[2px] h-0 bg-tdi-blue group-hover:h-4 transition-all duration-300 ease-in-out" />


      <div className="relative">
        {children}
        <div
          className={` w-[0%] peer-focus:w-[100%] group-hover:w-[100%] h-[3px] bg-secondary group-hover:bg-tdi-blue transition-all ease-in-out duration-300 delay-100`}
        />
      </div>
    </button>
  );
};