import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import SidebarLeft from "../components/SidebarLeft";
import SidebarRight from "../components/SidebarRight";
import { useAuth } from "../contexts/AuthContext";

const MainLayout = () => {
  const { isAuthenticated, setIsAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />

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
    </div>
  );
};

export default MainLayout;


