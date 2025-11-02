import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useAdmin from "../../hooks/useAdmin";
import { FaBan, FaClock, FaCheck, FaExclamationTriangle, FaUserShield } from "react-icons/fa";
import { showToast } from "../../utils/toast";

const Users = () => {
  const { getUsers, manageUser } = useAdmin();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", role: "", status: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionNote, setActionNote] = useState("");
  const [durationDays, setDurationDays] = useState(7);

  useEffect(() => {
    fetchUsers();
  }, [page, filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers({ ...filters, page, limit: 20 });
      setUsers(data.users || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageUser = async (action) => {
    try {
      await manageUser(selectedUser.id, action, actionNote, durationDays);
      setShowModal(false);
      setSelectedUser(null);
      setActionNote("");
      
      const actionMessages = {
        warn: "User warned successfully",
        suspend: "User suspended successfully",
        unsuspend: "User unsuspended successfully",
        ban: "User banned successfully",
        unban: "User unbanned successfully",
        promote: "User promoted to moderator",
        demote: "User demoted to regular user",
      };
      
      showToast.success(actionMessages[action] || "Action completed successfully");
      fetchUsers();
    } catch (error) {
      showToast.error("Failed to perform action. Please try again.");
    }
  };

  const openActionModal = (user, action) => {
    setSelectedUser({ ...user, action });
    setShowModal(true);
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage platform users</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex gap-4">
        <input
          type="text"
          placeholder="Search users..."
          value={filters.search}
          onChange={(e) => {
            setFilters({ ...filters, search: e.target.value });
            setPage(1);
          }}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <select
          value={filters.role}
          onChange={(e) => {
            setFilters({ ...filters, role: e.target.value });
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={filters.status}
          onChange={(e) => {
            setFilters({ ...filters, status: e.target.value });
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {users.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">No users found</p>
          </div>
        ) : (
          users.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {user.displayName || user.username}
                    </h3>
                    {user.role !== "user" && (
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-sm font-medium">
                        {user.role}
                      </span>
                    )}
                    {user.isBanned && (
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded text-sm font-medium">
                        Banned
                      </span>
                    )}
                    {user.isSuspended && (
                      <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded text-sm font-medium">
                        Suspended
                        {user.suspendedUntil &&
                          ` until ${new Date(user.suspendedUntil).toLocaleDateString()}`}
                      </span>
                    )}
                    {user.warningCount > 0 && (
                      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded text-sm font-medium">
                        {user.warningCount} warning{user.warningCount > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    @{user.username} • {user.email}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Posts</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {user.stats?.posts || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Comments</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {user.stats?.comments || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Followers</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {user.stats?.followers || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Reports</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {user.stats?.reportsReceived || 0}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {!user.isBanned && (
                    <button
                      onClick={() => openActionModal(user, "warn")}
                      className="p-2 bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800 text-yellow-700 dark:text-yellow-300 rounded-lg transition-colors"
                      title="Warn"
                    >
                      <FaExclamationTriangle />
                    </button>
                  )}
                  {user.isSuspended ? (
                    <button
                      onClick={() => openActionModal(user, "unsuspend")}
                      className="p-2 bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 text-green-700 dark:text-green-300 rounded-lg transition-colors"
                      title="Unsuspend"
                    >
                      <FaCheck />
                    </button>
                  ) : !user.isBanned ? (
                    <button
                      onClick={() => openActionModal(user, "suspend")}
                      className="p-2 bg-orange-100 dark:bg-orange-900 hover:bg-orange-200 dark:hover:bg-orange-800 text-orange-700 dark:text-orange-300 rounded-lg transition-colors"
                      title="Suspend"
                    >
                      <FaClock />
                    </button>
                  ) : null}
                  {user.isBanned ? (
                    <button
                      onClick={() => openActionModal(user, "unban")}
                      className="p-2 bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 text-green-700 dark:text-green-300 rounded-lg transition-colors"
                      title="Unban"
                    >
                      <FaCheck />
                    </button>
                  ) : (
                    <button
                      onClick={() => openActionModal(user, "ban")}
                      className="p-2 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded-lg transition-colors"
                      title="Ban"
                    >
                      <FaBan />
                    </button>
                  )}
                </div>
              </div>
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
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {selectedUser.action === "warn"
                ? "Warn User"
                : selectedUser.action === "suspend"
                ? "Suspend User"
                : selectedUser.action === "unsuspend"
                ? "Unsuspend User"
                : selectedUser.action === "ban"
                ? "Ban User"
                : "Unban User"}
            </h3>
            {(selectedUser.action === "suspend" || selectedUser.action === "ban") && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (days) - Only for suspend
                </label>
                <input
                  type="number"
                  value={durationDays}
                  onChange={(e) => setDurationDays(parseInt(e.target.value) || 7)}
                  min="1"
                  max="365"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}
            <textarea
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              placeholder="Add a reason (optional)"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4 h-24 resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedUser(null);
                  setActionNote("");
                }}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleManageUser(selectedUser.action)}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors text-white ${
                  selectedUser.action === "ban"
                    ? "bg-red-600 hover:bg-red-700"
                    : selectedUser.action === "suspend"
                    ? "bg-red-500 hover:bg-red-600"
                    : selectedUser.action === "warn"
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "bg-green-600 hover:bg-green-700"
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

export default Users;

