//debugging tool for testing db connection, just returns a list hello worlds

import {NextRequest} from "next/server";
import {connectToDb} from "@/utils/connectToDb";
import {dispatchEmail} from "@/utils/dispatchEmail";

export const GET = async (request: NextRequest) => {
    //url params
    const {searchParams} = request.nextUrl;
    const msg = searchParams.get("msg") || "hello world";
    console.log(process.env.NODE_ENV)
    if (process.env.NODE_ENV !== "development") {
        return new Response(
            JSON.stringify({error: 'you do not have access to this api route'}),
            {status: 500}
        );
    }

    //connect to databse
    const connection = await connectToDb();
    connection.end();
    try {
        const blech = await dispatchEmail(
            'Test dispatch',
            'Text',
            msg,
            ['parkerseeley@tdi-bi.com']
        )
        return new Response(
            JSON.stringify({success: blech}),
            {status: 200}
        );

    } catch (error) {
        return new Response(
            JSON.stringify({error: (error as Error).message}),
            {status: 500}
        );
    }
};
