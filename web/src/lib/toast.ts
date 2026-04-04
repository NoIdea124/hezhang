let toastTimer: ReturnType<typeof setTimeout> | null = null;
let exitTimer: ReturnType<typeof setTimeout> | null = null;

export type ToastType = 'info' | 'success' | 'warning' | 'error';

const ICONS: Record<ToastType, string> = {
  info: '',
  success: '\u2713',
  warning: '!',
  error: '\u2717',
};

const ICON_COLORS: Record<ToastType, string> = {
  info: '',
  success: '#66BB6A',
  warning: '#FFA726',
  error: '#EF5350',
};

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

export function showToast(messageOrOpts: string | ToastOptions, duration = 2000) {
  const opts: ToastOptions =
    typeof messageOrOpts === 'string'
      ? { message: messageOrOpts, duration }
      : messageOrOpts;

  const msg = opts.message;
  const type = opts.type ?? 'info';
  const dur = opts.duration ?? duration;

  // Clean up existing toast
  const existing = document.getElementById('app-toast');
  if (existing) existing.remove();
  if (toastTimer) clearTimeout(toastTimer);
  if (exitTimer) clearTimeout(exitTimer);

  const el = document.createElement('div');
  el.id = 'app-toast';

  // Build content
  const icon = ICONS[type];
  if (icon) {
    const iconSpan = document.createElement('span');
    iconSpan.textContent = icon;
    Object.assign(iconSpan.style, {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      backgroundColor: ICON_COLORS[type],
      color: '#fff',
      fontSize: '12px',
      fontWeight: '700',
      marginRight: '8px',
      flexShrink: '0',
    });
    el.appendChild(iconSpan);
  }

  const textSpan = document.createElement('span');
  textSpan.textContent = msg;
  el.appendChild(textSpan);

  Object.assign(el.style, {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(45, 45, 58, 0.82)',
    backdropFilter: 'blur(16px) saturate(180%)',
    WebkitBackdropFilter: 'blur(16px) saturate(180%)',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: '14px',
    fontSize: '14px',
    fontWeight: '500',
    lineHeight: '1.4',
    zIndex: '99999',
    pointerEvents: 'none',
    maxWidth: '80vw',
    textAlign: 'center',
    wordBreak: 'break-word',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.18)',
    /* animation handled via globals.css #app-toast rule */
  });

  document.body.appendChild(el);

  toastTimer = setTimeout(() => {
    el.classList.add('toast-exit');
    exitTimer = setTimeout(() => {
      el.remove();
      toastTimer = null;
      exitTimer = null;
    }, 150);
  }, dur);
}
