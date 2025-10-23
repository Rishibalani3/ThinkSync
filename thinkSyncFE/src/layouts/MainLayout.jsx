import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import SidebarLeft from "../components/SidebarLeft";
import SidebarRight from "../components/SidebarRight";
import FloatingChatButton from "../components/Messages/FloatingButton";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import axios from "axios";
import { connect } from "socket.io-client";

const MainLayout = () => {
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchFollowers();
    };
    fetchData();
  }, [isAuthenticated]);

  const fetchFollowers = async () => {
    if (isAuthenticated) {
      try {
        let res = await axios.get("http://localhost:3000/follower", {
          withCredentials: true,
        });
        setConnections(res.data.data);
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="sticky top-0 left-0 w-full h-6 backdrop-blur-3xl bg-white/20 dark:bg-gray-900/20 z-90" />
      <div className="sticky top-6 left-0 w-full backdrop-blur-3xl bg-white/60 dark:bg-gray-900/60 z-100 shadow-sm">
        <Navbar
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
        />
      </div>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-10 gap-6 p-5 pt-[5rem]">
        <aside className="lg:col-span-2 hidden lg:block">
          <div className="sticky top-24">
            <SidebarLeft />
          </div>
        </aside>

        <div className="lg:col-span-5 min-h-[calc(100vh-6rem)]">
          <Outlet />
        </div>

        <aside className="lg:col-span-3 hidden lg:block">
          <div className="sticky top-24">
            <SidebarRight />
          </div>
        </aside>
      </main>

      {/* Floating chat button */}
      {isAuthenticated && <FloatingChatButton connections={connections} />}
    </div>
  );
};

export default MainLayout;
