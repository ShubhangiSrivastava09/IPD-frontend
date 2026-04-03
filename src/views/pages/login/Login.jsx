
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useCookie from "../../../Hooks/cookie";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import logo from "../../../assets/ipd-logo.png";
import { postRequest } from "../../../Helpers";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setCookie } = useCookie();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const token = Cookies.get("IPD");

    if (token) {
      navigate("/");
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "email" ? value.trim() : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    postRequest({
      url: "auth/login",
      cred: formData,
    })
      .then((res) => {
        setLoading(false);
        console.log("Login res:", res?.data);
        setCookie("IPD", res?.data?.accessToken, 1);
        setCookie("IPD_REFRESH", res?.data?.refreshToken, 7);
        toast.success(res?.data?.message || "Login Successful");
        navigate("/");
      })
      .catch((error) => {
        setLoading(false);

        if (error?.response?.status === 401) {
          toast.error("Invalid email or password");
          return;
        }

        toast.error(error?.response?.data?.message || "Login failed");
      });
  };

  return (
    <div
      className="min-vh-100 d-flex justify-content-center align-items-center"
      style={{
        background:
          "linear-gradient(135deg, #0b3f76 0%, #1a5fa8 50%, #0b3f76 100%)",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div
              className="card border-0 shadow-lg"
              style={{ borderRadius: "12px", overflow: "hidden" }}
            >
              {/* Top accent bar */}
              <div
                style={{
                  height: "4px",
                  background:
                    "linear-gradient(to right, #0b3f76, #1a5fa8, #0b3f76)",
                }}
              />

              <div className="card-body p-4 p-md-5 bg-white">
                {/* Logo & title */}
                <div className="text-center mb-4">
                  <img
                    src={logo}
                    alt="Hospital Logo"
                    style={{
                      height: "72px",
                      objectFit: "contain",
                      marginBottom: "12px",
                    }}
                  />
                  <h5
                    className="mb-0 fw-semibold"
                    style={{
                      color: "#0b3f76",
                      fontSize: "1rem",
                      letterSpacing: "0.01em",
                    }}
                  >
                    Hospital Management System
                  </h5>
                  <p
                    className="mb-0 text-muted"
                    style={{ fontSize: "0.78rem", marginTop: "3px" }}
                  >
                    Staff Portal — Authorized Access Only
                  </p>
                </div>

                <hr className="mb-4" style={{ borderColor: "#e8edf2" }} />

                <h6
                  className="fw-semibold mb-4 text-dark"
                  style={{ fontSize: "1rem" }}
                >
                  Sign In
                </h6>

                <form onSubmit={handleSubmit}>
                  {/* Email */}
                  <div className="mb-3">
                    <label
                      className="form-label text-secondary"
                      style={{ fontSize: "0.82rem", fontWeight: "500" }}
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter your email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      autoComplete="email"
                      style={{
                        borderColor: "#d0dae6",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        padding: "10px 14px",
                        color: "#1a1a2e",
                      }}
                    />
                  </div>

                  {/* Password */}
                  <div className="mb-4">
                    <label
                      className="form-label text-secondary"
                      style={{ fontSize: "0.82rem", fontWeight: "500" }}
                    >
                      Password
                    </label>
                    <div className="position-relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        placeholder="Enter your password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        autoComplete="current-password"
                        style={{
                          borderColor: "#d0dae6",
                          borderRadius: "8px",
                          fontSize: "0.9rem",
                          padding: "10px 44px 10px 14px",
                          color: "#1a1a2e",
                        }}
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: "absolute",
                          top: "50%",
                          right: "14px",
                          transform: "translateY(-50%)",
                          cursor: "pointer",
                          color: "#8a9bb0",
                        }}
                      >
                        {showPassword ? (
                          <FaEyeSlash size={15} />
                        ) : (
                          <FaEye size={15} />
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="btn w-100 text-white fw-semibold"
                    disabled={loading}
                    style={{
                      background: loading
                        ? "#6c8fba"
                        : "linear-gradient(to right, #0b3f76, #1a5fa8)",
                      borderRadius: "8px",
                      padding: "11px",
                      fontSize: "0.9rem",
                      border: "none",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>

                <p
                  className="text-center text-muted mt-4 mb-0"
                  style={{ fontSize: "0.72rem" }}
                >
                  © {new Date().getFullYear()} Hospital Management System. All
                  rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
