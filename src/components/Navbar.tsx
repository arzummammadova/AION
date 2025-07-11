"use client";
import { CgProfile } from "react-icons/cg";
import { MdLightMode, MdDarkMode } from "react-icons/md";
import { FiMenu, FiX, FiGlobe } from "react-icons/fi";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store/store";
import { fetchUser, logoutUser } from "@/redux/features/userSlice";
import { useEffect, useState, useRef } from "react";

export default function Navbar() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.user);
  const [greeting, setGreeting] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    let newGreeting = "", emoji = "";
    if (hour >= 5 && hour < 12) { newGreeting = "Sabahın xeyir"; emoji = "☀️"; }
    else if (hour >= 12 && hour < 17) { newGreeting = "Günortan xeyir"; emoji = "👋"; }
    else if (hour >= 17 && hour < 21) { newGreeting = "Axşamın xeyir"; emoji = "🌆"; }
    else { newGreeting = "Get yat"; emoji = "😴"; }
    setGreeting(`${newGreeting} ${emoji}`);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") dispatch(fetchUser());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) setShowDropdown(false);
      if (
        langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)
      ) setShowLangDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark", !isDarkMode);
  };

  return (
    <nav className={`${isDarkMode ? 'dark' : ''} shadow-md z-50`}>
      <div className="bg-[#161616] w-full fixed text-white p-5 z-50">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold">AION</Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="hover:text-gray-300">Home</Link>
            <Link href="/about" className="hover:text-gray-300">About</Link>
            <Link href="/contact" className="hover:text-gray-300">Contact</Link>
          </div>

          {/* Mobile Burger Menu Toggle */}
          <button className="md:hidden" onClick={() => setShowMobileMenu(!showMobileMenu)}>
            {showMobileMenu ? <FiX size={26} /> : <FiMenu size={26} />}
          </button>

          {/* Right section */}
          <div className="flex items-center space-x-4 relative">
            {/* Language Switcher */}
            <div className="relative" ref={langDropdownRef}>
              <button onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="p-2 rounded-full hover:bg-gray-700 transition">
                <FiGlobe size={22} />
              </button>
              {showLangDropdown && (
                <div className="absolute right-0 mt-2 w-24 bg-black rounded-md shadow-lg border border-gray-700 z-30">
                  <button className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700">AZ</button>
                  <button className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700">EN</button>
                  <button className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700">RU</button>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-700 transition"
              title={isDarkMode ? "Light Mode" : "Dark Mode"}
            >
              {isDarkMode ? <MdLightMode size={24} /> : <MdDarkMode size={24} />}
            </button>

            {/* User dropdown */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 hover:text-gray-300">
                  <CgProfile size={24} />
                  <span className="hidden sm:inline">{greeting}, {user.username}</span>
                </button>
                {showDropdown && (
                  <div className="absolute right-0 md:right-0 top-12 md:top-auto w-48 bg-black rounded-xl shadow-2xl border border-gray-700 py-2 z-30">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-white hover:bg-gray-700"
                      onClick={() => setShowDropdown(false)}>
                      Profil
                    </Link>
                    <button
                      onClick={() => {
                        dispatch(logoutUser());
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                    >
                      Çıxış
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex space-x-4 items-center">
                <Link href="/auth/login" className="hover:text-gray-300">Giriş</Link>
                <Link href="/auth/register" className="hover:text-gray-300">Qeydiyyat</Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Content */}
        {showMobileMenu && (
          <div className="md:hidden mt-4 space-y-3 px-4">
            <Link href="/" className="block text-white hover:text-gray-300">Home</Link>
            <Link href="/about" className="block text-white hover:text-gray-300">About</Link>
            <Link href="/contact" className="block text-white hover:text-gray-300">Contact</Link>
            {!user && (
              <>
                <Link href="/auth/login" className="block text-white hover:text-gray-300">Giriş</Link>
                <Link href="/auth/register" className="block text-white hover:text-gray-300">Qeydiyyat</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
