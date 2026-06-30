"use client";

import React from "react";

export default function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F4EF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "4px solid #C7CAB6",
            borderTopColor: "#63807B",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }}
        />
        <p style={{ color: "#7D9185", fontSize: "13px", fontWeight: 600 }}>Loading...</p>
      </div>
    </div>
  );
}
