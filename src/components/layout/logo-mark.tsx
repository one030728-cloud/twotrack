import Image from "next/image";

export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/icon.svg"
      alt=""
      width={28}
      height={28}
      unoptimized
      className={className}
    />
  );
}
