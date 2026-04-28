'use client';
import { useState, useCallback } from 'react';

/**
 * Simple toast/message hook.
 * Returns { msg, msgType, showMsg }
 */
export function useToast() {
  const [msg, setMsg]         = useState('');
  const [msgType, setMsgType] = useState('info'); // 'info' | 'success' | 'error'

  const showMsg = useCallback((text, type = 'info', duration = 2500) => {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(''), duration);
  }, []);

  return { msg, msgType, showMsg };
}
