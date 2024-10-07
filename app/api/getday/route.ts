//clients cannot be trusted to use get date because some of them have date and time settings set incorrectly
export const GET = async () => {
    try {
        return new Response(
            JSON.stringify({ resp: new Date().toISOString() }),
            { status: 200 }
        ); // throw date from server time
    } catch (e) {
        return new Response(
            JSON.stringify({ error: "how did you break javascript date ???" }),
            { status: 500 }
        );
    }
};
