import { NextResponse } from "next/server";
import { APP_URL } from "../../../lib/constants";

export async function GET() {
  const farcasterConfig = {

    "accountAssociation": {
    "header": "eyJmaWQiOjEzMTcwNzEsInR5cGUiOiJhdXRoIiwia2V5IjoiMHhiNmVEMzEzZEMzMWZjNjBEMzhDQTQ5MGYzMDYxNzk5NzkzQzE3NWEwIn0",
    "payload": "eyJkb21haW4iOiJmYXJhcGUtcHJvamVjdC1tdS52ZXJjZWwuYXBwIn0",
    "signature": "j1IKTdtCjwAyFE1thYehHpbmPFbOkEn865vFT0/SXQdIityZDa+t9KhHl1K0FkApLgnR/zQeoZF3mmJZM1zXERs="
        },
    // },
    frame: {
      version: "1",
      name: "Apex Runner",
      iconUrl: `${APP_URL}/images/icon.png`,
      homeUrl: `${APP_URL}`,
      imageUrl: `${APP_URL}/images/feed.png`,
      screenshotUrls: [],
      tags: ["game", "farcaster", "apexrunner", "ApexRunner"],
      primaryCategory: "games",
      buttonTitle: "Launch Apex Runner",
      splashImageUrl: `${APP_URL}/images/splash.png`,
      splashBackgroundColor: "#0f172a",
      webhookUrl: `${APP_URL}/api/webhook`,
      requiredChains: ["eip155:42161"],
    },
    "baseBuilder": {
      "allowedAddresses": ["0xE7503b8d192DcE2895327878ECE5a0a401821a66"],
      "ownerAddress": "0x721f07F9E4b5b2D522D0D657cCEebfb64487d8DC"
     
    }
  };

  return NextResponse.json(farcasterConfig);
}
