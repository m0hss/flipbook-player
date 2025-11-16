import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="bg-gray-900 min-h-screen flex items-center justify-center px-4">
      <div className="max-w-3xl text-center py-16">
        <h1 className="text-6xl md:text-8xl font-extrabold text-white tracking-tight">
          404
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-300">
          Oops — the page you were looking for doesn't exist.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          It might have been moved or removed. Try returning to the flipbook.
        </p>

        <div className="mt-8 flex items-center justify-center">
          <Link
            to="/"
            className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-md text-sm font-medium"
          >
            Back to FlipBook
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
