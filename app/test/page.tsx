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
        <h2>Freedom House // 1000 Hills</h2>
        <CopyableUrl url="https://www.youtube.com/embed/QmxPIHEoIj8" />
        <iframe 
          width="560" 
          height="315" 
          src="https://www.youtube.com/embed/QmxPIHEoIj8" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
          style={{ maxWidth: '100%', width: '100%', aspectRatio: '16/9' }}
        />
        <hr style={{ margin: '2rem 0' }} />
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2>Freedom House // 1000 Hills</h2>
        <CopyableUrl url="https://www.youtube.com/embed/xylXs8JmZa0" />
        <iframe 
          width="560" 
          height="315" 
          src="https://www.youtube.com/embed/xylXs8JmZa0" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
          style={{ maxWidth: '100%', width: '100%', aspectRatio: '16/9' }}
        />
        <hr style={{ margin: '2rem 0' }} />
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2>Freedom House // 1000 Hills</h2>
        <CopyableUrl url="https://www.youtube.com/embed/oYgjtC5TG7E" />
        <iframe 
          width="560" 
          height="315" 
          src="https://www.youtube.com/embed/oYgjtC5TG7E" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
          style={{ maxWidth: '100%', width: '100%', aspectRatio: '16/9' }}
        />
        <hr style={{ margin: '2rem 0' }} />
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2>Freedom House // 1000 Hills</h2>
        <CopyableUrl url="https://www.youtube.com/embed/kkIUxMeF6GA" />
        <iframe 
          width="560" 
          height="315" 
          src="https://www.youtube.com/embed/kkIUxMeF6GA" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
          style={{ maxWidth: '100%', width: '100%', aspectRatio: '16/9' }}
        />
        <hr style={{ margin: '2rem 0' }} />
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2>Freedom House // First Things First</h2>
        <CopyableUrl url="https://www.youtube.com/embed/fS06yAU_8SU" />
        <iframe 
          width="560" 
          height="315" 
          src="https://www.youtube.com/embed/fS06yAU_8SU" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
          style={{ maxWidth: '100%', width: '100%', aspectRatio: '16/9' }}
        />
        <hr style={{ margin: '2rem 0' }} />
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2>Freedom House // First Things First</h2>
        <CopyableUrl url="https://www.youtube.com/embed/MCpPXIOO6iA" />
        <iframe 
          width="560" 
          height="315" 
          src="https://www.youtube.com/embed/MCpPXIOO6iA" 
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
