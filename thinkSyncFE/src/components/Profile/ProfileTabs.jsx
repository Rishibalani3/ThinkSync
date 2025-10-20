const Tabs = ({ tabs, activeTab, setActiveTab }) => (
  <div className="flex border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-700/50 overflow-x-auto">
    {tabs.map((tab) => {
      return (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 min-w-fit px-3 py-3 sm:px-6 sm:py-4 text-xs sm:text-sm font-medium transition-all duration-300 relative group ${
            activeTab === tab.id
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <div className="flex items-center justify-center sm:gap-2">
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.slice(0, 1)}</span>
            <span
              className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              }`}
            >
              {tab.count}
            </span>
          </div>
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 sm:w-16 h-0.5 sm:h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
          )}
        </button>
      );
    })}
  </div>
);

export default Tabs;
