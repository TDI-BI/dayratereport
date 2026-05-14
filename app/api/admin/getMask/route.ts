import {NextRequest, NextResponse} from "next/server";
import {getMask} from "@/utils/getMask";

export const GET = async (request: NextRequest) => {
  const {searchParams} = request.nextUrl;
  const ind = Number(searchParams.get("ind") ?? 0);
  const amount = Number(searchParams.get("amount") ?? 0);
  const mode = searchParams.get("mode") === 'weeks';

  const mask = await getMask(ind, amount, mode)

  return NextResponse.json(
    {success: true, mask},
    {status: 200}
  );
}