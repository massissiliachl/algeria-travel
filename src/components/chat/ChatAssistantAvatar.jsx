import React, { useId } from 'react';
import './ChatAssistantAvatar.css';

export default function ChatAssistantAvatar({
  speaking = false,
  size = 52,
  variant = 'default',
  className = '',
}) {
  const uid = useId().replace(/:/g, '');
  const isHero = variant === 'hero';

  return (
    <span
      className={[
        'chat-assistant-avatar',
        isHero && 'chat-assistant-avatar--hero',
        speaking && 'chat-assistant-avatar--speaking',
        className,
      ].filter(Boolean).join(' ')}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {speaking && (
        <>
          <span className="chat-assistant-avatar__glow" />
          <span className="chat-assistant-avatar__waves">
            <span /><span /><span />
          </span>
          <span className="chat-assistant-avatar__bars" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} style={{ animationDelay: `${i * 0.08}s` }} />
            ))}
          </span>
        </>
      )}
      <svg viewBox="0 0 120 120" className="chat-assistant-avatar__svg" role="presentation">
        <defs>
          <linearGradient id={`${uid}-ring`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e8b88a" />
            <stop offset="45%" stopColor="#d4844a" />
            <stop offset="100%" stopColor="#c25d3a" />
          </linearGradient>
          <linearGradient id={`${uid}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3a7a96" />
            <stop offset="100%" stopColor="#0f2c3a" />
          </linearGradient>
          <linearGradient id={`${uid}-hijab`} x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#4a9bb5" />
            <stop offset="40%" stopColor="#1b3a4b" />
            <stop offset="100%" stopColor="#0a1f28" />
          </linearGradient>
          <linearGradient id={`${uid}-skin`} x1="35%" y1="0%" x2="65%" y2="100%">
            <stop offset="0%" stopColor="#f5dcc4" />
            <stop offset="100%" stopColor="#c9926a" />
          </linearGradient>
          <radialGradient id={`${uid}-cheek`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e8a088" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#e8a088" stopOpacity="0" />
          </radialGradient>
          <filter id={`${uid}-soft`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx="60" cy="60" r="56" fill={`url(#${uid}-bg)`} />
        <circle cx="60" cy="60" r="56" fill="none" stroke={`url(#${uid}-ring)`} strokeWidth="2.5" opacity="0.85" />

        <ellipse cx="60" cy="78" rx="38" ry="28" fill={`url(#${uid}-hijab)`} />
        <path
          d="M18 48 C24 22, 96 22, 102 48 C106 58, 98 82, 60 88 C22 82, 14 58, 18 48 Z"
          fill={`url(#${uid}-hijab)`}
        />
        <path
          d="M28 42 C34 28, 86 28, 92 42 L88 36 C82 24, 38 24, 32 36 Z"
          fill="#d4844a"
          opacity="0.9"
        />

        <ellipse cx="60" cy="54" rx="24" ry="26" fill={`url(#${uid}-skin)`} />
        <ellipse cx="42" cy="62" rx="8" ry="6" fill={`url(#${uid}-cheek)`} />
        <ellipse cx="78" cy="62" rx="8" ry="6" fill={`url(#${uid}-cheek)`} />

        <path
          d="M44 46 C48 42, 52 41, 56 42"
          fill="none"
          stroke="#5c3018"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M64 42 C68 41, 72 42, 76 46"
          fill="none"
          stroke="#5c3018"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <ellipse cx="50" cy="50" rx="3" ry="3.8" fill="#2a1510" />
        <ellipse cx="70" cy="50" rx="3" ry="3.8" fill="#2a1510" />
        <circle cx="51.2" cy="48.8" r="1" fill="#fff" opacity="0.85" />
        <circle cx="71.2" cy="48.8" r="1" fill="#fff" opacity="0.85" />

        <path
          className="chat-assistant-avatar__smile"
          d="M48 62 Q60 70 72 62"
          fill="none"
          stroke="#9a5030"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <ellipse
          className="chat-assistant-avatar__mouth"
          cx="60"
          cy="64"
          rx="6"
          ry="3"
          fill="#a84840"
        />

        <circle cx="38" cy="58" r="3" fill={`url(#${uid}-ring)`} opacity="0.95" />
        <path d="M38 58 L38 64" stroke={`url(#${uid}-ring)`} strokeWidth="1.2" />

        <path
          d="M94 38 L98 44 L94 50"
          fill="none"
          stroke="#d4844a"
          strokeWidth="1.5"
          opacity="0.6"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
