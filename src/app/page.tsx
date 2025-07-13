import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <div
        className="
          bg-[url('/images/aionbg.png')]
          bg-cover bg-center w-full
        "
      >
        <div className="flex justify-center items-center flex-col mx-auto h-screen px-6">
          <h1 className="text-black text-3xl md:text-7xl text-center font-bold">
            Welcome to AION
          </h1>

          <p className="text-center mt-4 text-sm md:text-base text-gray-700 max-w-md md:max-w-xl">
            A AION web application for managing your daily tasks.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full sm:w-auto justify-center items-center">
            <Link
              href="/auth/login"
              // Add your custom class here
              className="text-center border border-black rounded-2xl text-black font-bold py-3 px-6 w-full sm:w-40 transition btn-gradient-hover"
            >
              Get Started
            </Link>

            <Link
              href="/workspace"
              // Add your custom class here
              className="text-center border border-black rounded-2xl text-black font-bold py-3 px-6 w-full sm:w-40 transition btn-gradient-hover"
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