import { ReactElement } from 'react';
interface lineprops {
  name: string;
  type: string;
  placeholder: string;
  icon: ReactElement<any>;
}

export const FormLine = (ins: lineprops) => {
  return (
    <h1 className="flex justify-center gap-[10px] group bg-secondary/0 hover:bg-secondary/100 text-secondary hover:text-tdi-blue transition-all ease-in-out duration-300 rounded-lg py-[10px] px-[10px]">
      {ins.icon}
      <div>
        <input
          className="text-inherit bg-inherit focus:outline-none peer"
          name={ins.name}
          type={ins.type}
          placeholder={ins.placeholder}
        />
        <div
          className={`rounded-md w-[0%] peer-focus:w-[100%] group-hover:w-[100%] h-[3px] bg-secondary group-hover:bg-tdi-blue transition-all ease-in-out duration-300 delay-100`}
        />
      </div>
    </h1>
  );
};
