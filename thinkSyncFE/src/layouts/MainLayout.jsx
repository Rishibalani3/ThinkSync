import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import SidebarLeft from "../components/SidebarLeft";
import SidebarRight from "../components/SidebarRight";
import { useAuth } from "../contexts/AuthContext";
import Footer from "../components/Footer";
import MobileNav from "../components/MobileNav";

const MainLayout = () => {
  const { isAuthenticated, setIsAuthenticated } = useAuth();

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="sticky top-0 left-0 w-full display-none sm:h-8 backdrop-blur-sm bg-white/20 dark:bg-gray-900/20 z-50" />

      <div className="sticky top-4 sm:top-6 left-0 w-full backdrop-blur-3xl bg-white/70 dark:bg-gray-900/70 z-50 shadow-sm">
        <Navbar
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
        />
      </div>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-10 gap-6 pt-[5.5rem] sm:pt-[6rem] pb-28 lg:pb-12 px-4 sm:px-6">
        <aside className="lg:col-span-2 hidden lg:block relative">
          <div className="sticky top-28">
            <SidebarLeft />
          </div>
        </aside>

        <div className="lg:col-span-5 min-h-[calc(100vh-6rem)]">
          <Outlet />
        </div>

        <aside className="lg:col-span-3 hidden lg:block relative">
          <div className="sticky top-28">
            <SidebarRight />
          </div>
        </aside>
      </main>

      <MobileNav isAuthenticated={isAuthenticated} />
      <Footer />
    </div>
  );
};

export default MainLayout;
