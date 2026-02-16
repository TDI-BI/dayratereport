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
      className={`rounded-lg transition-all ease-in-out duration-300 py-[10px] px-[20px] group bg-secondary/0 hover:bg-secondary/100 text-secondary hover:text-tdi-blue ${className}`}
    >
      <div className="relative">
        {children}
        <div
          className={`rounded-md w-[0%] peer-focus:w-[100%] group-hover:w-[100%] h-[3px] bg-secondary group-hover:bg-tdi-blue transition-all ease-in-out duration-300 delay-100`}
        />
      </div>
    </button>
  );
};
