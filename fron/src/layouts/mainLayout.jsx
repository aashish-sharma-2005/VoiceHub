import { Outlet } from "react-router-dom";

import Navbar from "../components/navbar/navbar";
import Sidebar from "../components/sidebar/sidebar";
import Footer from "../components/footer/footer";

function MainLayout() {
  return (
    <div className="app-layout">
      <Navbar />

      <div className="app-body">
        <Sidebar />

        <main className="main-content">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default MainLayout;