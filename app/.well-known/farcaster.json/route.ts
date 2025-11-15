import { NextResponse } from "next/server";
import { APP_URL } from "../../../lib/constants";

export async function GET() {
  const farcasterConfig = {
    // TODO: Add your own account association
    // {

    "accountAssociation": {
      "header": "eyJmaWQiOjEzMTcwNzEsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg5REZDMjIyZDc4NDg1QjgzRTQ4OWEwNENBZDU2NDE3QWFBOTI0NzY4In0",
      "payload": "eyJkb21haW4iOiJmcmFwZWQtbmZ0LnZlcmNlbC5hcHAifQ",
      "signature": "HZIXbig06Wi78aWVtnAfiItSr4o5/Req/+8ntViPEZ4iSB/qpkq91UBwCQflmlqIZ78s7O4ao+LyhAip9lmK3Bs="
        },
    // },
    frame: {
      version: "1",
      name: "Ape Run",
      iconUrl: `${APP_URL}/images/icon.png`,
      homeUrl: `${APP_URL}`,
      imageUrl: `${APP_URL}/images/feed.png`,
      screenshotUrls: [],
      tags: ["nft", "farcaster", "mint", "FarApe"],
      primaryCategory: "social",
      buttonTitle: "Launch Ape Run",
      splashImageUrl: `${APP_URL}/images/splash.png`,
      splashBackgroundColor: "#0f172a",
      webhookUrl: `${APP_URL}/api/webhook`,
      requiredChains: ["eip155:42161"],
    },
    "baseBuilder": {
      "allowedAddresses": ["0xE7503b8d192DcE2895327878ECE5a0a401821a66"]
    }
  };

  return NextResponse.json(farcasterConfig);
}
