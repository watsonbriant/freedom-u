'use client';

import { useState } from 'react';

function CopyableUrl({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div 
      onClick={handleCopy}
      style={{ 
        marginBottom: '0.5rem',
        padding: '0.5rem',
        backgroundColor: copied ? '#10b981' : '#f3f4f6',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        color: copied ? 'white' : '#374151',
        transition: 'all 0.2s',
        fontFamily: 'monospace',
        wordBreak: 'break-all'
      }}
      title={copied ? 'Copied!' : 'Click to copy'}
    >
      {copied ? '✓ Copied!' : url}
    </div>
  );
}

export default function TestPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Test Page</h1>
      <p>Embed previews below...</p>
      
      <div style={{ marginTop: '3rem' }}>
        <h2>Leading Edge // Feb 2024</h2>
        <CopyableUrl url="https://www.youtube.com/embed/4UUOmmLfydk?si=bTDpQmPPCOQQQSaO" />
        <iframe 
          width="560" 
          height="315" 
          src="https://www.youtube.com/embed/4UUOmmLfydk?si=bTDpQmPPCOQQQSaO" 
          title="YouTube video player" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowFullScreen
          style={{ maxWidth: '100%', width: '100%', aspectRatio: '16/9' }}
        />
        <hr style={{ margin: '2rem 0' }} />
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2>Leading Edge // Sep 2023</h2>
        <CopyableUrl url="https://player.vimeo.com/video/869309588?h=e0ba851e8e&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" />
        <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
          <iframe 
            src="https://player.vimeo.com/video/869309588?h=e0ba851e8e&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" 
            frameBorder="0" 
            allow="autoplay; fullscreen; picture-in-picture" 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} 
            title="Leading Edge - 9.28.23"
          />
        </div>
        <script src="https://player.vimeo.com/api/player.js" />
        <hr style={{ margin: '2rem 0' }} />
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2>Leading Edge // Mar 2023</h2>
        <CopyableUrl url="https://player.vimeo.com/video/811099463?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" />
        <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
          <iframe 
            src="https://player.vimeo.com/video/811099463?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" 
            frameBorder="0" 
            allow="autoplay; fullscreen; picture-in-picture" 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} 
            title="Leading Edge - March 2023"
          />
        </div>
        <script src="https://player.vimeo.com/api/player.js" />
        <hr style={{ margin: '2rem 0' }} />
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2>Leading Edge // Sep 2022</h2>
        <CopyableUrl url="https://player.vimeo.com/video/755325266?h=1c521da05b&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" />
        <iframe 
          src="https://player.vimeo.com/video/755325266?h=1c521da05b&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" 
          width="1920" 
          height="1080" 
          frameBorder="0" 
          allow="autoplay; fullscreen; picture-in-picture" 
          allowFullScreen 
          title="Leading Edge"
          style={{ maxWidth: '100%', width: '100%', aspectRatio: '16/9', height: 'auto' }}
        />
        <hr style={{ margin: '2rem 0' }} />
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2>Leading Edge // Jan 2022</h2>
        <CopyableUrl url="https://player.vimeo.com/video/668432782?h=59b4816fb1&title=0&byline=0&portrait=0" />
        <iframe 
          src="https://player.vimeo.com/video/668432782?h=59b4816fb1&title=0&byline=0&portrait=0" 
          width="640" 
          height="360" 
          frameBorder="0" 
          allow="autoplay; fullscreen; picture-in-picture" 
          allowFullScreen
          style={{ maxWidth: '100%', width: '100%', aspectRatio: '16/9', height: 'auto' }}
        />
        <hr style={{ margin: '2rem 0' }} />
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2>Leading Edge // May 2021</h2>
        <CopyableUrl url="https://player.vimeo.com/video/549047952?h=74c60a934b" />
        <iframe 
          src="https://player.vimeo.com/video/549047952?h=74c60a934b" 
          width="640" 
          height="360" 
          frameBorder="0" 
          allow="autoplay; fullscreen; picture-in-picture" 
          allowFullScreen
          style={{ maxWidth: '100%', width: '100%', aspectRatio: '16/9', height: 'auto' }}
        />
        <hr style={{ margin: '2rem 0' }} />
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2>Leading Edge // Jan 2021</h2>
        <CopyableUrl url="https://player.vimeo.com/video/505687879?h=3ddab167b0" />
        <iframe 
          src="https://player.vimeo.com/video/505687879?h=3ddab167b0" 
          width="640" 
          height="360" 
          frameBorder="0" 
          allow="autoplay; fullscreen; picture-in-picture" 
          allowFullScreen
          style={{ maxWidth: '100%', width: '100%', aspectRatio: '16/9', height: 'auto' }}
        />
        <hr style={{ margin: '2rem 0' }} />
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2>Leading Edge // Fall 2020</h2>
        <CopyableUrl url="https://player.vimeo.com/video/462741771" />
        <iframe 
          src="https://player.vimeo.com/video/462741771" 
          width="640" 
          height="360" 
          frameBorder="0" 
          allow="autoplay; fullscreen" 
          allowFullScreen
          style={{ maxWidth: '100%', width: '100%', aspectRatio: '16/9', height: 'auto' }}
        />
        <hr style={{ margin: '2rem 0' }} />
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2>Leading Edge // Spring 2020</h2>
        <CopyableUrl url="https://www.youtube.com/embed/AQivbWFx4yg" />
        <iframe 
          width="560" 
          height="315" 
          src="https://www.youtube.com/embed/AQivbWFx4yg" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
          style={{ maxWidth: '100%', width: '100%', aspectRatio: '16/9' }}
        />
        <hr style={{ margin: '2rem 0' }} />
      </div>
    </div>
  );
}
