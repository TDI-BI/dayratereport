import { NextRequest } from "next/server"
import { getPeriod } from "@/utils/payperiod";
//this is an extremely simple API route lmfao
export const GET = async (request:  NextRequest) => {
    const { searchParams } = request.nextUrl;
    const periodEh = Number( searchParams.get('t') || '0' );
    
    return new Response(JSON.stringify({ resp: getPeriod(periodEh) }), {status: 200});
}