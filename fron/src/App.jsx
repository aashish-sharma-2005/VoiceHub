import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Home from "./screen/home";
import Explore from "./screen/explore";
import CreateIssue from "./screen/createIssue";
import MyIssue from "./screen/myIssue";
import Notification from "./screen/notification";
import Profile from "./screen/profile";
import NotFound from "./screen/notFound";

import Login from "./screen/login";
import Signup from "./screen/signup";

import IssueManagement from "./screen/IssueManagement/index";

import RoleRoute from "./routes/RoleRoute";

function AdminDashboard() {
    return (
        <div style={{ padding: "30px" }}>
            <h1>Admin Dashboard</h1>
            <p>Welcome to the VoiceHub Admin Panel.</p>
        </div>
    );
}

function ModeratorDashboard() {
    return (
        <div style={{ padding: "30px" }}>
            <h1>Moderator Dashboard</h1>
            <p>Welcome to the VoiceHub Moderator Panel.</p>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* =========================
                    PUBLIC ROUTES
                ========================== */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/signup"
                    element={<Signup />}
                />

                {/* =========================
                    USER ROUTES
                ========================== */}

                <Route
                    element={
                        <RoleRoute allowedRoles={["user"]} />
                    }
                >
                    <Route element={<MainLayout />}>

                        <Route
                            path="/"
                            element={<Home />}
                        />

                        <Route
                            path="/create-issue"
                            element={<CreateIssue />}
                        />

                        <Route
                            path="/my-issues"
                            element={<MyIssue />}
                        />

                    </Route>
                </Route>

                {/* =========================
                    COMMON ROUTES
                    USER + MODERATOR + ADMIN
                ========================== */}

                <Route
                    element={
                        <RoleRoute
                            allowedRoles={[
                                "user",
                                "moderator",
                                "admin",
                            ]}
                        />
                    }
                >
                    <Route element={<MainLayout />}>

                        <Route
                            path="/explore"
                            element={<Explore />}
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
                </Route>

                {/* =========================
                    MODERATOR ROUTES
                ========================== */}

                <Route
                    element={
                        <RoleRoute
                            allowedRoles={["moderator"]}
                        />
                    }
                >
                    <Route element={<MainLayout />}>

                        <Route
                            path="/moderator"
                            element={<ModeratorDashboard />}
                        />

                        {/* Moderator Issue Management */}

                        <Route
                            path="/moderator/issues"
                            element={<IssueManagement />}
                        />

                    </Route>
                </Route>

                {/* =========================
                    ADMIN ROUTES
                ========================== */}

                <Route
                    element={
                        <RoleRoute
                            allowedRoles={["admin"]}
                        />
                    }
                >
                    <Route element={<MainLayout />}>

                        <Route
                            path="/admin"
                            element={<AdminDashboard />}
                        />

                        {/* Admin Issue Management */}

                        <Route
                            path="/admin/issues"
                            element={<IssueManagement />}
                        />

                    </Route>
                </Route>

                {/* =========================
                    UNAUTHORIZED
                ========================== */}

                <Route
                    path="/unauthorized"
                    element={
                        <div
                            style={{
                                padding: "40px",
                                textAlign: "center",
                            }}
                        >
                            <h1>403</h1>

                            <h2>Access Denied</h2>

                            <p>
                                You do not have permission to
                                access this page.
                            </p>
                        </div>
                    }
                />

                {/* =========================
                    404
                ========================== */}

                <Route
                    path="*"
                    element={<NotFound />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;