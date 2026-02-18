import {NextRequest} from "next/server";
import {getSession} from "@/actions";
import {connectToDb} from "@/utils/connectToDb";

export const GET = async (request: NextRequest) => {
    const session = await getSession();
    if (!session.isAdmin) return;
    const {searchParams} = request.nextUrl;
    const user = searchParams.get("uid") || "";
    const currCrew = searchParams.get("crew") === '1' || searchParams.get("crew") === 'true'; // inputs can vary sometimes

    const connection = await connectToDb();

    try {

        const query = `UPDATE users
                       SET isDomestic=?
                       WHERE uid = ?`;
        const extra: string[] = [(currCrew ? '0' : '1'), user];
        const [resp] = await connection.execute(query, extra);

        return new Response(JSON.stringify({resp: resp}), {
            status: 200,
        });
    } catch (err) {
        connection.end();
        return new Response(JSON.stringify({error: err}), {
            status: 500,
        });
    }


}