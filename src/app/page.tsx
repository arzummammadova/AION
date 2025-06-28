import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <div className="bg-[url('/images/bg-3.jpg')] bg-cover bg-center w-full h-screen">
        <div className="flex justify-center items-center flex-col mx-auto h-screen px-6">
          <h1 className="text-white text-3xl md:text-5xl text-center font-bold">
            Welcome to RustBerry
          </h1>

          <p className="text-center mt-4 text-sm md:text-base text-gray-400 max-w-md md:max-w-xl">
            A Rust-based web application for managing your daily tasks.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full sm:w-auto justify-center items-center">
            <Link
              href="/auth/login"
              className="text-center border border-white rounded-2xl text-white font-bold py-2 px-6 w-full sm:w-40 transition hover:bg-white hover:text-black"
            >
              Get Started
            </Link>

            <Link
              href="/workspace"
              className="text-center border border-white rounded-2xl text-white font-bold py-2 px-6 w-full sm:w-40 transition hover:bg-white hover:text-black"
            >
              Work Space
            </Link>
          </div>

          <Image
            src="/icons/wired-outline-217-arrow-6-hover-pointing.svg"
            width={48}
            height={48}
            alt="Arrow icon"
            className="mx-auto mt-10"
          />
        </div>
      </div>
    </div>
  );
}
