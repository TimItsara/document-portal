import { useState, useRef } from "react";
import { login, signup } from "../api";
import Footer from "./Footer";
import PasswordInput from "./PasswordInput";
import { UserIcon, LockIcon, ErrorCircleIcon, UploadIcon, CameraIcon } from "./Icons";

export default function LoginPage({ onLogin }: { onLogin: (token: string) => void }) {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState<Record<string, string>>({});

  // Refs for file input and camera
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // File upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Camera handlers
  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setError("Camera access denied.");
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx?.drawImage(videoRef.current, 0, 0);
    setPhoto(canvasRef.current.toDataURL("image/jpeg"));
    stopCamera();
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setShowCamera(false);
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!username.trim()) errors.username = "Username is required";
    if (!password) errors.password = "Password is required";
    if (isSignup && password.length < 6) errors.password = "Password must be at least 6 characters";
    if (isSignup && password !== confirm) errors.confirm = "Passwords do not match";
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldError({});
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldError(errors);
      return;
    }
    setLoading(true);
    try {
      const res = isSignup
        ? await signup(username, password, photo || undefined)
        : await login(username, password);
      onLogin(res.data.token);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      {/* ── SECTION 1: Login form ── */}
      <div className="w-full flex flex-col items-center justify-center px-4 py-16 bg-white">
        {/* Logo */}
        <div className="flex flex-col items-center gap-1 mb-6">
          <img src="/truuth-tran-crop.png" alt="Truuth" className="h-10 object-contain" />
          <p
            className="text-xs tracking-widest uppercase font-semibold mt-1"
            style={{ color: "#515170" }}
          >
            User Portal
          </p>
        </div>

        {/* Title */}
        <div className="text-center space-y-1 mb-6">
          <h1 className="text-2xl font-bold" style={{ color: "#20203A" }}>
            {isSignup ? "Create your account" : "Sign in to your account"}
          </h1>
          <p className="text-sm" style={{ color: "#70708F" }}>
            {isSignup
              ? "Fill in your details to get started"
              : "Enter your credentials to access the portal"}
          </p>
        </div>

        {/* Global error */}
        {error && (
          <div
            className="w-full max-w-md mb-4 rounded-xl px-4 py-3 text-sm flex items-center gap-2"
            style={{
              background: "#FEE2E2",
              border: "1px solid rgba(220,38,38,0.2)",
              color: "#DC2626",
            }}
          >
            <ErrorCircleIcon />
            {error}
          </div>
        )}

        {/* Card */}
        <div
          className="bg-white rounded-2xl w-full max-w-md p-8 space-y-5"
          style={{ border: "1px solid #E1E1EA", boxShadow: "0px 1px 3px rgba(0,0,0,0.1)" }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-1">
              <label className="text-sm font-medium" style={{ color: "#374151" }}>
                Username or Email
              </label>
              <div className="relative">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#70708F" }}
                >
                  <UserIcon />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username or email"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
                  style={{ border: `1px solid ${fieldError.username ? "#DC2626" : "#D0D0DD"}` }}
                />
              </div>
              {fieldError.username && (
                <p className="text-xs flex items-center gap-1" style={{ color: "#DC2626" }}>
                  <ErrorCircleIcon size={12} />
                  {fieldError.username}
                </p>
              )}
            </div>

            {/* Password */}
            <PasswordInput
              label="Password"
              value={password}
              onChange={setPassword}
              placeholder="Enter your password"
              error={fieldError.password}
            />

            {/* Confirm Password (signup only) */}
            {isSignup && (
              <PasswordInput
                label="Confirm Password"
                value={confirm}
                onChange={setConfirm}
                placeholder="Confirm your password"
                error={fieldError.confirm}
              />
            )}

            {/* Profile photo (signup only) */}
            {isSignup && (
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: "#374151" }}>
                  Profile Photo{" "}
                  <span className="font-normal" style={{ color: "#70708F" }}>
                    (optional)
                  </span>
                </label>

                {/* Photo preview */}
                {photo && (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <img
                      src={photo}
                      alt="preview"
                      className="w-20 h-20 rounded-full object-cover"
                      style={{ border: "2px solid #8C07DD" }}
                    />
                    <button
                      type="button"
                      onClick={() => setPhoto(null)}
                      className="text-xs font-medium cursor-pointer hover:underline"
                      style={{ color: "#DC2626" }}
                    >
                      Remove photo
                    </button>
                  </div>
                )}

                {/* Camera view */}
                {showCamera && (
                  <div className="space-y-2">
                    <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl" />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="flex-1 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors"
                        style={{
                          border: "1.5px solid #8C07DD",
                          color: "#8C07DD",
                          background: "white",
                        }}
                      >
                        📸 Capture
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="flex-1 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors"
                        style={{
                          border: "1px solid #D0D0DD",
                          color: "#70708F",
                          background: "white",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload / Camera buttons (shown when no photo and camera is off) */}
                {!photo && !showCamera && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                      style={{
                        border: "1.5px solid #8C07DD",
                        color: "#8C07DD",
                        background: "white",
                      }}
                    >
                      <UploadIcon size={15} />
                      Upload Photo
                    </button>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="flex-1 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                      style={{
                        border: "1.5px solid #8C07DD",
                        color: "#8C07DD",
                        background: "white",
                      }}
                    >
                      <CameraIcon size={15} />
                      Use Camera
                    </button>
                  </div>
                )}

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}

            {/* Remember me + Forgot (login only) */}
            {!isSignup && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded cursor-pointer"
                    style={{ accentColor: "#8C07DD" }}
                  />
                  <span className="text-sm" style={{ color: "#6B7280" }}>
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  className="text-sm font-medium cursor-pointer hover:underline"
                  style={{ color: "#8C07DD" }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-bold text-white transition-opacity disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              style={{ background: "#8C07DD" }}
            >
              {loading ? "Please wait..." : isSignup ? "Create Account" : "Sign in"}
            </button>
          </form>

          {/* Divider (login only) */}
          {!isSignup && (
            <>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: "#E1E1EA" }} />
                <span className="text-xs" style={{ color: "#70708F" }}>
                  Alternative access
                </span>
                <div className="flex-1 h-px" style={{ background: "#E1E1EA" }} />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm" style={{ color: "#70708F" }}>
                  Submitting documents on behalf of an applicant?
                </p>
                <button
                  className="text-sm font-semibold hover:underline cursor-pointer"
                  style={{ color: "#8C07DD" }}
                >
                  Sign in as a submitter →
                </button>
              </div>
            </>
          )}

          {/* Toggle signup/login */}
          <p className="text-center text-sm" style={{ color: "#70708F" }}>
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
                setFieldError({});
                setUsername("");
                setPassword("");
                setConfirm("");
                setPhoto(null);
                stopCamera();
              }}
              className="font-semibold hover:underline cursor-pointer"
              style={{ color: "#8C07DD" }}
            >
              {isSignup ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>

        {/* Secure badge */}
        <p className="text-xs mt-4 flex items-center gap-1.5" style={{ color: "#70708F" }}>
          <LockIcon size={13} />
          Your connection is secure and encrypted
        </p>
      </div>

      {/* ── SECTION 2: Info cards ── */}
      <div
        className="w-full"
        style={{ background: "linear-gradient(90deg, #FAF5FF 0%, #FDF2F8 100%)" }}
      >
        <div className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* BioPass card */}
          <div
            className="bg-white rounded-2xl p-10 space-y-6"
            style={{ boxShadow: "0px 4px 6px -1px rgba(0,0,0,0.1)" }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ background: "#F3E2F8" }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#8C07DD"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold" style={{ color: "#20203A" }}>
                How the BioPass MFA Works?
              </h3>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#70708F" }}>
              Our biometric verification process is designed to be simple, secure, and fast
            </p>
            <div className="space-y-5">
              {[
                {
                  n: 1,
                  title: "Scan the QR Code",
                  desc: "Scan the QR code shown on the screen (if done through desktop/laptop)",
                },
                {
                  n: 2,
                  title: "Capture",
                  desc: "Allow camera access and follow on-screen instructions for facial capture",
                },
                {
                  n: 3,
                  title: "Verify",
                  desc: "Receive instant confirmation once your identity has been successfully verified",
                },
              ].map((step) => (
                <div key={step.n} className="flex items-start gap-4">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ background: "#8C07DD" }}
                  >
                    {step.n}
                  </div>
                  <div className="pt-1 space-y-0.5">
                    <p className="text-base font-semibold" style={{ color: "#20203A" }}>
                      {step.title}
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: "#70708F" }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Support card */}
          <div
            className="bg-white rounded-2xl p-10 flex flex-col items-center justify-center text-center space-y-5"
            style={{ boxShadow: "0px 4px 6px -1px rgba(0,0,0,0.1)" }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "#F3E2F8" }}
            >
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8C07DD"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: "#20203A" }}>
                Need Additional Help?
              </h3>
              <p className="text-sm mt-1 leading-relaxed" style={{ color: "#70708F" }}>
                Our support team is ready to assist you with any questions or concerns
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold" style={{ color: "#20203A" }}>
                Email Support
              </p>
              <p className="text-sm" style={{ color: "#70708F" }}>
                Get detailed assistance via email from our dedicated support team
              </p>
              <a
                href="mailto:help@truuth.id"
                className="text-base font-semibold hover:underline block"
                style={{ color: "#8C07DD" }}
              >
                help@truuth.id
              </a>
            </div>
            <div className="flex items-center gap-2">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8C07DD"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <p className="text-sm" style={{ color: "#70708F" }}>
                Response within 24 hours
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}
