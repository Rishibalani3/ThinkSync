import { motion } from "framer-motion";
import {
  FaBrain,
  FaUsers,
  FaLightbulb,
  FaRocket,
  FaArrowAltCircleLeft,
} from "react-icons/fa";
import { FaBackward } from "react-icons/fa";

const About = () => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto py-12 px-4"
      >
        <span className="text-sm text-gray-500 dark:text-gray-400">
          <FaArrowAltCircleLeft />
        </span>
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaBrain className="text-5xl text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              About ThinkSync
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Synchronizing thoughts, amplifying ideas, transforming the future.
          </p>
        </div>

        <div className="space-y-8">
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Our Mission
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              ThinkSync is a platform designed to bring together thinkers,
              innovators, and creators from around the world. We believe that
              great ideas emerge when minds connect, collaborate, and challenge
              each other. Our mission is to provide a safe, engaging, and
              intelligent space where thoughts can flow freely and ideas can
              flourish.
            </p>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              What We Offer
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <FaLightbulb className="text-3xl text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Share Ideas
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Post your thoughts, questions, and ideas. Engage with a
                    community of curious minds.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <FaUsers className="text-3xl text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Connect
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Follow like-minded individuals, build your network, and
                    discover new perspectives.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <FaRocket className="text-3xl text-purple-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    AI-Powered
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Leverage AI recommendations to discover trending topics and
                    personalized content.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <FaBrain className="text-3xl text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Safe Space
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Our AI moderation ensures a respectful and safe environment
                    for everyone.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Our Values
            </h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  •
                </span>
                <span>
                  <strong>Innovation:</strong> We embrace new ideas and
                  encourage creative thinking.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  •
                </span>
                <span>
                  <strong>Community:</strong> We believe in the power of
                  connection and collaboration.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  •
                </span>
                <span>
                  <strong>Respect:</strong> We maintain a respectful environment
                  for all users.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  •
                </span>
                <span>
                  <strong>Transparency:</strong> We are committed to open
                  communication and clear policies.
                </span>
              </li>
            </ul>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Join Us
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Be part of a growing community of thinkers, creators, and
              innovators. Start sharing your ideas today!
            </p>
            <a
              href="/login"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Get Started
            </a>
          </section>
        </div>
      </motion.div>
    </>
  );
};

export default About;
