interface SectionTitleProps {
  children: string;
}

export function SectionTitle({ children }: SectionTitleProps) {
  return (
    <div className="text-foreground mb-2.5 flex items-center gap-2 text-[13px] font-bold">
      <span className="bg-primary size-1.5 rounded-full" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
