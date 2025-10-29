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
        <h2>Craig Groeschel // Four Keys to Spot the Talent Others Miss</h2>
        <CopyableUrl url="https://www.youtube.com/embed/MboelLe1reM" />
        <iframe 
          width="560" 
          height="315" 
          src="https://www.youtube.com/embed/MboelLe1reM" 
          frameBorder="0" 
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
          style={{ maxWidth: '100%', width: '100%', aspectRatio: '16/9' }}
        />
        <hr style={{ margin: '2rem 0' }} />
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2>John Maxwell // Leadership Podcast</h2>
        <CopyableUrl url="https://embed.podcasts.apple.com/us/podcast/love-respect-podcast-relationships-marriage-theology/id897327904" />
        <iframe 
          allow="autoplay *; encrypted-media *; fullscreen *" 
          frameBorder="0" 
          height="450" 
          style={{ width: '100%', maxWidth: '660px', overflow: 'hidden', background: 'transparent' }}
          sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation" 
          src="https://embed.podcasts.apple.com/us/podcast/love-respect-podcast-relationships-marriage-theology/id897327904"
        />
        <hr style={{ margin: '2rem 0' }} />
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2>Leading Second // Being an Unoffendable Leader</h2>
        <CopyableUrl url="https://embed.podcasts.apple.com/us/podcast/season-one-ep-021-brandon-stewart-joshua-bingle-on/id1352176626?i=1000422094335" />
        <iframe 
          allow="autoplay *; encrypted-media *; fullscreen *" 
          frameBorder="0" 
          height="175" 
          style={{ width: '100%', maxWidth: '660px', overflow: 'hidden', background: 'transparent' }}
          sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation" 
          src="https://embed.podcasts.apple.com/us/podcast/season-one-ep-021-brandon-stewart-joshua-bingle-on/id1352176626?i=1000422094335"
        />
        <hr style={{ margin: '2rem 0' }} />
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2>Leading Second // How to Lead When You're Not in Charge</h2>
        <CopyableUrl url="https://embed.podcasts.apple.com/us/podcast/season-two-ep-027-clay-scroggins-on-how-to-lead-when/id1352176626?i=1000428879821" />
        <iframe 
          allow="autoplay *; encrypted-media *; fullscreen *" 
          frameBorder="0" 
          height="175" 
          style={{ width: '100%', maxWidth: '660px', overflow: 'hidden', background: 'transparent' }}
          sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation" 
          src="https://embed.podcasts.apple.com/us/podcast/season-two-ep-027-clay-scroggins-on-how-to-lead-when/id1352176626?i=1000428879821"
        />
        <hr style={{ margin: '2rem 0' }} />
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2>Leading Second // John Morgan on Identifying and Protecting Our Lives and Churches from Division</h2>
        <CopyableUrl url="https://embed.podcasts.apple.com/us/podcast/season-three-ep-72-john-morgan-on-identifying-protecting/id1352176626?i=1000496488444" />
        <iframe 
          allow="autoplay *; encrypted-media *; fullscreen *" 
          frameBorder="0" 
          height="175" 
          style={{ width: '100%', maxWidth: '660px', overflow: 'hidden', background: 'transparent' }}
          sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation" 
          src="https://embed.podcasts.apple.com/us/podcast/season-three-ep-72-john-morgan-on-identifying-protecting/id1352176626?i=1000496488444"
        />
        <hr style={{ margin: '2rem 0' }} />
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2>RTPT // How to Lead in a Crisis with Dr. Sam Chand</h2>
        <CopyableUrl url="https://www.youtube.com/embed/SEe5UPVddD0" />
        <iframe 
          width="560" 
          height="315" 
          src="https://www.youtube.com/embed/SEe5UPVddD0" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
          style={{ maxWidth: '100%', width: '100%', aspectRatio: '16/9' }}
        />
        <hr style={{ margin: '2rem 0' }} />
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2>Gerald Brooks Leadership Podcast // What Paul Said About Leadership</h2>
        <CopyableUrl url="https://embed.podcasts.apple.com/us/podcast/what-paul-said-about-leadership/id1077436087?i=1000499012702" />
        <iframe 
          allow="autoplay *; encrypted-media *; fullscreen *" 
          frameBorder="0" 
          height="175" 
          style={{ width: '100%', maxWidth: '660px', overflow: 'hidden', background: 'transparent' }}
          sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation" 
          src="https://embed.podcasts.apple.com/us/podcast/what-paul-said-about-leadership/id1077436087?i=1000499012702"
        />
        <hr style={{ margin: '2rem 0' }} />
      </div>
    </div>
  );
}
