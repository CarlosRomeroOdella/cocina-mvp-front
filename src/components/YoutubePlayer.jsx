import { useState } from "react";

function toEmbedUrl(url) {
  if (!url) return null;
  const watch = url.match(/[?&]v=([^&]+)/);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}?autoplay=1`;
  const list = url.match(/[?&]list=([^&]+)/);
  if (list) return `https://www.youtube.com/embed/videoseries?list=${list[1]}&autoplay=1`;
  const short = url.match(/youtu\.be\/([^?]+)/);
  if (short) return `https://www.youtube.com/embed/${short[1]}?autoplay=1`;
  if (url.includes("/embed/")) return url;
  return null;
}

export default function YoutubePlayer({ url }) {
  const [minimized, setMinimized] = useState(false);
  const [closed, setClosed]       = useState(false);

  const embedUrl = toEmbedUrl(url);
  console.log("[YoutubePlayer] url=", url, "embedUrl=", embedUrl);
  if (!embedUrl || closed) return null;

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed bottom-4 right-4 z-50 w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-xl flex items-center justify-center transition-all"
        title="Abrir reproductor"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M21.582 6.186a2.506 2.506 0 0 0-1.765-1.77C18.265 4 12 4 12 4s-6.265 0-7.817.416a2.506 2.506 0 0 0-1.765 1.77C2 7.742 2 12 2 12s0 4.258.418 5.814a2.506 2.506 0 0 0 1.765 1.77C5.735 20 12 20 12 20s6.265 0 7.817-.416a2.506 2.506 0 0 0 1.765-1.77C22 16.258 22 12 22 12s0-4.258-.418-5.814zM10 15.464V8.536L16 12l-6 3.464z"/>
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-black" style={{ width: 280 }}>
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-900">
        <span className="text-xs text-gray-300 font-medium flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-red-500" fill="currentColor">
            <path d="M21.582 6.186a2.506 2.506 0 0 0-1.765-1.77C18.265 4 12 4 12 4s-6.265 0-7.817.416a2.506 2.506 0 0 0-1.765 1.77C2 7.742 2 12 2 12s0 4.258.418 5.814a2.506 2.506 0 0 0 1.765 1.77C5.735 20 12 20 12 20s6.265 0 7.817-.416a2.506 2.506 0 0 0 1.765-1.77C22 16.258 22 12 22 12s0-4.258-.418-5.814zM10 15.464V8.536L16 12l-6 3.464z"/>
          </svg>
          Lo que cocina escucha
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => setMinimized(true)} className="text-gray-400 hover:text-white p-1 rounded transition-colors" title="Minimizar">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" d="M20 12H4"/>
            </svg>
          </button>
          <button onClick={() => setClosed(true)} className="text-gray-400 hover:text-white p-1 rounded transition-colors" title="Cerrar">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" d="M6 6l12 12M6 18L18 6"/>
            </svg>
          </button>
        </div>
      </div>
      <iframe
        src={embedUrl}
        width="280"
        height="157"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="block"
      />
    </div>
  );
}
