import { useEffect, useRef, useState } from 'react';
import { interviewService } from '@/services/interviewService';

export function useInterviewIntegrity(interviewId?: string, enabled = true) {
  const [tabSwitches, setTabSwitches] = useState(0);
  const [focusLoss, setFocusLoss] = useState(0);
  const [copyEvents, setCopyEvents] = useState(0);
  const [status, setStatus] = useState<'Normal' | 'Review Recommended'>('Normal');
  const loggedRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!interviewId || !enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => {
          const next = prev + 1;
          if (next > 4) setStatus('Review Recommended');
          return next;
        });
        interviewService.logIntegrity(interviewId, {
          eventType: 'tab_switch',
          detail: 'Candidate switched tabs or minimized window',
        }).catch(() => {});
      }
    };

    const handleWindowBlur = () => {
      setFocusLoss((prev) => {
        const next = prev + 1;
        if (next > 5) setStatus('Review Recommended');
        return next;
      });
      interviewService.logIntegrity(interviewId, {
        eventType: 'focus_loss',
        detail: 'Window lost focus',
      }).catch(() => {});
    };

    const handleCopy = () => {
      setCopyEvents((prev) => prev + 1);
      interviewService.logIntegrity(interviewId, {
        eventType: 'copy_event',
        detail: 'Candidate copied text',
      }).catch(() => {});
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('copy', handleCopy);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('copy', handleCopy);
    };
  }, [interviewId, enabled]);

  return {
    tabSwitches,
    focusLoss,
    copyEvents,
    status,
  };
}
