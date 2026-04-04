'use client';

import { useState, useRef, useEffect } from 'react';
import { IconSend, IconMic } from '@/components/ui/icons';

interface Props {
  onSend: (message: string) => void;
  loading?: boolean;
  onVoiceResult?: (text: string) => void;
}

function getApiUrl(): string {
  if (typeof window === 'undefined') return 'http://localhost:3001/api';
  const env = process.env.NEXT_PUBLIC_API_URL;
  if (env) return env;
  return `${window.location.protocol}//${window.location.hostname}:3001/api`;
}

function hasMediaRecorder(): boolean {
  return typeof window !== 'undefined' && typeof MediaRecorder !== 'undefined';
}

// Pick a MIME type that works on the current browser
function pickMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return 'audio/webm';
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/ogg',
  ];
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  // iOS Safari often supports mp4 but isTypeSupported may lie — try mp4 as fallback
  return 'audio/mp4';
}

export default function ChatInput({ onSend, loading, onVoiceResult }: Props) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const canRecord = hasMediaRecorder();

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        // Stop all tracks to release mic
        stream.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        setIsRecording(false);
        setRecordSeconds(0);

        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (blob.size < 1000) return; // Too short, ignore

        // Send to server for transcription
        setIsTranscribing(true);
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${getApiUrl()}/stt`, {
            method: 'POST',
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
              'Content-Type': mimeType.split(';')[0], // strip codec params
            },
            body: blob,
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error((err as any).error || `STT failed: ${res.status}`);
          }

          const result = await res.json() as { text: string };
          const transcript = (result.text || '').trim();
          if (transcript) {
            onSend(transcript);
          }
        } catch (e: any) {
          console.error('STT error:', e);
          // Show error in input as hint
          setText(`[语音识别失败] ${e.message || ''}`);
        } finally {
          setIsTranscribing(false);
        }
      };

      recorder.onerror = () => {
        stream.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        setIsRecording(false);
        setRecordSeconds(0);
      };

      recorder.start(250); // collect data every 250ms
      setIsRecording(true);
      setRecordSeconds(0);

      // Timer for recording duration display
      timerRef.current = setInterval(() => {
        setRecordSeconds(s => s + 1);
      }, 1000);

      // Auto-stop after 60 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopRecording();
        }
      }, 60000);
    } catch (e: any) {
      console.error('Mic access error:', e);
      setText('[无法访问麦克风]');
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const voiceBusy = isRecording || isTranscribing;

  return (
    <div
      className="glass safe-bottom"
      style={{
        position: 'fixed',
        bottom: 64,
        left: 0,
        right: 0,
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        zIndex: 99,
        borderTop: '1px solid var(--border-light)',
      }}
    >
      {canRecord && (
        <button
          onClick={toggleRecording}
          disabled={isTranscribing || loading}
          className="pressable"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isRecording ? 'var(--danger)' : isTranscribing ? 'var(--accent-lavender)' : 'var(--bg-secondary)',
            color: voiceBusy ? '#fff' : 'var(--text-secondary)',
            border: 'none',
            cursor: isTranscribing ? 'wait' : 'pointer',
            flexShrink: 0,
            transition: 'all 0.2s',
            animation: isRecording ? 'pulse 1.5s ease-in-out infinite' : 'none',
          }}
        >
          {isTranscribing ? (
            <span style={{
              width: 16,
              height: 16,
              border: '2px solid #fff',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
          ) : (
            <IconMic size={18} />
          )}
        </button>
      )}

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-pill)',
        padding: '0 14px',
        border: `1.5px solid ${isRecording ? 'var(--danger)' : 'var(--border-light)'}`,
        transition: 'border-color var(--duration-fast)',
      }}>
        {isRecording ? (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 0',
            color: 'var(--danger)',
            fontSize: 15,
            fontWeight: 500,
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--danger)',
              animation: 'pulse 1s ease-in-out infinite',
            }} />
            正在录音 {recordSeconds}s
          </div>
        ) : isTranscribing ? (
          <div style={{
            flex: 1,
            padding: '10px 0',
            color: 'var(--text-secondary)',
            fontSize: 15,
          }}>
            识别中...
          </div>
        ) : (
          <input
            placeholder="说说你花了什么..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 15,
              padding: '10px 0',
              color: 'var(--text)',
            }}
          />
        )}
      </div>

      <button
        onClick={handleSend}
        disabled={!text.trim() || loading || voiceBusy}
        className="pressable"
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: text.trim() && !voiceBusy ? 'var(--gradient-primary)' : 'var(--border)',
          color: '#fff',
          border: 'none',
          cursor: text.trim() && !voiceBusy ? 'pointer' : 'default',
          flexShrink: 0,
          transition: 'all 0.2s',
          boxShadow: text.trim() && !voiceBusy ? '0 2px 8px rgba(255,107,107,0.3)' : 'none',
        }}
      >
        {loading ? (
          <span style={{
            width: 16,
            height: 16,
            border: '2px solid #fff',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
        ) : (
          <IconSend size={16} />
        )}
      </button>
    </div>
  );
}
