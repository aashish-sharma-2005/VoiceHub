import { useState } from "react";
import {
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    Megaphone,
    UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";

function Signup() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !formData.name ||
            !formData.email ||
            !formData.password ||
            !formData.confirmPassword
        ) {
            alert("Please fill all fields");
            return;
        }

        if (formData.password.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                "http://localhost:3000/api/auth/signup",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        password: formData.password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Unable to create account");
                return;
            }

            alert("Account created successfully. Please login.");

            navigate("/login");
        } catch (error) {
            console.error("Signup error:", error);
            alert("Unable to connect to server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-page">

            {/* LEFT BRAND SECTION */}
            <section className="signup-brand-section">

                <div className="signup-brand-content">

                    <div className="signup-brand-title">

                        <Megaphone
                            className="signup-brand-icon"
                            size={64}
                        />

                        <div>
                            <h1 className="signup-brand-name">
                                Voice<span>Hub</span>
                            </h1>

                            <p className="signup-brand-subtitle">
                                CIVIC ACTION HUB
                            </p>
                        </div>

                    </div>

                    <div className="signup-message">

                        <h2>
                            Make your voice count.
                        </h2>

                        <p>
                            Join your community, report problems,
                            share ideas, and help create positive change.
                        </p>

                    </div>

                    <div className="signup-features">

                        <div className="signup-feature">
                            <span>01</span>
                            <div>
                                <strong>Report Issues</strong>
                                <p>
                                    Tell your community about problems
                                    that need attention.
                                </p>
                            </div>
                        </div>

                        <div className="signup-feature">
                            <span>02</span>
                            <div>
                                <strong>Track Progress</strong>
                                <p>
                                    Follow your submitted issues from
                                    review to resolution.
                                </p>
                            </div>
                        </div>

                        <div className="signup-feature">
                            <span>03</span>
                            <div>
                                <strong>Create Impact</strong>
                                <p>
                                    Work together with your community
                                    for meaningful change.
                                </p>
                            </div>
                        </div>

                    </div>

                </div>

            </section>

            {/* RIGHT FORM SECTION */}
            <section className="signup-form-section">

                <div className="signup-card">

                    <div className="signup-icon">
                        <UserRound size={32} />
                    </div>

                    <div className="signup-heading">

                        <h2>
                            Create your account
                        </h2>

                        <p>
                            Join VoiceHub and make a difference
                        </p>

                    </div>

                    <form onSubmit={handleSubmit}>

                        {/* NAME */}
                        <div className="signup-form-group">

                            <label htmlFor="name">
                                Full Name
                            </label>

                            <div className="signup-input-wrapper">

                                <UserRound
                                    className="signup-input-icon"
                                    size={20}
                                />

                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>

                        {/* EMAIL */}
                        <div className="signup-form-group">

                            <label htmlFor="email">
                                Email Address
                            </label>

                            <div className="signup-input-wrapper">

                                <Mail
                                    className="signup-input-icon"
                                    size={20}
                                />

                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>

                        {/* PASSWORD */}
                        <div className="signup-form-group">

                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="signup-input-wrapper">

                                <LockKeyhole
                                    className="signup-input-icon"
                                    size={20}
                                />

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />

                                <button
                                    type="button"
                                    className="signup-password-toggle"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff size={20} />
                                    ) : (
                                        <Eye size={20} />
                                    )}
                                </button>

                            </div>

                            <small className="password-hint">
                                Password must contain at least 6 characters
                            </small>

                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div className="signup-form-group">

                            <label htmlFor="confirmPassword">
                                Confirm Password
                            </label>

                            <div className="signup-input-wrapper">

                                <LockKeyhole
                                    className="signup-input-icon"
                                    size={20}
                                />

                                <input
                                    id="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="confirmPassword"
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />

                                <button
                                    type="button"
                                    className="signup-password-toggle"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={20} />
                                    ) : (
                                        <Eye size={20} />
                                    )}
                                </button>

                            </div>

                        </div>

                        {/* SUBMIT */}
                        <button
                            type="submit"
                            className="signup-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating Account..."
                                : "Create Account"}
                        </button>

                    </form>

                    <div className="signup-divider">
                        <span></span>
                        <p>ALREADY A MEMBER?</p>
                        <span></span>
                    </div>

                    <p className="login-link-text">

                        Already have an account?{" "}

                        <Link to="/login">
                            Sign in
                        </Link>

                    </p>

                </div>

                <div className="signup-security">

                    <LockKeyhole size={16} />

                    <span>
                        Your information is securely protected
                    </span>

                </div>

            </section>

        </div>
    );
}

export default Signup;