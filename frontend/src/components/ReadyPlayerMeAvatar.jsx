import React, { useEffect, useRef, useState } from 'react';
import './ReadyPlayerMeAvatar.css';

const MODEL_VIEWER_CDN = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
const CREATOR_URL = 'https://readyplayer.me/avatar?frameApi';

const ensureModelViewer = () => {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.customElements && window.customElements.get('model-viewer')) {
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    const existing = document.querySelector(`script[src="${MODEL_VIEWER_CDN}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      return;
    }
    const script = document.createElement('script');
    script.src = MODEL_VIEWER_CDN;
    script.async = true;
    script.onload = () => resolve(true);
    document.head.appendChild(script);
  });
};

const ReadyPlayerMeAvatar = ({ avatarUrl, onAvatarChange }) => {
  const [viewerReady, setViewerReady] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const frameRef = useRef(null);

  useEffect(() => {
    ensureModelViewer().then(setViewerReady);
  }, []);

  useEffect(() => {
    const receiveMessage = (event) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.source !== 'readyplayerme') return;

      if (data.eventName === 'v1.frame.ready') {
        frameRef.current?.contentWindow?.postMessage({
          target: 'readyplayerme',
          type: 'subscribe',
          eventName: 'v1.avatar.exported'
        }, '*');
      }

      if (data.eventName === 'v1.avatar.exported') {
        const url = data.data?.url;
        if (url && onAvatarChange) {
          onAvatarChange(url);
        }
        setShowCreator(false);
      }
    };

    window.addEventListener('message', receiveMessage);
    return () => window.removeEventListener('message', receiveMessage);
  }, [onAvatarChange]);

  const openCreator = () => setShowCreator(true);
  const closeCreator = () => setShowCreator(false);

  return (
    <div className="rpm-avatar-wrapper" title={avatarUrl ? 'Customize Avatar' : 'Create Avatar'}>
      {viewerReady && avatarUrl ? (
        <div onClick={openCreator}>
          <model-viewer
            src={avatarUrl}
            className="rpm-avatar-thumb"
            camera-controls
            ar
            autoplay
            exposure="0.9"
            shadow-intensity="0.5"
            interaction-prompt="none"
          />
        </div>
      ) : (
        <button className="rpm-avatar-fallback" onClick={openCreator} title="Create Avatar">🎭</button>
      )}

      {showCreator && (
        <div className="rpm-creator-overlay" role="dialog" aria-modal="true">
          <div className="rpm-creator-backdrop" onClick={closeCreator} />
          <div className="rpm-creator-modal">
            <div className="rpm-creator-header">
              <span className="rpm-creator-title">Customize Your Avatar</span>
              <button className="rpm-creator-close" onClick={closeCreator} aria-label="Close">✕</button>
            </div>
            <iframe
              ref={frameRef}
              title="Ready Player Me Avatar Creator"
              className="rpm-creator-frame"
              src={CREATOR_URL}
              allow="camera *; microphone *; clipboard-write"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadyPlayerMeAvatar;
