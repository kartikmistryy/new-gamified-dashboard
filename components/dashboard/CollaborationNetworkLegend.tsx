export function CollaborationNetworkLegend() {
  return (
    <div className="w-20 shrink-0 pb-2 pt-3">
      <h3 className="mb-3 text-right text-sm font-semibold leading-tight text-slate-600">
        Total DOA
        <br />
        (normalized)
      </h3>
      <div className="flex items-stretch justify-end gap-2">
        <div
          className="h-[472px] w-8 rounded-sm border border-slate-300"
          style={{
            background:
              "linear-gradient(to top, #440154 0%, #414487 20%, #2a788e 40%, #22a884 60%, #7ad151 80%, #fde725 100%)",
          }}
        />
        <div className="flex h-[472px] flex-col justify-between text-right text-xs font-medium text-slate-600">
          <span>1.0</span>
          <span>0.9</span>
          <span>0.8</span>
          <span>0.7</span>
          <span>0.6</span>
          <span>0.5</span>
          <span>0.4</span>
          <span>0.3</span>
          <span>0.2</span>
          <span>0.1</span>
        </div>
      </div>
    </div>
  );
}
