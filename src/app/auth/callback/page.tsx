'use client';

/**
 * OAuth Callback Page
 *
 * This page handles OAuth redirects from Jira, Confluence, etc.
 * It notifies the parent window (if opened as popup) and closes itself.
 */

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, AlertCircle, Loader2 } from 'lucide-react';

function CallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'success' | 'error' | 'loading'>('loading');
  const [message, setMessage] = useState('');
  const [provider, setProvider] = useState('');

  useEffect(() => {
    // Detect which provider connected
    const jira = searchParams.get('jira');
    const confluence = searchParams.get('confluence');
    const slack = searchParams.get('slack');
    const zoom = searchParams.get('zoom');
    const error = searchParams.get('error');
    const errorMessage = searchParams.get('message');

    let detectedProvider = 'unknown';
    let detectedStatus: 'success' | 'error' = 'success';

    if (jira === 'connected') {
      detectedProvider = 'jira';
      setProvider('Jira');
      setStatus('success');
      setMessage('Jira connected successfully!');
    } else if (confluence === 'connected') {
      detectedProvider = 'confluence';
      setProvider('Confluence');
      setStatus('success');
      setMessage('Confluence connected successfully!');
    } else if (slack === 'connected') {
      detectedProvider = 'slack';
      setProvider('Slack');
      setStatus('success');
      setMessage('Slack connected successfully!');
    } else if (zoom === 'connected') {
      detectedProvider = 'zoom';
      setProvider('Zoom');
      setStatus('success');
      setMessage('Zoom connected successfully!');
    } else if (jira === 'error' || confluence === 'error' || slack === 'error' || zoom === 'error' || error) {
      detectedProvider = jira ? 'jira' : confluence ? 'confluence' : slack ? 'slack' : zoom ? 'zoom' : 'unknown';
      detectedStatus = 'error';
      setStatus('error');
      setMessage(errorMessage || 'Connection failed. Please try again.');
    } else {
      // No recognized params, might be direct navigation
      setStatus('error');
      setMessage('Invalid callback. Please try connecting again.');
    }

    // Notify parent window if this is a popup
    if (window.opener) {
      window.opener.postMessage({
        type: 'oauth-callback',
        provider: detectedProvider,
        status: detectedStatus,
        message: errorMessage || 'connected',
      }, '*');

      // Close popup after a short delay
      setTimeout(() => {
        window.close();
      }, 1500);
    }
  }, [searchParams]);

  return (
    <div className="text-center p-8 max-w-md">
      {status === 'loading' && (
        <>
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-muted-foreground">Processing...</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Check className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-xl font-semibold mb-2">{provider} Connected!</h1>
          <p className="text-muted-foreground mb-4">{message}</p>
          <p className="text-sm text-muted-foreground">
            This window will close automatically...
          </p>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/20 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-xl font-semibold mb-2">Connection Failed</h1>
          <p className="text-muted-foreground mb-4">{message}</p>
          <button
            onClick={() => window.close()}
            className="text-sm text-primary hover:underline"
          >
            Close this window
          </button>
        </>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="text-center p-8 max-w-md">
      <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
      <p className="text-muted-foreground">Processing...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Suspense fallback={<LoadingFallback />}>
        <CallbackContent />
      </Suspense>
    </div>
  );
}
