"use client";
import { recover } from "@/actions";
import { useFormState } from "react-dom";
import Link from "next/link";
import { useEffect } from "react";
import { flashDiv } from "@/utils/flashDiv";
import Image from "next/image";

//icons
import mail from "@/rsrsc/ionicons.designerpack/mail-open-outline.svg";

const RecoverForm = () => {
    const [state, formAction] = useFormState<any, FormData>(recover, undefined);

    useEffect(() => {
        if (state?.error) {
            flashDiv(document.getElementById("error") as HTMLElement);
        }
    });

    return (
        <div className="tblWrapper">
            <form action={formAction}>
                <h1 className="formLine">
                    <p className="formIcon">
                        <Image priority src={mail} alt="icon" />
                    </p>
                    <input
                        className="hoverLn hoverLnF formInput"
                        name="email"
                        type="text"
                        placeholder="email"
                    />
                </h1>

                <h1 className="formLine">
                    <button>
                        <p className="w-[140px] btnh btn hoverbg">
                            recover
                        </p>
                    </button>
                    <Link href="../login">
                        <p className="w-[140px] btnh btn hoverbg">
                            back
                        </p>
                    </Link>
                </h1>
                <h1 className="formLine">
                    <div className="errMessage" id="error">
                        {state?.error && <p>{state.error}</p>}
                    </div>
                </h1>
            </form>
        </div>
    );
};

export default RecoverForm;
