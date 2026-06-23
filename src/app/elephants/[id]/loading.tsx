import { Container } from "@/components/ui/Container";

export default function ElephantProfileLoading() {
  return (
    <div className="bg-slate-50 min-h-screen py-8 animate-pulse">
      <Container size="wide">
        <div className="h-4 w-48 bg-slate-200 rounded mb-6" />
        <div className="h-8 w-2/3 max-w-md bg-slate-200 rounded mb-4" />
        <div className="aspect-[16/5] bg-slate-200 rounded-xl mb-5" />
        <div className="grid grid-cols-4 gap-px rounded-lg border border-slate-200 overflow-hidden mb-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 bg-white" />
          ))}
        </div>
        <div className="h-20 bg-white rounded-lg border border-slate-200 mb-8" />
        <div className="h-10 w-full bg-slate-200 rounded mb-6" />
        <div className="space-y-4">
          <div className="h-32 bg-white rounded-lg border border-slate-200" />
          <div className="h-48 bg-white rounded-lg border border-slate-200" />
        </div>
      </Container>
    </div>
  );
}
