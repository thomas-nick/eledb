import {
  registrationSystems,
  thailandElephantAgencies,
  dataAvailability,
  publishedDatasets,
  geneticsMethods,
  scienceProcess,
  honestDisclaimer,
} from "@/data/elephantGenetics";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

const accessLabel: Record<string, string> = {
  government: "Government only",
  research: "Research / study-specific",
  none: "Not built yet",
  public: "Partially public",
};

const accessVariant: Record<string, "warning" | "info" | "danger" | "success"> = {
  government: "warning",
  research: "info",
  none: "danger",
  public: "success",
};

function PublicIndicator({ value }: { value: boolean | "partial" }) {
  if (value === true) {
    return <span className="text-green-700 font-medium">Yes</span>;
  }
  if (value === "partial") {
    return <span className="text-amber-700 font-medium">Partial</span>;
  }
  return <span className="text-muted">No</span>;
}

export function DnaExplainer() {
  return (
    <div className="space-y-16">
      {/* Three methods */}
      <div>
        <SectionTitle
          eyebrow="Two systems, one goal"
          title="Microchips, Blood DNA & Fecal DNA"
          description="Thailand runs one of the most developed captive elephant ID systems in Asia. Wild monitoring uses different tools. They're often confused — here's how they actually differ."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {Object.values(geneticsMethods).map((method) => (
            <Card key={method.title} className="p-6">
              <h4 className="font-serif text-lg font-bold text-forest mb-2">
                {method.title}
              </h4>
              <p className="text-sm text-clay font-medium mb-3">{method.usedFor}</p>
              <ul className="space-y-1 mb-4">
                {method.pros.map((pro) => (
                  <li key={pro} className="text-xs text-muted flex gap-2">
                    <span className="text-sage">+</span> {pro}
                  </li>
                ))}
                {method.cons.map((con) => (
                  <li key={con} className="text-xs text-muted flex gap-2">
                    <span className="text-clay">−</span> {con}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted leading-relaxed border-t border-border pt-3">
                {method.context}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Registration systems */}
      <div>
        <SectionTitle
          eyebrow="Thailand & ASEAN"
          title="Registration & DNA Systems"
          description="What's actually in place — and who holds the data."
        />
        <div className="space-y-4 mt-8">
          {registrationSystems.map((system) => (
            <Card key={system.id} className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <h4 className="font-serif text-lg font-bold text-forest">
                  {system.name}
                </h4>
                <Badge variant={accessVariant[system.access]}>
                  {accessLabel[system.access]}
                </Badge>
              </div>
              <p className="text-sm text-muted leading-relaxed mb-3">
                {system.purpose}
              </p>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-3">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-clay">
                    Method
                  </dt>
                  <dd className="text-muted mt-0.5">{system.method}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-clay">
                    Scope
                  </dt>
                  <dd className="text-muted mt-0.5">{system.scope}</dd>
                </div>
              </dl>
              <p className="text-sm text-forest/80 bg-forest/5 rounded-lg p-3">
                {system.accessNote}
              </p>
              {system.agencies && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {system.agencies.map((agency) => (
                    <span
                      key={agency}
                      className="text-xs px-2 py-0.5 rounded-full bg-sage/10 text-forest"
                    >
                      {agency}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Thailand agencies */}
      <div>
        <SectionTitle
          eyebrow="Who runs it"
          title="Thailand's Elephant Agencies"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          {thailandElephantAgencies.map((agency) => (
            <Card key={agency.name} className="p-5">
              <h4 className="font-semibold text-forest text-sm mb-1">
                {agency.url ? (
                  <a
                    href={agency.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-clay transition-colors"
                  >
                    {agency.name} ↗
                  </a>
                ) : (
                  agency.name
                )}
              </h4>
              <p className="text-sm text-muted leading-relaxed">{agency.role}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Science process */}
      <div>
        <SectionTitle
          eyebrow="How it works"
          title="From Dung Pile to Conservation Decision"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          {scienceProcess.map((step) => (
            <Card key={step.step} className="p-4">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-forest text-ivory flex items-center justify-center text-sm font-bold">
                  {step.step}
                </span>
                <div>
                  <h4 className="font-semibold text-forest text-sm">{step.title}</h4>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Data availability table */}
      <div>
        <SectionTitle
          eyebrow="The honest part"
          title="What's Public vs. Locked Away"
          description="This is the gap most people don't know about. The science exists; the dashboards don't."
        />
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 pr-4 font-semibold text-forest">Data type</th>
                <th className="pb-3 pr-4 font-semibold text-forest">Held by</th>
                <th className="pb-3 pr-4 font-semibold text-forest">Public?</th>
                <th className="pb-3 font-semibold text-forest">Notes</th>
              </tr>
            </thead>
            <tbody>
              {dataAvailability.map((row) => (
                <tr key={row.data} className="border-b border-border/50">
                  <td className="py-3 pr-4 font-medium text-forest">{row.data}</td>
                  <td className="py-3 pr-4 text-muted">{row.holder}</td>
                  <td className="py-3 pr-4">
                    <PublicIndicator value={row.public} />
                  </td>
                  <td className="py-3 text-muted">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Published research */}
      <div>
        <SectionTitle
          eyebrow="What you can actually read"
          title="Published Research & Open Datasets"
        />
        <div className="space-y-4 mt-8">
          {publishedDatasets.map((dataset) => (
            <Card key={dataset.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <h4 className="font-semibold text-forest text-sm">
                  <a
                    href={dataset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-clay transition-colors"
                  >
                    {dataset.title} ↗
                  </a>
                </h4>
                <div className="flex gap-2">
                  <Badge variant="info" className="capitalize">
                    {dataset.type}
                  </Badge>
                  <Badge variant={dataset.access === "open" ? "success" : "warning"}>
                    {dataset.access}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-muted mb-2">
                {dataset.authors} ({dataset.year})
              </p>
              <p className="text-sm text-muted leading-relaxed">{dataset.summary}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Honest disclaimer */}
      <Card className="p-8 bg-forest/5 border-forest/10">
        <h3 className="font-serif text-xl font-bold text-forest mb-4">
          {honestDisclaimer.title}
        </h3>
        <ul className="space-y-2 mb-6">
          {honestDisclaimer.points.map((point) => (
            <li key={point} className="text-sm text-muted flex gap-2">
              <span className="text-clay flex-shrink-0">—</span>
              {point}
            </li>
          ))}
        </ul>
        <p className="text-sm text-forest leading-relaxed font-medium">
          {honestDisclaimer.closing}
        </p>
      </Card>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider text-clay mb-2">
        {eyebrow}
      </p>
      <h3 className="font-serif text-2xl font-bold text-forest mb-2">{title}</h3>
      {description && (
        <p className="text-muted leading-relaxed max-w-3xl">{description}</p>
      )}
    </div>
  );
}
