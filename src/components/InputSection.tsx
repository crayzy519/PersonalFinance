import { ReactNode } from 'react';

interface InputSectionProps {
  title: string;
  children: ReactNode;
}

export function InputSection({ title, children }: InputSectionProps) {
  return (
    <section className="card">
      <h2>{title}</h2>
      <div className="grid">{children}</div>
    </section>
  );
}
