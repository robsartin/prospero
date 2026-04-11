import type { ReactNode } from "react";

interface HeaderProps {
  children?: ReactNode;
}

export default function Header({ children }: HeaderProps) {
  return (
    <header className="bg-zinc-900 text-white px-4 py-3 flex items-center justify-between">
      <h1 className="text-xl font-bold tracking-tight">Prospero</h1>
      <div>{children}</div>
    </header>
  );
}
