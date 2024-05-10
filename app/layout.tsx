import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import Navbar from '@/components/navbar'


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TDI travel logs",
  description: "get hr to write me a tag line later",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      
      <body className={inter.className}>


        
          <Navbar/>
          {/*we will put a header here*/}
        
        {children}


        {/*<div className='foot'>
          we will put a footer here
        </div>*/}
        
      </body>
    </html>
  );
}
