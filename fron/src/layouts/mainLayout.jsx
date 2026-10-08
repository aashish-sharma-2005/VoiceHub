import { Outlet } from "react-router-dom";

import Sidebar from "../components/sidebar/sidebar";
import Footer from "../components/footer/footer";

function MainLayout() {
  return (
    <div className="app-layout">
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