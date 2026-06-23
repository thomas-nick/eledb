import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LOGO_SRC, SITE_NAME } from "@/lib/site";

interface LogoProps {
  className?: string;
  imageClassName?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  link?: boolean;
}

export function Logo({
  className,
  imageClassName = "h-9 w-9",
  showWordmark = false,
  wordmarkClassName,
  link = true,
}: LogoProps) {
  const content = (
    <>
      <Image
        src={LOGO_SRC}
        alt={`${SITE_NAME} — elephant and owl`}
        width={528}
        height={528}
        className={cn("rounded-sm object-contain", imageClassName)}
        priority
      />
      {showWordmark && (
        <span
          className={cn(
            "font-serif text-xl font-bold text-forest tracking-tight",
            wordmarkClassName
          )}
        >
          {SITE_NAME}
        </span>
      )}
    </>
  );

  if (!link) {
    return <div className={cn("flex items-center gap-2.5", className)}>{content}</div>;
  }

  return (
    <Link href="/" className={cn("flex items-center gap-2.5 shrink-0", className)}>
      {content}
    </Link>
  );
}
