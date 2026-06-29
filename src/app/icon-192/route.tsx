import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

export function GET(_req: NextRequest) {
  return new ImageResponse(
    <div
      style={{
        width: "100%", height: "100%",
        background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
        borderRadius: "44px",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "120px",
      }}
    >
      🏠
    </div>,
    { width: 192, height: 192 }
  )
}
