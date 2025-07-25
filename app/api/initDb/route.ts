import {NextRequest, NextResponse} from "next/server";
import {connectToDb} from "@/utils/connectToDb";

export const GET = async (request: NextRequest) => {
    if (process.env.NODE_ENV !== "development") return new Response(
        JSON.stringify({error: 'cannot run this script outside of dev env'}),
        {status: 500}
    );

    const connection = await connectToDb();

    const errors: any[] = []

    //queries to create our tables
    // language=SQL format=false
    const queries = [
        `CREATE TABLE IF NOT EXISTS days (uid varchar(255), day varchar(255),ship varchar(255),username varchar(255),type varchar(255));`,
        `CREATE TABLE IF NOT EXISTS logs (email varchar(255),date varchar(255),request text,type varchar(255));`,
        `CREATE TABLE IF NOT EXISTS msgs (msg varchar(255));`,
        `CREATE TABLE IF NOT EXISTS periodstarts (id int,date varchar(255));`,
        `CREATE TABLE IF NOT EXISTS users (username varchar(255),password varchar(255),uid varchar(255),email varchar(255),isAdmin varchar(255),lastConfirm varchar(255),isDomestic tinyint(1));`,
        `CREATE TABLE IF NOT EXISTS emails (id int NOT NULL AUTO_INCREMENT, body MEDIUMTEXT, sentTo varchar(255), status text, PRIMARY KEY (id), subject VARCHAR(255), date VARCHAR(255));`
    ];

    console.log(queries);

    try {
        queries.map(async (query: string) => {
            try {
                const [results] = await connection.execute(query);
                console.log(results);
                errors.push({success: query});
            } catch (e) {
                errors.push(e);
            }
        });
        connection.end();
        if (errors.length) return new Response(
            JSON.stringify(errors),
        );
        return new Response(
            JSON.stringify(errors),
            {status: 200}
        );
    } catch (e) {
        connection.end();
        return new Response(
            JSON.stringify({error: e}),
            {status: 500}
        );
    }

}