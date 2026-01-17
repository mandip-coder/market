'use client'
import '@/styles/globals.css';
import { getPath } from '@/lib/path';
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 flex flex-col items-center justify-center px-6 py-12 transition-colors duration-300">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl mb-8">
        <Image
          src={getPath('/images/404.svg')}
          alt="404 - Not Found"
          width={800}
          height={600}
          className="w-full h-auto object-contain"
          priority
        />
      </div>

      <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
        404 - Page Not Found
      </h1>

      <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 text-center max-w-xl mb-6">
        Oops! The page you’re looking for doesn’t exist.
      </p>

      <button
        onClick={() => window.location.href = getPath('/dashboard')}
        className="cursor-pointer inline-block px-6 py-3 rounded-lg font-medium shadow-md transition-colors duration-300 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        Go back home
      </button>
    </div>
  );
}
