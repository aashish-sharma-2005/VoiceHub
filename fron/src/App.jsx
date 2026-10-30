
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/mainLayout";

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
import PendingIssues from "./screen/pendingIssue/index";
import ApprovedIssues from "./screen/approvedIssue/index";
import DismissedIssues from "./screen/dismissedIssue/index";
import AdminDashboard from "./screen/adminDashboard/index";
import AdminUsers from "./screen/adminUsers/index";
import AdminModerators from "./screen/adminModerators/index";

import SavedIssues from "./screen/savedIssue/index";
import AdminIssueStatus from "./screen/manageIssue/AdminIssueStatus";
import IssueDetails from "./screen/issueDetails/index";

import RoleRoute from "./routes/RoleRoute";

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
                {/* PUBLIC ROUTES */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* USER ROUTES */}
                <Route element={<RoleRoute allowedRoles={["user"]} />}>
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<Home />} />
                        <Route
                            path="/create-issue"
                            element={<CreateIssue />}
                        />
                        <Route path="/my-issues" element={<MyIssue />} />
                        <Route
                            path="/saved-issues"
                            element={<SavedIssues />}
                        />
                    </Route>
                </Route>

                {/* COMMON ROUTES: USER + MODERATOR + ADMIN */}
                <Route
                    element={
                        <RoleRoute
                            allowedRoles={["user", "moderator", "admin"]}
                        />
                    }
                >
                    <Route element={<MainLayout />}>
                        <Route path="/explore" element={<Explore />} />
                        <Route
                            path="/issue/:id"
                            element={<IssueDetails />}
                        />
                        <Route
                            path="/notifications"
                            element={<Notification />}
                        />
                        <Route path="/profile" element={<Profile />} />
                    </Route>
                </Route>

                {/* MODERATOR ROUTES */}
                <Route element={<RoleRoute allowedRoles={["moderator"]} />}>
                    <Route element={<MainLayout />}>
                        <Route
                            path="/moderator"
                            element={<ModeratorDashboard />}
                        />
                        <Route
                            path="/moderator/pending"
                            element={<PendingIssues />}
                        />
                        <Route
                            path="/moderator/issues"
                            element={<IssueManagement />}
                        />
                        <Route
                            path="/moderator/approved"
                            element={<ApprovedIssues />}
                        />
                        <Route
                            path="/moderator/dismissed"
                            element={<DismissedIssues />}
                        />
                    </Route>
                </Route>

                {/* ADMIN ROUTES */}
                <Route element={<RoleRoute allowedRoles={["admin"]} />}>
                    <Route element={<MainLayout />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route
                            path="/admin/pending"
                            element={<PendingIssues />}
                        />
                        <Route
                            path="/admin/issues"
                            element={<IssueManagement />}
                        />
                        <Route
                            path="/admin/status"
                            element={<AdminIssueStatus />}
                        />
                        <Route
                            path="/admin/users"
                            element={<AdminUsers />}
                        />
                        <Route
                            path="/admin/moderators"
                            element={<AdminModerators />}
                        />
                    </Route>
                </Route>

                {/* UNAUTHORIZED */}
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
                                You do not have permission to access this page.
                            </p>
                        </div>
                    }
                />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
