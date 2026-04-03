'use client';

import { useState, useRef } from 'react';
import { Input, Button } from 'antd-mobile';
import { SendOutline, SoundOutline } from 'antd-mobile-icons';

interface Props {
  onSend: (message: string) => void;
  loading?: boolean;
  onVoiceResult?: (text: string) => void;
}

export default function ChatInput({ onSend, loading, onVoiceResult }: Props) {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

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

  const hasSpeechAPI = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript.trim()) {
        onSend(transcript.trim());
      }
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 50,
      left: 0,
      right: 0,
      backgroundColor: 'var(--card-bg)',
      borderTop: '1px solid var(--border)',
      padding: '8px 12px',
      paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      zIndex: 99,
    }}>
      {hasSpeechAPI && (
        <div
          onClick={toggleVoice}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isListening ? 'var(--danger)' : 'var(--bg)',
            color: isListening ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.2s',
          }}
        >
          <SoundOutline fontSize={18} />
        </div>
      )}

      <div style={{ flex: 1 }}>
        <Input
          placeholder="说说你花了什么..."
          value={text}
          onChange={setText}
          onKeyDown={handleKeyDown as any}
          style={{
            '--font-size': '15px',
            padding: '8px 12px',
            border: '1px solid var(--border)',
            borderRadius: 20,
            backgroundColor: 'var(--bg)',
          } as React.CSSProperties}
        />
      </div>

      <Button
        size="small"
        color="primary"
        shape="rounded"
        loading={loading}
        onClick={handleSend}
        disabled={!text.trim()}
        style={{
          width: 36,
          height: 36,
          padding: 0,
          flexShrink: 0,
        }}
      >
        {!loading && <SendOutline fontSize={16} />}
      </Button>
    </div>
  );
}
