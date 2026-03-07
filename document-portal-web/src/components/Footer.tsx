export default function Footer() {
  return (
    <footer className="w-full" style={{ background: "#20203A" }}>
      {/* Main grid */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-4 gap-10">
        {/* Brand column */}
        <div className="space-y-4">
          {/* Logo + label */}
          <div className="flex items-center gap-2">
            <img
              src="/Light-mode.png"
              alt="Truuth"
              className="h-7 object-contain"
              //   style={{ filter: "brightness(0) invert(1)" }}
            />
            <span
              className="text-sm font-semibold"
              style={{ color: "#D0D0DD", letterSpacing: "0.005em" }}
            >
              User Portal
            </span>
          </div>

          {/* Description */}
          <p className="text-xs leading-relaxed" style={{ color: "#70708F", lineHeight: "20px" }}>
            Secure, compliant, and user-friendly application management platform.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            {[
              {
                label: "Twitter",
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                ),
              },
              {
                label: "LinkedIn",
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                ),
              },
              {
                label: "Facebook",
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                ),
              },
            ].map(({ label, icon }) => (
              <button
                key={label}
                aria-label={label}
                className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all"
                style={{
                  border: "1px solid #515170",
                  color: "#515170",
                  background: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#FFFFFF";
                  e.currentTarget.style.borderColor = "#8C07DD";
                  e.currentTarget.style.background = "rgba(140,7,221,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#515170";
                  e.currentTarget.style.borderColor = "#515170";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Product column */}
        <div className="space-y-3">
          <p className="text-sm font-semibold" style={{ color: "#FFFFFF", lineHeight: "20px" }}>
            Product
          </p>
          {["Features", "Security", "Pricing", "Updates"].map((item) => (
            <p
              key={item}
              className="text-xs cursor-pointer transition-colors"
              style={{ color: "#70708F", lineHeight: "20px" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#D0D0DD")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#70708F")}
            >
              {item}
            </p>
          ))}
        </div>

        {/* Resources column */}
        <div className="space-y-3">
          <p className="text-sm font-semibold" style={{ color: "#FFFFFF", lineHeight: "20px" }}>
            Resources
          </p>
          {["Documentation", "API Reference", "Help Center", "Status Page"].map((item) => (
            <p
              key={item}
              className="text-xs cursor-pointer transition-colors"
              style={{ color: "#70708F", lineHeight: "20px" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#D0D0DD")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#70708F")}
            >
              {item}
            </p>
          ))}
        </div>

        {/* Company column */}
        <div className="space-y-3">
          <p className="text-sm font-semibold" style={{ color: "#FFFFFF", lineHeight: "20px" }}>
            Company
          </p>
          {["About Us", "Contact", "Privacy Policy", "Terms of Service"].map((item) => (
            <p
              key={item}
              className="text-xs cursor-pointer transition-colors"
              style={{ color: "#70708F", lineHeight: "20px" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#D0D0DD")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#70708F")}
            >
              {item}
            </p>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid #515170" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs" style={{ color: "#515170", lineHeight: "20px" }}>
            © 2024 User Portal. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#515170"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <p className="text-xs" style={{ color: "#515170", lineHeight: "20px" }}>
              Powered by enterprise-grade security
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
