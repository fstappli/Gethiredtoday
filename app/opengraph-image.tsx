import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "GetHiredToday — Free AI Resume Builder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: "#ffffff",
        }}
      >
        {/* Left panel */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "480px",
            height: "100%",
            backgroundColor: "#7EC8A8",
          }}
        >
          <div
            style={{
              fontSize: 140,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-4px",
            }}
          >
            HTA
          </div>
        </div>
        {/* Right panel */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px",
            flex: 1,
          }}
        >
          <div style={{ fontSize: 48, fontWeight: 800, color: "#1a202c", lineHeight: 1.1, marginBottom: "8px" }}>
            Your Resume Is Costing
          </div>
          <div style={{ fontSize: 48, fontWeight: 800, color: "#7EC8A8", lineHeight: 1.1, marginBottom: "24px" }}>
            You Interviews.
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#1a202c", marginBottom: "8px" }}>
            AI resume builder that beats ATS filters.
          </div>
          <div style={{ fontSize: 22, color: "#4a5568" }}>
            Just $9.99/mo — hiredtodayapp.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
