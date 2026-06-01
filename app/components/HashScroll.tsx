"use client";

import { useEffect } from "react";

export default function HashScroll() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const id = hash.substring(1);
    let attempts = 0;
    const maxAttempts = 40;

    const tryScroll = () => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      attempts += 1;
      if (attempts < maxAttempts) {
        requestAnimationFrame(tryScroll);
      }
    };

    tryScroll();
  }, []);

  return null;
}
