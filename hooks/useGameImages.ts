import { useEffect, useState } from "react";
import { IMAGE_URLS } from "@/lib/constants";
import type { GameImages } from "@/lib/types";

export function useGameImages() {
  const [images, setImages] = useState<GameImages | null>(null);

  useEffect(() => {
    const monkeyImg1 = new Image();
    monkeyImg1.src = IMAGE_URLS.monkeyImg1;
    const monkeyImg2 = new Image();
    monkeyImg2.src = IMAGE_URLS.monkeyImg2;
    const monkeyMiddleImg1 = new Image();
    monkeyMiddleImg1.src = IMAGE_URLS.monkeyMiddleImg1;
    const monkeyMiddleImg2 = new Image();
    monkeyMiddleImg2.src = IMAGE_URLS.monkeyMiddleImg2;
    const cloudImg1 = new Image();
    cloudImg1.src = IMAGE_URLS.cloudImg1;
    const cloudImg2 = new Image();
    cloudImg2.src = IMAGE_URLS.cloudImg2;
    const cloudImg3 = new Image();
    cloudImg3.src = IMAGE_URLS.cloudImg3;
    const userFaceImg = new Image();
    userFaceImg.src = IMAGE_URLS.userFace;

    const cloudImages = [cloudImg1, cloudImg2, cloudImg3];

    setImages({
      monkeyImg1,
      monkeyImg2,
      monkeyMiddleImg1,
      monkeyMiddleImg2,
      cloudImg1,
      cloudImg2,
      cloudImg3,
      userFaceImg,
      cloudImages,
      currentMonkeyImg: monkeyMiddleImg1,
    });
  }, []);

  return images;
}

