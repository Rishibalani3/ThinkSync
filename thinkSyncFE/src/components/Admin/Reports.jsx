import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useAdmin from "../../hooks/useAdmin";
import { FaCheck, FaTimes, FaExclamationTriangle, FaBan, FaClock } from "react-icons/fa";
import { timeAgo } from "../../utils/FormatTime";
import { showToast } from "../../utils/toast";

const Reports = () => {
  const { getReports, resolveReport } = useAdmin();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "", type: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionNote, setActionNote] = useState("");

  useEffect(() => {
    fetchReports();
  }, [page, filters]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getReports({ ...filters, page, limit: 20 });
      setReports(data.reports || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch reports", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (reportId, action) => {
    try {
      await resolveReport(reportId, action, actionNote);
      setShowModal(false);
      setSelectedReport(null);
      setActionNote("");
      
      const actionMessages = {
        dismiss: "Report dismissed successfully",
        warn: "User warned successfully",
        suspend: "User suspended successfully",
        ban: "User banned successfully",
      };
      
      showToast.success(actionMessages[action] || "Report resolved successfully");
      fetchReports();
    } catch (error) {
      showToast.error("Failed to resolve report. Please try again.");
    }
  };

  const openActionModal = (report, action) => {
    setSelectedReport({ ...report, action });
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      dismissed: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      warned: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      suspended: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      banned: "bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100",
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage and resolve user reports
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4">
        <select
          value={filters.status}
          onChange={(e) => {
            setFilters({ ...filters, status: e.target.value });
            setPage(1);
          }}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
          <option value="warned">Warned</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>

        <select
          value={filters.type}
          onChange={(e) => {
            setFilters({ ...filters, type: e.target.value });
            setPage(1);
          }}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">All Types</option>
          <option value="post">Post</option>
          <option value="comment">Comment</option>
          <option value="user">User</option>
        </select>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <FaExclamationTriangle className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No reports found</p>
          </div>
        ) : (
          reports.map((report) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                        report.status
                      )}`}
                    >
                      {report.status}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                      {report.type}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {timeAgo(new Date(report.createdAt))}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Reason:{" "}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {report.reason}
                      </span>
                    </div>

                    {report.post && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Reported Post:
                        </p>
                        <p className="text-gray-900 dark:text-white">
                          {report.post.content?.substring(0, 200)}
                          {report.post.content?.length > 200 && "..."}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          By: {report.post.author?.displayName || report.post.author?.username}
                        </p>
                      </div>
                    )}

                    {report.comment && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Reported Comment:
                        </p>
                        <p className="text-gray-900 dark:text-white">{report.comment.content}</p>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 mt-3 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Reporter: {report.reporter?.displayName || report.reporter?.username}
                      </span>
                      {report.reportedUser && (
                        <span className="text-gray-600 dark:text-gray-400">
                          Reported User:{" "}
                          {report.reportedUser?.displayName || report.reportedUser?.username}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {report.status === "pending" && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => openActionModal(report, "dismiss")}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FaTimes /> Dismiss
                  </button>
                  <button
                    onClick={() => openActionModal(report, "warn")}
                    className="px-4 py-2 bg-orange-100 dark:bg-orange-900 hover:bg-orange-200 dark:hover:bg-orange-800 text-orange-700 dark:text-orange-300 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FaExclamationTriangle /> Warn
                  </button>
                  <button
                    onClick={() => openActionModal(report, "suspend")}
                    className="px-4 py-2 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FaClock /> Suspend
                  </button>
                  <button
                    onClick={() => openActionModal(report, "ban")}
                    className="px-4 py-2 bg-red-200 dark:bg-red-800 hover:bg-red-300 dark:hover:bg-red-700 text-red-900 dark:text-red-100 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FaBan /> Ban
                  </button>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Action Modal */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {selectedReport.action === "dismiss"
                ? "Dismiss Report"
                : selectedReport.action === "warn"
                ? "Warn User"
                : selectedReport.action === "suspend"
                ? "Suspend User"
                : "Ban User"}
            </h3>
            <textarea
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              placeholder="Add a note (optional)"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4 h-24 resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedReport(null);
                  setActionNote("");
                }}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResolve(selectedReport.id, selectedReport.action)}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors text-white ${
                  selectedReport.action === "ban"
                    ? "bg-red-600 hover:bg-red-700"
                    : selectedReport.action === "suspend"
                    ? "bg-red-500 hover:bg-red-600"
                    : selectedReport.action === "warn"
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "bg-gray-600 hover:bg-gray-700"
                }`}
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Reports;

