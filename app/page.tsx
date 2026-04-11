"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Solo redirigimos si estamos físicamente en la raíz "/"
    // Si la URL es algo como "/visor-vuelo/123" pero el servidor sirvió index.html por fallback,
    // NO redirigimos, para dejar que el router de Next.js encuentre la ruta correcta.
    if (pathname === "/") {
      router.replace("/login");
    }
  }, [pathname, router]);

  return null;
}
