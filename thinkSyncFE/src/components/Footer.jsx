import {
  FaBrain,
  FaTwitter,
  FaGithub,
  FaLinkedin,
  FaOtter,
} from "react-icons/fa";
import { Link } from "react-router-dom";
const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative  dark:from-gray-900/40 dark:via-blue-950/30 dark:to-gray-900/40 backdrop-blur-2xl border-t border-gray-200/50 dark:border-gray-700/50 py-16 mt-12 overflow-hidden">
      {/* Animated background effect */}

      <div className="relative max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3 text-3xl font-bold">
              <FaBrain className="text-4xl text-blue-600 dark:text-blue-400 animate-pulse" />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                ThinkSync
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left max-w-xs">
              Synchronizing thoughts, amplifying ideas, transforming the future.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start gap-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Quick Links
            </h3>
            <div className="flex flex-col gap-3 text-sm">
              <Link
                to="/about"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block"
              >
                → About Us
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block"
              >
                → Contact
              </Link>
              <Link
                to="/privacy"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block"
              >
                → Privacy Policy
              </Link>
              <Link
                to="/guidelines"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block"
              >
                → Guidelines
              </Link>
            </div>
          </div>

          {/* Social Connect */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Connect With Us
            </h3>
            <div className="flex gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative"
              >
                <div className="absolute inset-0 bg-blue-400/20 rounded-lg blur-xl group-hover:bg-blue-400/40 transition-all duration-300"></div>
                <div className="relative bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-400 dark:hover:border-blue-400 transition-all duration-300 hover:scale-110 hover:-translate-y-1">
                  <FaTwitter className="text-xl text-gray-700 dark:text-gray-300 group-hover:text-blue-400 transition-colors duration-300" />
                </div>
              </a>

              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative"
              >
                <div className="absolute inset-0 bg-gray-400/20 rounded-lg blur-xl group-hover:bg-gray-400/40 transition-all duration-300"></div>
                <div className="relative bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-600 dark:hover:border-gray-400 transition-all duration-300 hover:scale-110 hover:-translate-y-1">
                  <FaGithub className="text-xl text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-300" />
                </div>
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative"
              >
                <div className="absolute inset-0 bg-blue-600/20 rounded-lg blur-xl group-hover:bg-blue-600/40 transition-all duration-300"></div>
                <div className="relative bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-600 dark:hover:border-blue-400 transition-all duration-300 hover:scale-110 hover:-translate-y-1">
                  <FaLinkedin className="text-xl text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" />
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Divider with glow */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300/30 dark:border-gray-600/30"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent rounded-full"></div>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <p className="text-center md:text-left">
            &copy; {year} ThinkSync. All rights reserved.
          </p>
          <p className="text-center md:text-right">
            Developed by{" "}
            <a
              href="https://github.com/akshay08k"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline transition-all duration-300 hover:translate-x-1"
            >
              Akshay Komale
            </a>
            &nbsp;|&nbsp;
            <a
              href="https://github.com/Rishibalani3"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline transition-all duration-300 hover:translate-x-1"
            >
              Rishi Balani
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
