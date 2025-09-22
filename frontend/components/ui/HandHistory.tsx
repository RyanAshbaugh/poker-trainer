import React from 'react';

type Props = { history: { street: string; text: string }[] | undefined };

export function HandHistory({ history }: Props) {
  if (!history || history.length === 0) return null;
  return (
    <div style={{ fontFamily: 'monospace', fontSize: 12, paddingTop: 8 }}>
      {history.map((h, i) => (
        <div key={i}>{h.text}</div>
      ))}
    </div>
  );
}


