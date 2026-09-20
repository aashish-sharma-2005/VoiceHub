import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Home from "./screen/home";
import Explore from "./screen/explore";
import CreateIssue from "./screen/createIssue";
import MyIssue from "./screen/myIssue";
import Notification from "./screen/notification";
import Profile from "./screen/profile";
import NotFound from "./screen/notFound";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route element={<MainLayout />}>

          <Route path="/" element={<Home />} />

          <Route
            path="/explore"
            element={<Explore />}
          />

          <Route
            path="/create-issue"
            element={<CreateIssue />}
          />

          <Route
            path="/my-issues"
            element={<MyIssue />}
          />

          <Route
            path="/notifications"
            element={<Notification />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

        </Route>

        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;