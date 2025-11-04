import { motion } from "framer-motion";
import { FaShieldAlt, FaLock, FaUserShield, FaEye } from "react-icons/fa";

const Privacy = () => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto py-12 px-4"
      >
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaShieldAlt className="text-5xl text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-8">
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FaLock className="text-blue-500" />
              Information We Collect
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>
                We collect information you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Account information (username, email, display name)</li>
                <li>Profile information (bio, location, social links)</li>
                <li>Content you post (posts, comments, media)</li>
                <li>Interactions (likes, bookmarks, follows)</li>
              </ul>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FaEye className="text-blue-500" />
              How We Use Your Information
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide and improve our services</li>
                <li>Personalize your experience</li>
                <li>Send you notifications and updates</li>
                <li>Moderate content and ensure platform safety</li>
                <li>Analyze usage patterns and trends</li>
              </ul>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FaUserShield className="text-blue-500" />
              Data Security
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We implement appropriate technical and organizational measures to
              protect your personal information. However, no method of
              transmission over the Internet is 100% secure. While we strive to
              protect your data, we cannot guarantee absolute security.
            </p>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Your Rights
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and data</li>
                <li>Export your data</li>
                <li>Opt-out of certain communications</li>
              </ul>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Contact
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              If you have questions about this Privacy Policy, please contact us
              at{" "}
              <a
                href="mailto:privacy@thinksync.com"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                privacy@thinksync.com
              </a>
            </p>
          </section>
        </div>
      </motion.div>
    </>
  );
};

export default Privacy;
