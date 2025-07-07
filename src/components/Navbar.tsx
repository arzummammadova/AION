"use client";
import { CgProfile } from "react-icons/cg";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store/store";
import { fetchUser, logoutUser } from "@/redux/features/userSlice";
import { useEffect } from "react";

export default function Navbar() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.user)

  console.log(user);
  useEffect(() => {
    if (typeof window !== "undefined") {
      dispatch(fetchUser());
    }
  }, [dispatch]);

  return (
    <nav>
      <div className="bg-[#161616] w-full fixed text-white p-5">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            AION
          </Link>
          <div className="">
            <ul className="flex space-x-6">
              <li>
                <Link href="/" className="hover:text-gray-300">Home</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gray-300">About</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gray-300">Contact</Link>
              </li>
            </ul>
          </div>



          {user ? (
            <>
              <p>Xoş gəldin, {user.username}</p>
              <Link href="/profile">Profil</Link>
              <button onClick={() => dispatch((logoutUser()))}>LogOut</button>

            </>
          ) : (
            <div className="space-x-4 flex items-center">
              <Link href="/auth/login">Login</Link>
              <Link href="/auth/register">Register</Link>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
}
