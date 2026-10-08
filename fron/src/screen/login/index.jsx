import { useState } from "react";
import {
    Eye,
    EyeOff,
    LockKeyhole,
    Megaphone,
    UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import "./login.css";
import voicehubIllustration from "../../assets/images/voicehub-Illustration.png";

import { loginUser } from "../../store/loginSlice";

function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setError("Please enter email and password.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await dispatch(
                loginUser({
                    email: formData.email,
                    password: formData.password,
                    rememberMe,
                })
            ).unwrap();

            // Role-based redirect
            if (result.user.role === "admin") {
                navigate("/admin");
            } else if (result.user.role === "moderator") {
                navigate("/moderator");
            } else {
                navigate("/");
            }
        } catch (err) {
            setError(err || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">

                {/* Left Section */}
                <div className="login-left">
                    <div className="login-brand">
                        <div className="login-brand-icon">
                            <Megaphone size={22} />
                        </div>

                        <span>VoiceHub</span>
                    </div>

                    <div className="login-content">
                        <h1>
                            Your Voice.
                            <br />
                            <span>Your Community.</span>
                        </h1>

                        <p>
                            Report issues, share ideas, and help make your
                            community a better place.
                        </p>
                    </div>

                    <div className="login-illustration">
                        <img
                            src={voicehubIllustration}
                            alt="VoiceHub Community"
                        />
                    </div>
                </div>

                {/* Right Section */}
                <div className="login-right">
                    <div className="login-form-container">

                        <div className="login-heading">
                            <div className="login-user-icon">
                                <UserRound size={24} />
                            </div>

                            <h2>Welcome Back</h2>

                            <p>
                                Sign in to continue to VoiceHub
                            </p>
                        </div>

                        {error && (
                            <div className="login-error">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>

                            {/* Email */}
                            <div className="form-group">
                                <label htmlFor="email">
                                    Email Address
                                </label>

                                <div className="input-wrapper">
                                    <UserRound size={18} />

                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="form-group">
                                <label htmlFor="password">
                                    Password
                                </label>

                                <div className="input-wrapper">
                                    <LockKeyhole size={18} />

                                    <input
                                        id="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="password"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        autoComplete="current-password"
                                    />

                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me */}
                            <div className="login-options">
                                <label className="remember-me">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) =>
                                            setRememberMe(
                                                e.target.checked
                                            )
                                        }
                                    />

                                    <span>Remember me</span>
                                </label>

                                <Link to="/forgot-password">
                                    Forgot Password?
                                </Link>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className="login-button"
                                disabled={loading}
                            >
                                {loading
                                    ? "Signing in..."
                                    : "Sign In"}
                            </button>
                        </form>

                        <div className="signup-link">
                            Don't have an account?{" "}
                            <Link to="/signup">
                                Create Account
                            </Link>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}

export default Login;