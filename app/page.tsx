"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import interact from "interactjs";
import { z } from "zod";

type Kind = "bookmark" | "note" | "todo";
type Layout = { x: number; y: number; width: number; height: number; zIndex: number };
type Widget = {
  id: string; type: Kind; title: string; layout: Layout; groupId: string | null;
  workspaceId: string; style: { borderColor: string };
  locked: boolean; data: { url?: string; body?: string; done?: boolean; due?: string; priority?: string };
  createdAt: string; updatedAt: string;
};
type Group = { id: string; name: string; color: string; locked: boolean };
type Workspace = { id: string; name: string };
type Store = { version: 2; exportedAt: string; settings: { grid: number; message: string }; workspaces: Workspace[]; activeWorkspaceId: string; groups: Group[]; widgets: Widget[] };

const backupSchema = z.object({
  version: z.number(), exportedAt: z.string(), settings: z.object({ grid: z.number(), message: z.string().optional() }),
  workspaces: z.array(z.object({ id: z.string(), name: z.string() })).optional(), activeWorkspaceId: z.string().optional(),
  groups: z.array(z.object({ id: z.string(), name: z.string(), color: z.string(), locked: z.boolean() })),
  widgets: z.array(z.object({
    id: z.string(), type: z.enum(["bookmark", "note", "todo"]), title: z.string(),
    layout: z.object({ x: z.number(), y: z.number(), width: z.number(), height: z.number(), zIndex: z.number() }),
    groupId: z.string().nullable(), workspaceId: z.string().optional(), style: z.object({ borderColor: z.string() }).optional(), locked: z.boolean(), data: z.object({
      url: z.string().optional(), body: z.string().optional(), done: z.boolean().optional(),
      due: z.string().optional(), priority: z.string().optional(),
    }), createdAt: z.string(), updatedAt: z.string(),
  })),
});

const now = () => new Date().toISOString();
const MAIN_WORKSPACE = "workspace-main";
const make = (type: Kind, title: string, x: number, y: number, data: Widget["data"]): Widget => ({
  id: crypto.randomUUID(), type, title, data, groupId: null, workspaceId: MAIN_WORKSPACE, style: { borderColor: "#303b47" }, locked: false,
  layout: { x, y, width: type === "note" ? 320 : 280, height: type === "note" ? 230 : 190, zIndex: 1 },
  createdAt: now(), updatedAt: now(),
});
const initial: Store = {
  version: 2, exportedAt: now(), settings: { grid: 20, message: "꾸준함이 결국 실력을 만든다." },
  workspaces: [{ id: MAIN_WORKSPACE, name: "MAIN" }], activeWorkspaceId: MAIN_WORKSPACE,
  groups: [{ id: "g-java", name: "JAVA", color: "#ffb84d", locked: false }, { id: "g-algo", name: "ALGORITHM", color: "#9d7cff", locked: false }],
  widgets: [
    { ...make("bookmark", "SSAFY GITLAB", 40, 40, { url: "https://lab.ssafy.com" }), groupId: "g-java" },
    { ...make("todo", "오늘의 학습", 360, 40, { done: false, due: new Date().toISOString().slice(0,10), priority: "HIGH" }), groupId: "g-java" },
    { ...make("note", "알고리즘 메모", 40, 270, { body: "BFS: 큐에 넣을 때 방문 처리\n시간복잡도 O(V + E)" }), groupId: "g-algo" },
    { ...make("bookmark", "SW EXPERT ACADEMY", 390, 270, { url: "https://swexpertacademy.com" }), groupId: "g-algo" },
  ],
};

const normalizeStore = (value: unknown): Store => {
  const parsed = backupSchema.parse(value); const workspaces = parsed.workspaces?.length ? parsed.workspaces : [{ id: MAIN_WORKSPACE, name: "MAIN" }];
  const activeWorkspaceId = workspaces.some(w => w.id === parsed.activeWorkspaceId) ? parsed.activeWorkspaceId! : workspaces[0].id;
  return { version: 2, exportedAt: parsed.exportedAt, settings: { grid: parsed.settings.grid, message: parsed.settings.message || "꾸준함이 결국 실력을 만든다." }, workspaces, activeWorkspaceId, groups: parsed.groups, widgets: parsed.widgets.map(w => ({ ...w, workspaceId: w.workspaceId || MAIN_WORKSPACE, style: w.style || { borderColor: "#303b47" } })) };
};

function Icon({ type }: { type: Kind }) { return <span className={`kind kind-${type}`}>{type === "bookmark" ? "↗" : type === "note" ? "≡" : "✓"}</span>; }

export default function Home() {
  const [store, setStore] = useState<Store>(() => {
    if (typeof window === "undefined") return initial;
    try { const raw = localStorage.getItem("ssafy-dashboard-v1"); return raw ? normalizeStore(JSON.parse(raw)) : initial; }
    catch { return initial; }
  });
  const [modal, setModal] = useState<{ type: Kind; widgetId?: string } | null>(null);
  const [grouping, setGrouping] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const [clock, setClock] = useState(new Date());
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { localStorage.setItem("ssafy-dashboard-v1", JSON.stringify({ ...store, exportedAt: now() })); }, [store]);
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(""), 2800); return () => clearTimeout(id); }, [toast]);
  useEffect(() => { const id = setInterval(() => setClock(new Date()), 1000); return () => clearInterval(id); }, []);

  const update = (id: string, patch: Partial<Widget>) => setStore(s => ({ ...s, widgets: s.widgets.map(w => w.id === id ? { ...w, ...patch, updatedAt: now() } : w) }));
  const updateLayout = (id: string, layout: Partial<Layout>) => setStore(s => ({ ...s, widgets: s.widgets.map(w => w.id === id ? { ...w, layout: { ...w.layout, ...layout }, updatedAt: now() } : w) }));

  useEffect(() => {
    const selector = ".widget:not(.locked)";
    if (!canvasRef.current) { interact(selector).unset(); return; }
    const grid = store.settings.grid;
    interact(selector)
      .draggable({ allowFrom: ".drag-handle", listeners: {
        start() { document.body.classList.add("is-dragging"); },
        move(e) {
          const target = e.target as HTMLElement;
          const nextX = Number(target.dataset.x || 0) + e.dx;
          const nextY = Math.max(0, Number(target.dataset.y || 0) + e.dy);
          target.style.transform = `translate(${nextX}px, ${nextY}px)`;
          target.dataset.x = String(nextX); target.dataset.y = String(nextY);
        },
        end(e) { const target = e.target as HTMLElement; updateLayout(target.dataset.id || "", { x: Number(target.dataset.x || 0), y: Number(target.dataset.y || 0) }); document.body.classList.remove("is-dragging"); },
      } })
      .resizable({ edges: { left: false, right: true, bottom: true, top: false }, modifiers: [interact.modifiers.snapSize({ targets: [interact.snappers.grid({ x: grid, y: grid })] }), interact.modifiers.restrictSize({ min: { width: 240, height: 150 } })], listeners: { move(e) { updateLayout(e.target.dataset.id, { width: e.rect.width, height: e.rect.height }); } } });
    return () => { interact(selector).unset(); document.body.classList.remove("is-dragging"); };
  }, [store.settings.grid, store.widgets]);

  const visibleWidgets = useMemo(() => store.widgets.filter(w => w.workspaceId === store.activeWorkspaceId), [store.widgets, store.activeWorkspaceId]);
  const modalWidget = modal?.widgetId ? store.widgets.find(w => w.id === modal.widgetId) : undefined;
  const counts = useMemo(() => ({ todo: visibleWidgets.filter(w => w.type === "todo" && !w.data.done).length, bookmark: visibleWidgets.filter(w => w.type === "bookmark").length, group: store.groups.length }), [visibleWidgets, store.groups.length]);
  const addWidget = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget); const type = modal!.type; const title = String(form.get("title") || "새 위젯"); const borderColor = String(form.get("borderColor") || "#303b47");
    const data = type === "bookmark" ? { url: String(form.get("content") || "https://") } : type === "note" ? { body: String(form.get("content") || "") } : { done: modalWidget?.data.done || false, due: String(form.get("due") || ""), priority: String(form.get("priority") || "MEDIUM") };
    if (modal?.widgetId) { setStore(s => ({ ...s, widgets: s.widgets.map(w => w.id === modal.widgetId ? { ...w, title, data, style: { borderColor }, updatedAt: now() } : w) })); setToast("위젯을 수정했습니다."); }
    else { setStore(s => ({ ...s, widgets: [...s.widgets, { ...make(type, title, 80 + (visibleWidgets.length % 4) * 40, 80 + (visibleWidgets.length % 5) * 40, data), workspaceId: s.activeWorkspaceId, style: { borderColor } }] })); setToast("위젯을 추가했습니다."); }
    setModal(null);
  };
  const remove = (id: string) => { if (!confirm("이 위젯을 삭제할까요?")) return; const before = store.widgets.find(w => w.id === id); setStore(s => ({ ...s, widgets: s.widgets.filter(w => w.id !== id) })); setToast("삭제했습니다. 되돌리려면 Ctrl+Z 대신 백업을 활용해주세요."); if (!before) return; };
  const exportJson = () => { const blob = new Blob([JSON.stringify({ ...store, exportedAt: now() }, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `ssafy-dashboard-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(a.href); };
  const importJson = async (file?: File) => { if (!file) return; try { const parsed = normalizeStore(JSON.parse(await file.text())); if (!confirm("현재 데이터를 백업 파일 내용으로 교체할까요?")) return; setStore(parsed); setToast("워크스페이스를 복원했습니다."); } catch { setToast("유효하지 않은 백업 파일입니다. 기존 데이터는 유지됩니다."); } };
  const createGroup = () => { if (selected.length < 1) return setToast("그룹으로 묶을 위젯을 선택해주세요."); const name = prompt("그룹 이름", "NEW GROUP"); if (!name) return; const id = crypto.randomUUID(); setStore(s => ({ ...s, groups: [...s.groups, { id, name, color: "#56d6b0", locked: false }], widgets: s.widgets.map(w => selected.includes(w.id) ? { ...w, groupId: id } : w) })); setSelected([]); setGrouping(false); setToast("새 그룹을 만들었습니다."); };

  return <main>
    <header className="topbar">
      <div className="brand"><span className="prompt">&gt;_</span><div><strong>SSAFY <em>DASHBOARD</em></strong><small>PERSONAL DEV WORKSPACE</small></div></div>
      <nav aria-label="워크스페이스 도구">
        <button className="ghost" onClick={exportJson}>↓ EXPORT</button><button className="ghost" onClick={() => fileRef.current?.click()}>↑ IMPORT</button>
        <input ref={fileRef} hidden type="file" accept="application/json" onChange={e => importJson(e.target.files?.[0])}/>
      </nav>
    </header>
    <section className="commandbar">
      <div className="status"><span className="online"/>SYSTEM ONLINE <span className="slash">{"//"}</span> <b>{store.widgets.length}</b> WIDGETS <span className="slash">{"//"}</span> AUTO-SAVED</div>
      <div className="actions"><button onClick={() => setModal({ type: "bookmark" })}>+ BOOKMARK</button><button onClick={() => setModal({ type: "note" })}>+ NOTE</button><button onClick={() => setModal({ type: "todo" })}>+ TODO</button><button className="group" onClick={() => setGrouping(v => !v)}>◇ GROUP</button></div>
    </section>
    <section className="stats" aria-label="요약">
      <div className="datetime"><span>{new Intl.DateTimeFormat("ko-KR", { month: "short", day: "2-digit", weekday: "short" }).format(clock)}</span><b>{new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(clock)}</b><small>{clock.getFullYear()}</small></div><article><span>OPEN TASKS</span><b>{String(counts.todo).padStart(2,"0")}</b><i>FOCUS</i></article><article><span>BOOKMARKS</span><b>{String(counts.bookmark).padStart(2,"0")}</b><i>LINKS</i></article><article><span>GROUPS</span><b>{String(counts.group).padStart(2,"0")}</b><i>TOPICS</i></article><div className="quote"><textarea aria-label="상단 메모" value={store.settings.message} onChange={e => setStore(s => ({ ...s, settings: { ...s.settings, message: e.target.value } }))} placeholder="기억할 문장을 적어두세요."/></div>
    </section>
    {grouping && <div className="selectionbar"><span>그룹화할 위젯 선택 · {selected.length}개 선택</span><button onClick={createGroup}>그룹 만들기</button><button onClick={() => {setGrouping(false);setSelected([]);}}>취소</button></div>}
    <section className="canvas-wrap"><div className="canvas-label"><div className="workspace-tabs">{store.workspaces.map(ws => <button key={ws.id} className={ws.id === store.activeWorkspaceId ? "active" : ""} onClick={() => setStore(s => ({ ...s, activeWorkspaceId: ws.id }))}>WORKSPACE / {ws.name}</button>)}<button className="add-workspace" onClick={() => { const name = prompt("새 워크스페이스 이름", `SPACE ${store.workspaces.length + 1}`); if (!name) return; const id = crypto.randomUUID(); setStore(s => ({ ...s, workspaces: [...s.workspaces, { id, name: name.toUpperCase() }], activeWorkspaceId: id })); }}>＋</button></div></div>
      <div className="canvas" ref={canvasRef} style={{ height: Math.max(650, ...visibleWidgets.map(w => w.layout.y + w.layout.height + 80)) }}>
        {visibleWidgets.map(w => <article key={w.id} data-id={w.id} data-x={w.layout.x} data-y={w.layout.y} className={`widget ${w.locked ? "locked" : ""} ${selected.includes(w.id) ? "selected" : ""}`} style={{ transform: `translate(${w.layout.x}px, ${w.layout.y}px)`, width: w.layout.width, height: w.layout.height, zIndex: w.layout.zIndex, borderColor: w.style.borderColor }} onClick={() => grouping && setSelected(s => s.includes(w.id) ? s.filter(id => id !== w.id) : [...s, w.id])}>
          <div className="widget-top drag-handle"><Icon type={w.type}/><span>{w.type.toUpperCase()}</span>{w.groupId && <small>{store.groups.find(g => g.id === w.groupId)?.name}</small>}<div className="widget-tools"><button aria-label="수정" onPointerDown={e=>e.stopPropagation()} onClick={() => setModal({ type: w.type, widgetId: w.id })}>✎</button><button aria-label="잠금" onPointerDown={e=>e.stopPropagation()} onClick={() => update(w.id,{locked:!w.locked})}>{w.locked ? "◆" : "◇"}</button><button aria-label="복제" onPointerDown={e=>e.stopPropagation()} onClick={() => setStore(s => ({...s,widgets:[...s.widgets,{...w,id:crypto.randomUUID(),layout:{...w.layout,x:w.layout.x+20,y:w.layout.y+20}}]}))}>⧉</button><button aria-label="삭제" onPointerDown={e=>e.stopPropagation()} onClick={() => remove(w.id)}>×</button></div></div>
          <div className="widget-body"><h2>{w.title}</h2>
            {w.type === "bookmark" && <><p className="url">{w.data.url}</p><a href={w.data.url} target="_blank" rel="noreferrer">OPEN RESOURCE <span>↗</span></a></>}
            {w.type === "note" && <textarea aria-label={`${w.title} 내용`} value={w.data.body || ""} readOnly/>} 
            {w.type === "todo" && <label className="todo"><input type="checkbox" checked={!!w.data.done} onChange={e => update(w.id,{data:{...w.data,done:e.target.checked}})}/><span className={w.data.done ? "done" : ""}>{w.data.done ? "COMPLETED" : "IN PROGRESS"}</span></label>}
            {w.type === "todo" && <div className="meta"><span className={`priority ${w.data.priority?.toLowerCase()}`}>{w.data.priority}</span><span>{w.data.due || "NO DEADLINE"}</span></div>}
          </div>{!w.locked && <span className="resize-corner"/>}
        </article>)}
      </div>
    </section>
    <footer><span>LOCAL STORAGE <b>ACTIVE</b></span><span>DATA STAYS ON THIS DEVICE</span><span>SSAFY DASHBOARD · V1.0.1</span></footer>
    {modal && <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setModal(null)}><form className="modal" onSubmit={addWidget}><div><span>{modalWidget ? "EDIT" : "NEW"} / {modal.type.toUpperCase()}</span><button type="button" onClick={() => setModal(null)}>×</button></div><h2>{modalWidget ? "위젯 수정" : `새 ${modal.type === "bookmark" ? "북마크" : modal.type === "note" ? "메모" : "할 일"}`}</h2><label>제목<input name="title" required autoFocus defaultValue={modalWidget?.title} placeholder="제목을 입력하세요"/></label><label>테두리 색상<input className="color-input" name="borderColor" type="color" defaultValue={modalWidget?.style.borderColor || "#303b47"}/></label>{modal.type !== "todo" && <label>{modal.type === "bookmark" ? "URL" : "내용"}{modal.type === "note" ? <textarea name="content" rows={5} defaultValue={modalWidget?.data.body} placeholder="메모를 입력하세요"/> : <input name="content" type="url" defaultValue={modalWidget?.data.url || "https://"} required/>}</label>}{modal.type === "todo" && <><label>마감일<input name="due" type="date" defaultValue={modalWidget?.data.due}/></label><label>우선순위<select name="priority" defaultValue={modalWidget?.data.priority || "MEDIUM"}><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select></label></>}<div className="modal-actions"><button type="button" onClick={() => setModal(null)}>CANCEL</button><button type="submit">{modalWidget ? "SAVE CHANGES" : "CREATE WIDGET"}</button></div></form></div>}
    {toast && <div className="toast" role="status">{toast}</div>}
  </main>;
}
