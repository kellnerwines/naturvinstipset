// Etiketten "Egen import" (BRIEF-KOMPASSEN.md, avsnitt 8). Länkar till förklaringen
// på Om oss. Inuti en annan länk (hela kortet klickbart) används `asLink={false}`,
// eftersom länkar inte får ligga i länkar.

import Link from "next/link";

export const OWN_IMPORT_HREF = "/om-oss#sa-rankar-vi";
export const OWN_IMPORT_TITLE =
  "Importeras av Kellner & Kellner, som drivs av sajtens grundare. Egen import får ingen fördel i Vinkompassen.";

export default function OwnImportBadge({ asLink = true, className = "" }: { asLink?: boolean; className?: string }) {
  const cls = `inline-block normal-case tracking-normal text-[10px] leading-none border border-[var(--fg)] px-1.5 py-[3px] rounded-sm text-[var(--fg)] whitespace-nowrap ${className}`;
  return asLink ? (
    <Link href={OWN_IMPORT_HREF} className={`${cls} hover:opacity-60 transition-opacity`} title={OWN_IMPORT_TITLE}>
      Egen import
    </Link>
  ) : (
    <span className={cls} title={OWN_IMPORT_TITLE}>
      Egen import
    </span>
  );
}
