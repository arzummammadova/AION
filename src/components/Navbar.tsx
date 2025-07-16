"use client";
import { CgProfile } from "react-icons/cg";
import { MdLightMode, MdDarkMode } from "react-icons/md";
import { FiMenu, FiX, FiGlobe } from "react-icons/fi";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store/store";
import { fetchUser, logoutUser } from "@/redux/features/userSlice";
import { useEffect, useState, useRef } from "react";
import { setTheme } from "@/redux/features/themeSlice";

export default function Navbar() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.user);
  const { isDarkMode } = useSelector((state: RootState) => state.theme);
  const [greeting, setGreeting] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (storedTheme === "dark" || (!storedTheme && prefersDark)) {
      dispatch(setTheme(true));
      document.documentElement.classList.add("dark");
    } else {
      dispatch(setTheme(false));
      document.documentElement.classList.remove("dark");
    }
  }, [dispatch]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    dispatch(setTheme(newMode));
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  useEffect(() => {
    const hour = new Date().getHours();
    let newGreeting = "", emoji = "";
    if (hour >= 5 && hour < 12) {
      newGreeting = "Sabahın xeyir";
      emoji = "☀️";
    } else if (hour >= 12 && hour < 17) {
      newGreeting = "Günortan xeyir";
      emoji = "👋";
    } else if (hour >= 17 && hour < 21) {
      newGreeting = "Axşamın xeyir";
      emoji = "🌆";
    } else {
      newGreeting = "Get yat";
      emoji = "😴";
    }
    setGreeting(`${newGreeting} ${emoji}`);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") dispatch(fetchUser());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setShowDropdown(false);
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node))
        setShowLangDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const textColorClass = isDarkMode ? "text-white" : "text-black";
  const hoverTextColorClass = isDarkMode ? "hover:text-gray-400" : "hover:text-gray-700";
  const hoverBgColorClass = isDarkMode ? "hover:bg-gray-700" : "hover:bg-[#E7D8FF]";
  const dropdownBgColorClass = isDarkMode ? "bg-black" : "bg-white";
  const dropdownBorderColorClass = isDarkMode ? "border-gray-700" : "border-gray-200";
  const dropdownItemHoverBgClass = isDarkMode ? "hover:bg-gray-700" : "hover:bg-[#E7D8FF]";
  const dropdownItemHoverTextColorClass = isDarkMode ? "hover:text-white" : "hover:text-black";

  return (
    <nav className={`${isDarkMode ? "dark" : ""}`}>
      <div className={`w-full fixed p-5 z-50 shadow border-b ${isDarkMode ? " opacity-70 bg-black via-gray-300 to-black" : "bg-transparent border-b-indigo-100"} ${textColorClass}`}>
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            AION
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className={hoverTextColorClass}>Ana Səhifə</Link>
            <Link href="/about" className={hoverTextColorClass}>About</Link>
            <Link href="/contact" className={hoverTextColorClass}>Contact</Link>
          </div>

          <button className="md:hidden" onClick={() => setShowMobileMenu(!showMobileMenu)}>
            {showMobileMenu ? <FiX size={26} /> : <FiMenu size={26} />}
          </button>

          <div className="flex items-center space-x-4 relative">
            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className={`p-2 rounded-full transition ${hoverBgColorClass} ${textColorClass}`}
              >
                <FiGlobe size={22} />
              </button>
              {showLangDropdown && (
                <div className={`absolute right-0 mt-2 w-24 rounded-md shadow-lg z-30 ${dropdownBgColorClass} ${dropdownBorderColorClass}`}>
                  {["AZ", "EN", "RU"].map((lang) => (
                    <button
                      key={lang}
                      className={`block w-full text-left px-4 py-2 text-sm ${textColorClass} ${dropdownItemHoverBgClass} ${dropdownItemHoverTextColorClass}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition ${hoverBgColorClass} ${textColorClass}`}
              title={isDarkMode ? "Light Mode" : "Dark Mode"}
            >
              {isDarkMode ? <MdLightMode size={24} /> : <MdDarkMode size={24} />}
            </button>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className={`flex items-center space-x-2 ${hoverTextColorClass}`}
                >
                  <CgProfile size={24} />
                  <span className="hidden sm:inline">{greeting}, {user.username}</span>
                </button>
                {showDropdown && (
                  <div className={`absolute right-0 top-12 w-48 rounded-xl shadow-2xl py-2 z-30 ${dropdownBgColorClass} ${dropdownBorderColorClass}`}>
                    <Link
                      href="/profile"
                      className={`block px-4 py-2 text-sm ${textColorClass} ${dropdownItemHoverBgClass} ${dropdownItemHoverTextColorClass}`}
                      onClick={() => setShowDropdown(false)}
                    >
                      Profil
                    </Link>
                    <button
                      onClick={() => {
                        dispatch(logoutUser());
                        setShowDropdown(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm ${textColorClass} ${dropdownItemHoverBgClass} ${dropdownItemHoverTextColorClass}`}
                    >
                      Çıxış
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex space-x-4 items-center">
                <Link href="/auth/login" className={hoverTextColorClass}>Giriş</Link>
                <Link href="/auth/register" className={hoverTextColorClass}>Qeydiyyat</Link>
              </div>
            )}
          </div>
        </div>

        {showMobileMenu && (
          <div className={`md:hidden mt-4 space-y-3 px-4 ${textColorClass}`}>
            <Link href="/" className={`block ${hoverTextColorClass}`}>Ana Səhifə</Link>
            <Link href="/about" className={`block ${hoverTextColorClass}`}>About</Link>
            <Link href="/contact" className={`block ${hoverTextColorClass}`}>Contact</Link>
            {!user && (
              <>
                <Link href="/auth/login" className={`block ${hoverTextColorClass}`}>Giriş</Link>
                <Link href="/auth/register" className={`block ${hoverTextColorClass}`}>Qeydiyyat</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}