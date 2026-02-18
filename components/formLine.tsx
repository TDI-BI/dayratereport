import {ReactElement} from 'react';

interface lineprops {
  name: string;
  type: string;
  placeholder: string;
  icon: ReactElement<any>;
}

export const FormLine = (ins: lineprops) => {
  return (
    <h1 className="flex items-center gap-3 px-4 py-3 text-secondary focus-within:bg-secondary focus-within:text-primary transition-all duration-300 ease-in-out">
      <div>{ins.icon}</div>
      <div className="w-full">
        <input
          className="peer bg-transparent outline-none w-full font-medium tracking-tight"
          name={ins.name}
          type={ins.type}
          placeholder={ins.placeholder}
        />
        <div className="h-[2px] w-full bg-secondary mt-2 peer-focus:bg-primary transition-colors duration-300 ease-in-out"/>
      </div>
    </h1>
  );
};
