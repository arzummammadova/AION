"use client";
import Link from "next/link";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store/store";
import { useEffect } from "react";

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { isDarkMode } = useSelector((state: RootState) => state.theme);

  const containerBgClass = isDarkMode ? "bg-black bg-no-repeat bg-cover bg-center " : "bg-[url('/images/aionbg.png')] bg-no-repeat bg-cover bg-center ";
  const imageOverlayClass = isDarkMode ? "bg-[url('/images/aionbg.png')] bg-no-repeat bg-cover bg-center absolute inset-0" : "";
  const titleColorClass = isDarkMode ? "text-white" : "text-black";
  const subtitleColorClass = isDarkMode ? "text-gray-200" : "text-gray-700";
  const linkBtnLightClass = "border-black text-black";
  const linkBtnDarkClass = "border-white border text-white";
  const arrowIconSrc = isDarkMode ? "/icons/wired-outline-217-arrow-6-hover-pointing.svg" : "/icons/wired-outline-217-arrow-6-hover-pointing.svg";

  return (
    <div className={`min-h-screen relative ${containerBgClass}`}>
      {imageOverlayClass && <div className={imageOverlayClass}></div>}
      <div className="flex justify-center items-center flex-col mx-auto h-screen px-6 relative z-10">
        <h1 className={`text-3xl md:text-7xl text-center font-bold ${titleColorClass}`}>
          Welcome to AION
        </h1>

        <p className={`text-center mt-4 text-sm md:text-base max-w-md md:max-w-xl ${subtitleColorClass}`}>
          A AION web application for managing your daily tasks.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full sm:w-auto justify-center items-center">
          <Link
            href="/auth/login"
            className={`text-center rounded-2xl border border-black font-bold py-3 px-6 w-full sm:w-40 transition btn-gradient-hover ${isDarkMode ? linkBtnDarkClass : linkBtnLightClass}`}
          >
            Get Started
          </Link>

          <Link
            href="/workspace"
            className={`text-center rounded-2xl border border-black font-bold py-3 px-6 w-full sm:w-40 transition btn-gradient-hover ${isDarkMode ? linkBtnDarkClass : linkBtnLightClass}`}
          >
            Work Space
          </Link>
        </div>

        <Image
          src={arrowIconSrc}
          width={48}
          height={48}
          alt="Arrow icon"
          className="mx-auto mt-10"
        />
      </div>
    </div>
  );
}