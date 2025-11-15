import { useEffect, useRef } from "react";
import { AUDIO_URLS } from "@/lib/constants";

export function useAudio() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const swipeBufferRef = useRef<AudioBuffer | undefined>();
  const collectBufferRef = useRef<AudioBuffer | undefined>();

  useEffect(() => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = audioContext;

    async function loadSound(url: string) {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      return await audioContext.decodeAudioData(arrayBuffer);
    }

    Promise.all([loadSound(AUDIO_URLS.swipe), loadSound(AUDIO_URLS.collect)])
      .then(([swipe, collect]) => {
        swipeBufferRef.current = swipe;
        collectBufferRef.current = collect;
      })
      .catch(() => {});
  }, []);

  const playSound = (buffer?: AudioBuffer, isMuted?: boolean) => {
    if (isMuted || !buffer || !audioContextRef.current) return;
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume().catch(() => {});
    }
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.start(0);
  };

  return {
    playSwipe: (isMuted: boolean) => playSound(swipeBufferRef.current, isMuted),
    playCollect: (isMuted: boolean) => playSound(collectBufferRef.current, isMuted),
  };
}

