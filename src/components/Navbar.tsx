"use client"; // əgər interaktiv elementlər varsa (menu toggle və s.)

import Link from "next/link";

export default function Navbar() {
  return (
   <nav>
    <div className="bg-[#161616] w-full fixed text-white p-5">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
        AION
        </Link>
        
        <div className="space-x-4">
          <Link href="/auth/login" className="text-white hover:text-gray-300">
            Login
          </Link>
          <Link href="/auth/register" className="text-white hover:text-gray-300">
            Register
          </Link>
        </div>
      </div>
    </div>
   </nav>
  );
}
