import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useAdmin from "../../hooks/useAdmin";
import {
  FaUsers,
  FaFileAlt,
  FaExclamationTriangle,
  FaChartLine,
  FaComments,
  FaBookmark,
  FaHashtag,
  FaBan,
  FaClock,
  FaArrowUp,
  FaArrowDown,
  FaPrint,
  FaDownload,
} from "react-icons/fa";

const Dashboard = () => {
  const { getDashboardStats } = useAdmin();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [getDashboardStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Failed to load dashboard stats</p>
      </div>
    );
  }

  const { overview, growth, reports, topics } = stats;

  const statCards = [
    {
      label: "Total Users",
      value: overview.totalUsers,
      icon: FaUsers,
      color: "blue",
      trend: growth.newUsers24h,
    },
    {
      label: "Total Posts",
      value: overview.totalPosts,
      icon: FaFileAlt,
      color: "green",
      trend: growth.newPosts24h,
    },
    {
      label: "Pending Reports",
      value: overview.pendingReports,
      icon: FaExclamationTriangle,
      color: "red",
    },
    {
      label: "Total Engagement",
      value: overview.totalEngagement?.toLocaleString() || 0,
      icon: FaChartLine,
      color: "purple",
    },
    {
      label: "Active Users (24h)",
      value: growth.activeUsers24h,
      icon: FaUsers,
      color: "blue",
    },
    {
      label: "Banned Users",
      value: overview.bannedUsers,
      icon: FaBan,
      color: "red",
    },
    {
      label: "Suspended Users",
      value: overview.suspendedUsers,
      icon: FaClock,
      color: "orange",
    },
    {
      label: "Total Topics",
      value: overview.totalTopics,
      icon: FaHashtag,
      color: "indigo",
    },
  ];

  const colorClasses = {
    blue: "bg-blue-500 dark:bg-blue-600",
    green: "bg-green-500 dark:bg-green-600",
    red: "bg-red-500 dark:bg-red-600",
    purple: "bg-purple-500 dark:bg-purple-600",
    orange: "bg-orange-500 dark:bg-orange-600",
    indigo: "bg-indigo-500 dark:bg-indigo-600",
  };

  const handleExportReport = () => {
    if (!stats) {
      alert("Please wait for stats to load");
      return;
    }

    // Create a printable report with all stats
    const reportWindow = window.open("", "_blank");
    if (!reportWindow) return;

    const { overview, growth, topics, reports } = stats;

    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ThinkSync Admin Dashboard Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #333;
          }
          h1 { color: #2563eb; }
          h2 { color: #1e40af; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #2563eb; color: white; }
          .stat-card { background: #f3f4f6; padding: 15px; margin: 10px 0; border-radius: 8px; }
          .stat-label { font-weight: bold; color: #666; }
          .stat-value { font-size: 24px; color: #2563eb; margin-top: 5px; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>ThinkSync Admin Dashboard Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        
        <h2>Platform Overview</h2>
        <div class="stat-card">
          <div class="stat-label">Total Users</div>
          <div class="stat-value">${overview.totalUsers.toLocaleString()}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Posts</div>
          <div class="stat-value">${overview.totalPosts.toLocaleString()}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Comments</div>
          <div class="stat-value">${overview.totalComments.toLocaleString()}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Pending Reports</div>
          <div class="stat-value">${overview.pendingReports.toLocaleString()}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Banned Users</div>
          <div class="stat-value">${overview.bannedUsers.toLocaleString()}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Suspended Users</div>
          <div class="stat-value">${overview.suspendedUsers.toLocaleString()}</div>
        </div>
        
        <h2>Growth Metrics</h2>
        <table>
          <tr>
            <th>Metric</th>
            <th>24 Hours</th>
            <th>7 Days</th>
            <th>30 Days</th>
          </tr>
          <tr>
            <td>New Users</td>
            <td>${growth.newUsers24h.toLocaleString()}</td>
            <td>${growth.newUsers7d.toLocaleString()}</td>
            <td>${growth.newUsers30d.toLocaleString()}</td>
          </tr>
          <tr>
            <td>New Posts</td>
            <td>${growth.newPosts24h.toLocaleString()}</td>
            <td>${growth.newPosts7d.toLocaleString()}</td>
            <td>-</td>
          </tr>
          <tr>
            <td>Active Users</td>
            <td>${growth.activeUsers24h.toLocaleString()}</td>
            <td>${growth.activeUsers7d.toLocaleString()}</td>
            <td>-</td>
          </tr>
        </table>
        
        <h2>Top Topics</h2>
        <table>
          <tr>
            <th>Rank</th>
            <th>Topic Name</th>
            <th>Posts</th>
            <th>Users</th>
          </tr>
          ${topics.map((topic, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${topic.name}</td>
              <td>${topic.postsCount}</td>
              <td>${topic.usersCount}</td>
            </tr>
          `).join('')}
        </table>
        
        ${reports && reports.stats && reports.stats.length > 0 ? `
        <h2>Report Statistics</h2>
        <table>
          <tr>
            <th>Type</th>
            <th>Status</th>
            <th>Count</th>
          </tr>
          ${reports.stats.map(stat => `
            <tr>
              <td>${stat.type}</td>
              <td>${stat.status}</td>
              <td>${stat._count.id}</td>
            </tr>
          `).join('')}
        </table>
        ` : ''}
        
        <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px;">
          Print Report
        </button>
      </body>
      </html>
    `;

    reportWindow.document.write(reportHTML);
    reportWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Platform overview and analytics
          </p>
        </div>
        <button
          onClick={handleExportReport}
          className="w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <FaPrint /> Export Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {stat.value.toLocaleString()}
                  </p>
                  {stat.trend !== undefined && (
                    <div className="flex items-center gap-1 mt-2">
                      {stat.trend > 0 ? (
                        <>
                          <FaArrowUp className="text-green-500 text-xs" />
                          <span className="text-xs text-green-500">
                            +{stat.trend} today
                          </span>
                        </>
                      ) : (
                        <>
                          <FaArrowDown className="text-red-500 text-xs" />
                          <span className="text-xs text-red-500">
                            {stat.trend} today
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div
                  className={`${colorClasses[stat.color]} text-white p-3 rounded-lg`}
                >
                  <Icon className="text-2xl" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Growth Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Growth Overview
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">New Users (24h)</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                +{growth.newUsers24h}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">New Users (7d)</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                +{growth.newUsers7d}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">New Users (30d)</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                +{growth.newUsers30d}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">New Posts (24h)</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                +{growth.newPosts24h}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">New Posts (7d)</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                +{growth.newPosts7d}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Top Topics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Top Topics
          </h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {topics && topics.length > 0 ? (
              topics.slice(0, 10).map((topic, index) => (
                <div
                  key={topic.id}
                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 dark:text-gray-400">#{index + 1}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {topic.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {topic.postsCount} posts
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {topic.usersCount} users
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No topics available
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Report Statistics */}
      {reports && reports.stats && reports.stats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Report Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reports.stats.map((stat, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.type} - {stat.status}
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat._count.id}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;

