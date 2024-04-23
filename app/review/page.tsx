import Link from "next/link";

export default function Page() {

    return (
        <main className="flex min-h-screen flex-col items-center">
            <p>COMFIRM INFORMATION</p>

            <div className='tblFoot'>
                <Link href='../'><div className='tblFootBtn'> confirm and submit </div></Link>
                <Link href='../'><div className='tblFootBtn'> back </div></Link>
            </div>
        </main>
    )
}