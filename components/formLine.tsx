import { ReactElement, } from "react";
interface lineprops {
    name: string;
    type: string;
    placeholder: string;
    icon: ReactElement;
}

export const FormLine = (ins: lineprops) => {
    return (
        <h1 className="flex justify-center gap-[10px] group bg-white/0 hover:bg-white/100 text-white hover:text-black transition-all ease-in-out duration-300 rounded-lg py-[10px] px-[10px]">
            {ins.icon}
            <div>
                <input
                    className="text-inherit bg-inherit focus:outline-none peer"
                    name={ins.name}
                    type={ins.type}
                    placeholder={ins.placeholder}
                />
                <div
                    className={`rounded-md w-[0%] peer-focus:w-[100%] group-hover:w-[100%] h-[3px] bg-white group-hover:bg-black transition-all ease-in-out duration-300 delay-100`}
                />
            </div>
        </h1>
    );
};