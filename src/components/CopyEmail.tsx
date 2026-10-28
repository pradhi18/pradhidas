import { useState } from 'react';

/** "Copy email" button: keeps the address out of plain mailto links that spam bots scrape. */
export default function CopyEmail({ email }: { email: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'show'>('idle');

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setState('copied');
      setTimeout(() => setState('idle'), 2200);
    } catch {
      setState('show'); // clipboard blocked: show the address so it can be selected
    }
  }

  return (
    <span className="copy-email">
      <button type="button" className="box small" onClick={copy} aria-live="polite">
        {state === 'copied' ? 'email copied ✿' : 'copy my email'}
      </button>
      {state === 'show' && <span className="hand shown">{email}</span>}
    </span>
  );
}
