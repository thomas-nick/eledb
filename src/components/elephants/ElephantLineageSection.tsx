import Link from "next/link";
import type { ElephantRecord } from "@/types/elephant";
import { ElephantProfileMateCard } from "@/components/elephants/ElephantProfileMateCard";
import { Card } from "@/components/ui/Card";

interface ElephantLineageSectionProps {
  elephant: ElephantRecord;
  father: ElephantRecord | null;
  mother: ElephantRecord | null;
  offspring: ElephantRecord[];
}

function ParentSlot({
  label,
  record,
  nameFallback,
  id,
}: {
  label: string;
  record: ElephantRecord | null;
  nameFallback?: string;
  id?: string;
}) {
  if (record) {
    return <ElephantProfileMateCard elephant={record} role={label} />;
  }

  const name = nameFallback?.trim();
  if (!name || name === "—" || name.toLowerCase() === "unknown") {
    return (
      <Card className="p-5 flex flex-col justify-center items-center text-center h-full min-h-[200px] border-dashed">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-clay mb-2">{label}</p>
        <p className="text-sm text-muted">Not recorded</p>
      </Card>
    );
  }

  return (
    <Card className="p-5 flex flex-col justify-center h-full min-h-[200px]">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-clay mb-2">{label}</p>
      {id ? (
        <Link href={`/elephants/${id}`} className="font-serif text-lg font-bold text-forest hover:text-clay">
          {name}
        </Link>
      ) : (
        <p className="font-serif text-lg font-bold text-forest">{name}</p>
      )}
      <p className="text-xs text-muted mt-1">Name only — no linked record</p>
    </Card>
  );
}

export function ElephantLineageSection({
  elephant,
  father,
  mother,
  offspring,
}: ElephantLineageSectionProps) {
  const hasLineage =
    father ||
    mother ||
    elephant.fatherName ||
    elephant.motherName ||
    offspring.length > 0;

  if (!hasLineage) return null;

  return (
    <section className="mb-12">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-clay mb-2">Family</p>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-forest">Lineage</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 md:gap-3 items-stretch">
        <ParentSlot
          label="Sire"
          record={father}
          nameFallback={elephant.fatherName}
          id={elephant.fatherId}
        />
        <div className="hidden md:flex items-center justify-center text-muted text-2xl px-1" aria-hidden>
          →
        </div>
        <ElephantProfileMateCard elephant={elephant} role="This elephant" highlight />
        <div className="hidden md:flex items-center justify-center text-muted text-2xl px-1" aria-hidden>
          ←
        </div>
        <ParentSlot
          label="Dam"
          record={mother}
          nameFallback={elephant.motherName}
          id={elephant.motherId}
        />
      </div>

      {offspring.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-clay mb-4">
            Offspring ({offspring.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {offspring.map((child) => (
              <ElephantProfileMateCard key={child.id} elephant={child} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
