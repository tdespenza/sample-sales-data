"use client";
import { useEffect, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DeepMetricPanel from "@/components/DeepMetricPanel";
import { DEFAULT_VISIBLE, MetricKey } from "@/data/metrics";

function SortableCard({ id, metric }: { id: string; metric: MetricKey }){
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;
  return (
    <div ref={setNodeRef} style={style} className="col-12 col-md-6 col-xl-4 mb-3">
      <div className="card">
        <div className="card-header d-flex align-items-center justify-content-between">
          <span className="text-muted small"><i className="bi bi-grip-vertical drag-handle me-2" {...listeners} {...attributes}/>Drag</span>
          <span className="badge bg-light text-dark metric-badge">{metric}</span>
        </div>
        <div className="card-body">
          <DeepMetricPanel metric={metric} />
        </div>
      </div>
    </div>
  );
}

export default function MetricGrid(){
  const [items, setItems] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<MetricKey[]>(DEFAULT_VISIBLE);

  useEffect(()=>{
    const saved = typeof window !== "undefined" ? localStorage.getItem("layout:metrics") : null;
    if (saved) setMetrics(JSON.parse(saved));
  },[]);

  useEffect(()=>{
    setItems(metrics.map((m,i)=> `${m}-${i}`));
    if (typeof window !== "undefined")
      localStorage.setItem("layout:metrics", JSON.stringify(metrics));
  },[metrics]);

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={(e)=>{
      const { active, over } = e; if (!over || active.id === over.id) return;
      const oldIndex = items.indexOf(String(active.id));
      const newIndex = items.indexOf(String(over.id));
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      const newOrder = newItems.map(it => it.split("-")[0]) as MetricKey[];
      setMetrics(newOrder);
    }}>
      <div className="row">
        <SortableContext items={items} strategy={rectSortingStrategy}>
          {items.map((id, idx)=>{
            const metric = (metrics[idx]);
            return <SortableCard key={id} id={id} metric={metric} />;
          })}
        </SortableContext>
      </div>
    </DndContext>
  );
}
