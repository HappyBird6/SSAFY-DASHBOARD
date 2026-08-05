"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import interact from "interactjs";
import { z } from "zod";

type Kind = "bookmark" | "note" | "todo";
type Layout = { x: number; y: number; width: number; height: number; zIndex: number };
type Widget = {
  id: string; type: Kind; title: string; layout: Layout; groupId: string | null;
  locked: boolean; data: { url?: string; body?: string; done?: boolean; due?: string; priority?: string };
  createdAt: string; updatedAt: string;
};
type Group = { id: string; name: string; color: string; locked: boolean };
type Store = { version: 1; exportedAt: string; settings: { grid: number }; groups: Group[]; widgets: Widget[] };

const backupSchema = z.object({
  version: z.literal(1), exportedAt: z.string(), settings: z.object({ grid: z.number() }),
  groups: z.array(z.object({ id: z.string(), name: z.string(), color: z.string(), locked: z.boolean() })),
  widgets: z.array(z.object({
    id: z.string(), type: z.enum(["bookmark", "note", "todo"]), title: z.string(),
    layout: z.object({ x: z.number(), y: z.number(), width: z.number(), height: z.number(), zIndex: z.number() }),
    groupId: z.string().nullable(), locked: z.boolean(), data: z.object({
      url: z.string().optional(), body: z.string().optional(), done: z.boolean().optional(),
      due: z.string().optional(), priority: z.string().optional(),
    }), createdAt: z.string(), updatedAt: z.string(),
  })),
});

const now = () => new Date().toISOString();
const make = (type: Kind, title: string, x: number, y: number, data: Widget["data"]): Widget => ({
  id: crypto.randomUUID(), type, title, data, groupId: null, locked: false,
  layout: { x, y, width: type === "note" ? 320 : 280, height: type === "note" ? 230 : 190, zIndex: 1 },
  createdAt: now(), updatedAt: now(),
});
const initial: Store = {
  version: 1, exportedAt: now(), settings: { grid: 20 },
  groups: [{ id: "g-java", name: "JAVA", color: "#ffb84d", locked: false }, { id: "g-algo", name: "ALGORITHM", color: "#9d7cff", locked: false }],
  widgets: [
    { ...make("bookmark", "SSAFY GITLAB", 40, 40, { url: "https://lab.ssafy.com" }), groupId: "g-java" },
    { ...make("todo", "오늘의 학습", 360, 40, { done: false, due: new Date().toISOString().slice(0,10), priority: "HIGH" }), groupId: "g-java" },
    { ...make("note", "알고리즘 메모", 40, 270, { body: "BFS: 큐에 넣을 때 방문 처리\n시간복잡도 O(V + E)" }), groupId: "g-algo" },
    { ...make("bookmark", "SW EXPERT ACADEMY", 390, 270, { url: "https://swexpertacademy.com" }), groupId: "g-algo" },
  ],
};

function Icon({ type }: { type: Kind }) { return <span className={`kind kind-${type}`}>{type === "bookmark" ? "↗" : type === "note" ? "≡" : "✓"}</span>; }

export default function Home() {
  const [store, setStore] = useState<Store>(() => {
    if (typeof window === "undefined") return initial;
    try { const raw = localStorage.getItem("ssafy-dashboard-v1"); return raw ? backupSchema.parse(JSON.parse(raw)) : initial; }
    catch { return initial; }
  });
  const [editing, setEditing] = useState(false);
  const [modal, setModal] = useState<Kind | null>(null);
  const [grouping, setGrouping] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { localStorage.setItem("ssafy-dashboard-v1", JSON.stringify({ ...store, exportedAt: now() })); }, [store]);
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(""), 2800); return () => clearTimeout(id); }, [toast]);

  const update = (id: string, patch: Partial<Widget>) => setStore(s => ({ ...s, widgets: s.widgets.map(w => w.id === id ? { ...w, ...patch, updatedAt: now() } : w) }));
  const updateLayout = (id: string, layout: Partial<Layout>) => setStore(s => ({ ...s, widgets: s.widgets.map(w => w.id === id ? { ...w, layout: { ...w.layout, ...layout }, updatedAt: now() } : w) }));

  useEffect(() => {
    if (!editing || !canvasRef.current) return;
    const grid = store.settings.grid;
    interact(".widget:not(.locked)")
      .draggable({ allowFrom: ".drag-handle", modifiers: [interact.modifiers.snap({ targets: [interact.snappers.grid({ x: grid, y: grid })], range: Infinity })], listeners: { move(e) { const id = e.target.dataset.id; const w = store.widgets.find(v => v.id === id); if (w) updateLayout(id, { x: w.layout.x + e.dx, y: Math.max(0, w.layout.y + e.dy) }); } } })
      .resizable({ edges: { left: false, right: true, bottom: true, top: false }, modifiers: [interact.modifiers.snapSize({ targets: [interact.snappers.grid({ x: grid, y: grid })] }), interact.modifiers.restrictSize({ min: { width: 240, height: 150 } })], listeners: { move(e) { updateLayout(e.target.dataset.id, { width: e.rect.width, height: e.rect.height }); } } });
    return () => interact(".widget").unset();
  }, [editing, store.settings.grid, store.widgets]);

  const counts = useMemo(() => ({ todo: store.widgets.filter(w => w.type === "todo" && !w.data.done).length, bookmark: store.widgets.filter(w => w.type === "bookmark").length, group: store.groups.length }), [store]);
  const addWidget = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget); const type = modal!; const title = String(form.get("title") || "새 위젯");
    const data = type === "bookmark" ? { url: String(form.get("content") || "https://") } : type === "note" ? { body: String(form.get("content") || "") } : { done: false, due: String(form.get("due") || ""), priority: String(form.get("priority") || "MEDIUM") };
    setStore(s => ({ ...s, widgets: [...s.widgets, make(type, title, 80 + (s.widgets.length % 4) * 40, 80 + (s.widgets.length % 5) * 40, data)] })); setModal(null); setToast("위젯을 추가했습니다.");
  };
  const remove = (id: string) => { if (!confirm("이 위젯을 삭제할까요?")) return; const before = store.widgets.find(w => w.id === id); setStore(s => ({ ...s, widgets: s.widgets.filter(w => w.id !== id) })); setToast("삭제했습니다. 되돌리려면 Ctrl+Z 대신 백업을 활용해주세요."); if (!before) return; };
  const exportJson = () => { const blob = new Blob([JSON.stringify({ ...store, exportedAt: now() }, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `ssafy-dashboard-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(a.href); };
  const importJson = async (file?: File) => { if (!file) return; try { const parsed = backupSchema.parse(JSON.parse(await file.text())); if (!confirm("현재 데이터를 백업 파일 내용으로 교체할까요?")) return; setStore(parsed); setToast("워크스페이스를 복원했습니다."); } catch { setToast("유효하지 않은 백업 파일입니다. 기존 데이터는 유지됩니다."); } };
  const createGroup = () => { if (selected.length < 1) return setToast("그룹으로 묶을 위젯을 선택해주세요."); const name = prompt("그룹 이름", "NEW GROUP"); if (!name) return; const id = crypto.randomUUID(); setStore(s => ({ ...s, groups: [...s.groups, { id, name, color: "#56d6b0", locked: false }], widgets: s.widgets.map(w => selected.includes(w.id) ? { ...w, groupId: id } : w) })); setSelected([]); setGrouping(false); setToast("새 그룹을 만들었습니다."); };

  return <main>
    <header className="topbar">
      <div className="brand"><span className="prompt">&gt;_</span><div><strong>SSAFY <em>DASHBOARD</em></strong><small>PERSONAL DEV WORKSPACE</small></div></div>
      <nav aria-label="워크스페이스 도구">
        <button className="ghost" onClick={exportJson}>↓ EXPORT</button><button className="ghost" onClick={() => fileRef.current?.click()}>↑ IMPORT</button>
        <input ref={fileRef} hidden type="file" accept="application/json" onChange={e => importJson(e.target.files?.[0])}/>
        <button className={editing ? "mode active" : "mode"} onClick={() => { setEditing(v => !v); setGrouping(false); }}>{editing ? "● EDIT MODE" : "○ VIEW MODE"}</button>
      </nav>
    </header>
    <section className="commandbar">
      <div className="status"><span className="online"/>SYSTEM ONLINE <span className="slash">{"//"}</span> <b>{store.widgets.length}</b> WIDGETS <span className="slash">{"//"}</span> AUTO-SAVED</div>
      <div className="actions"><button onClick={() => setModal("bookmark")}>+ BOOKMARK</button><button onClick={() => setModal("note")}>+ NOTE</button><button onClick={() => setModal("todo")}>+ TODO</button>{editing && <button className="group" onClick={() => setGrouping(v => !v)}>◇ GROUP</button>}</div>
    </section>
    <section className="stats" aria-label="요약">
      <article><span>OPEN TASKS</span><b>{String(counts.todo).padStart(2,"0")}</b><i>FOCUS</i></article><article><span>BOOKMARKS</span><b>{String(counts.bookmark).padStart(2,"0")}</b><i>LINKS</i></article><article><span>GROUPS</span><b>{String(counts.group).padStart(2,"0")}</b><i>TOPICS</i></article><div className="quote"><span>TODAY&apos;S LOG</span><p>“꾸준함이 결국 실력을 만든다.”</p><small>{new Intl.DateTimeFormat("ko-KR", { dateStyle: "full" }).format(new Date())}</small></div>
    </section>
    {grouping && <div className="selectionbar"><span>그룹화할 위젯 선택 · {selected.length}개 선택</span><button onClick={createGroup}>그룹 만들기</button><button onClick={() => {setGrouping(false);setSelected([]);}}>취소</button></div>}
    <section className="canvas-wrap"><div className="canvas-label"><span>WORKSPACE / MAIN</span><small>{editing ? "드래그 핸들과 우측 하단으로 이동·크기 조절" : "보기 모드 · 콘텐츠를 바로 사용하세요"}</small></div>
      <div className="canvas" ref={canvasRef} style={{ height: Math.max(650, ...store.widgets.map(w => w.layout.y + w.layout.height + 80)) }}>
        {store.groups.map(g => <div key={g.id} className="group-chip" style={{ borderColor: g.color, color: g.color }}>{g.name} <span>{store.widgets.filter(w => w.groupId === g.id).length}</span></div>)}
        {store.widgets.map(w => <article key={w.id} data-id={w.id} className={`widget ${w.locked ? "locked" : ""} ${selected.includes(w.id) ? "selected" : ""}`} style={{ transform: `translate(${w.layout.x}px, ${w.layout.y}px)`, width: w.layout.width, height: w.layout.height, zIndex: w.layout.zIndex }} onClick={() => grouping && setSelected(s => s.includes(w.id) ? s.filter(id => id !== w.id) : [...s, w.id])}>
          <div className="widget-top drag-handle"><Icon type={w.type}/><span>{w.type.toUpperCase()}</span>{w.groupId && <small>{store.groups.find(g => g.id === w.groupId)?.name}</small>}<div className="widget-tools">{editing && <><button aria-label="잠금" onPointerDown={e=>e.stopPropagation()} onClick={() => update(w.id,{locked:!w.locked})}>{w.locked ? "◆" : "◇"}</button><button aria-label="복제" onPointerDown={e=>e.stopPropagation()} onClick={() => setStore(s => ({...s,widgets:[...s.widgets,{...w,id:crypto.randomUUID(),layout:{...w.layout,x:w.layout.x+20,y:w.layout.y+20}}]}))}>⧉</button><button aria-label="삭제" onPointerDown={e=>e.stopPropagation()} onClick={() => remove(w.id)}>×</button></>}</div></div>
          <div className="widget-body"><h2>{w.title}</h2>
            {w.type === "bookmark" && <><p className="url">{w.data.url}</p><a href={w.data.url} target="_blank" rel="noreferrer">OPEN RESOURCE <span>↗</span></a></>}
            {w.type === "note" && <textarea aria-label={`${w.title} 내용`} value={w.data.body || ""} readOnly={!editing} onChange={e => update(w.id,{data:{...w.data,body:e.target.value}})}/>} 
            {w.type === "todo" && <label className="todo"><input type="checkbox" checked={!!w.data.done} onChange={e => update(w.id,{data:{...w.data,done:e.target.checked}})}/><span className={w.data.done ? "done" : ""}>{w.data.done ? "COMPLETED" : "IN PROGRESS"}</span></label>}
            {w.type === "todo" && <div className="meta"><span className={`priority ${w.data.priority?.toLowerCase()}`}>{w.data.priority}</span><span>{w.data.due || "NO DEADLINE"}</span></div>}
          </div>{editing && !w.locked && <span className="resize-corner"/>}
        </article>)}
      </div>
    </section>
    <footer><span>LOCAL STORAGE <b>ACTIVE</b></span><span>DATA STAYS ON THIS DEVICE</span><span>SSAFY DASHBOARD · V1.0</span></footer>
    {modal && <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setModal(null)}><form className="modal" onSubmit={addWidget}><div><span>NEW / {modal.toUpperCase()}</span><button type="button" onClick={() => setModal(null)}>×</button></div><h2>새 {modal === "bookmark" ? "북마크" : modal === "note" ? "메모" : "할 일"}</h2><label>제목<input name="title" required autoFocus placeholder="제목을 입력하세요"/></label>{modal !== "todo" && <label>{modal === "bookmark" ? "URL" : "내용"}{modal === "note" ? <textarea name="content" rows={5} placeholder="메모를 입력하세요"/> : <input name="content" type="url" defaultValue="https://" required/>}</label>}{modal === "todo" && <><label>마감일<input name="due" type="date"/></label><label>우선순위<select name="priority"><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select></label></>}<div className="modal-actions"><button type="button" onClick={() => setModal(null)}>CANCEL</button><button type="submit">CREATE WIDGET</button></div></form></div>}
    {toast && <div className="toast" role="status">{toast}</div>}
  </main>;
}
