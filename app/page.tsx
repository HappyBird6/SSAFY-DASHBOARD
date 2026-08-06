"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import interact from "interactjs";
import { z } from "zod";

type Kind =
  | "bookmark"
  | "note"
  | "todo"
  | "weather"
  | "calendar"
  | "timer"
  | "countdown"
  | "launcher";
type Layout = {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
};
type Widget = {
  id: string;
  type: Kind;
  title: string;
  layout: Layout;
  groupId: string | null;
  workspaceId: string;
  style: { borderColor: string };
  locked: boolean;
  data: {
    url?: string;
    body?: string;
    done?: boolean;
    due?: string;
    priority?: string;
    city?: string;
    locationName?: string;
    latitude?: number;
    longitude?: number;
    timerMinutes?: number;
    timerRemaining?: number;
    timerRunning?: boolean;
    timerEndsAt?: string;
    countdownDate?: string;
    countdownFontSize?: number;
    launcherLabel?: string;
    launcherUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
};
type Workspace = { id: string; name: string };
type SizePreset = { id: string; name: string; width: number; height: number };
type Theme = "dark" | "light" | "blue";
type Store = {
  version: 2;
  exportedAt: string;
  settings: {
    grid: number;
    message: string;
    widgetColors: Record<Kind, string>;
    sizePresets: SizePreset[];
    theme: Theme;
  };
  workspaces: Workspace[];
  activeWorkspaceId: string;
  widgets: Widget[];
};

const backupSchema = z.object({
  version: z.number(),
  exportedAt: z.string(),
  settings: z.object({
    grid: z.number(),
    message: z.string().optional(),
    widgetColors: z
      .object({
        bookmark: z.string(),
        note: z.string(),
        todo: z.string(),
        weather: z.string().optional(),
        calendar: z.string().optional(),
        timer: z.string().optional(),
        countdown: z.string().optional(),
        launcher: z.string().optional(),
      })
      .optional(),
    sizePresets: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          width: z.number(),
          height: z.number(),
        }),
      )
      .optional(),
    theme: z.enum(["dark", "light", "blue"]).optional(),
  }),
  workspaces: z
    .array(z.object({ id: z.string(), name: z.string() }))
    .optional(),
  activeWorkspaceId: z.string().optional(),
  groups: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        color: z.string(),
        locked: z.boolean(),
      }),
    )
    .optional(),
  widgets: z.array(
    z.object({
      id: z.string(),
      type: z.enum([
        "bookmark",
        "note",
        "todo",
        "weather",
        "calendar",
        "timer",
        "countdown",
        "launcher",
        "launcher",
      ]),
      title: z.string(),
      layout: z.object({
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
        zIndex: z.number(),
      }),
      groupId: z.string().nullable(),
      workspaceId: z.string().optional(),
      style: z.object({ borderColor: z.string() }).optional(),
      locked: z.boolean(),
      data: z.object({
        url: z.string().optional(),
        body: z.string().optional(),
        done: z.boolean().optional(),
        due: z.string().optional(),
        priority: z.string().optional(),
        city: z.string().optional(),
        locationName: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        timerMinutes: z.number().optional(),
        timerRemaining: z.number().optional(),
        timerRunning: z.boolean().optional(),
        timerEndsAt: z.string().optional(),
        countdownDate: z.string().optional(),
        countdownFontSize: z.number().optional(),
        launcherLabel: z.string().optional(),
        launcherUrl: z.string().optional(),
      }),
      createdAt: z.string(),
      updatedAt: z.string(),
    }),
  ),
});

const now = () => new Date().toISOString();
const MAIN_WORKSPACE = "workspace-main";
const DEFAULT_WIDGET_COLORS: Record<Kind, string> = {
  bookmark: "#38bdf8",
  note: "#6d28d9",
  todo: "#f4f7fb",
  weather: "#38bdf8",
  calendar: "#f59e0b",
  timer: "#22c55e",
  countdown: "#f97316",
  launcher: "#60a5fa",
};
const DEFAULT_SIZE_PRESETS: SizePreset[] = [
  { id: "size-default", name: "기본", width: 300, height: 200 },
];
const make = (
  type: Kind,
  title: string,
  x: number,
  y: number,
  data: Widget["data"],
): Widget => ({
  id: crypto.randomUUID(),
  type,
  title,
  data,
  groupId: null,
  workspaceId: MAIN_WORKSPACE,
  style: { borderColor: DEFAULT_WIDGET_COLORS[type] },
  locked: false,
  layout: {
    x,
    y,
    width: type === "note" ? 320 : 280,
    height: type === "note" ? 230 : 190,
    zIndex: 1,
  },
  createdAt: now(),
  updatedAt: now(),
});
const initial: Store = {
  version: 2,
  exportedAt: now(),
  settings: {
    grid: 20,
    message: "꾸준함이 결국 실력을 만든다.",
    widgetColors: DEFAULT_WIDGET_COLORS,
    sizePresets: DEFAULT_SIZE_PRESETS,
    theme: "dark",
  },
  workspaces: [{ id: MAIN_WORKSPACE, name: "MAIN" }],
  activeWorkspaceId: MAIN_WORKSPACE,
  widgets: [
    make("bookmark", "SSAFY GITLAB", 40, 40, { url: "https://lab.ssafy.com" }),
    make("todo", "오늘의 학습", 360, 40, {
      done: false,
      due: new Date().toISOString().slice(0, 10),
      priority: "HIGH",
    }),
    make("note", "알고리즘 메모", 40, 270, {
      body: "BFS: 큐에 넣을 때 방문 처리\n시간복잡도 O(V + E)",
    }),
    make("bookmark", "SW EXPERT ACADEMY", 390, 270, {
      url: "https://swexpertacademy.com",
    }),
  ],
};

const normalizeStore = (value: unknown): Store => {
  const parsed = backupSchema.parse(value);
  const workspaces = parsed.workspaces?.length
    ? parsed.workspaces
    : [{ id: MAIN_WORKSPACE, name: "MAIN" }];
  const activeWorkspaceId = workspaces.some(
    (w) => w.id === parsed.activeWorkspaceId,
  )
    ? parsed.activeWorkspaceId!
    : workspaces[0].id;
  const widgetColors = {
    ...DEFAULT_WIDGET_COLORS,
    ...(parsed.settings.widgetColors || {}),
  };
  const sizePresets = parsed.settings.sizePresets?.length
    ? parsed.settings.sizePresets
    : DEFAULT_SIZE_PRESETS;
  return {
    version: 2,
    exportedAt: parsed.exportedAt,
    settings: {
      grid: parsed.settings.grid,
      message: parsed.settings.message || "꾸준함이 결국 실력을 만든다.",
      widgetColors,
      sizePresets,
      theme: parsed.settings.theme || "dark",
    },
    workspaces,
    activeWorkspaceId,
    widgets: parsed.widgets.map((w) => ({
      ...w,
      groupId: null,
      workspaceId: w.workspaceId || MAIN_WORKSPACE,
      style:
        !w.style || w.style.borderColor === "#303b47"
          ? { borderColor: widgetColors[w.type] }
          : w.style,
    })),
  };
};

function Icon({ type }: { type: Kind }) {
  return (
    <span className={`kind kind-${type}`}>
      {type === "bookmark"
        ? "↗"
        : type === "note"
          ? "≡"
          : type === "todo"
            ? "✓"
            : type === "weather"
              ? "☁"
              : type === "calendar"
                ? "□"
                : type === "timer"
                  ? "◷"
                  : type === "countdown"
                    ? "D"
                    : "⚡"}
    </span>
  );
}

const KOREAN_CITIES = [
  { id: "seoul", name: "서울", latitude: 37.5665, longitude: 126.978 },
  { id: "busan", name: "부산", latitude: 35.1796, longitude: 129.0756 },
  { id: "daegu", name: "대구", latitude: 35.8714, longitude: 128.6014 },
  { id: "incheon", name: "인천", latitude: 37.4563, longitude: 126.7052 },
  { id: "gwangju", name: "광주", latitude: 35.1595, longitude: 126.8526 },
  { id: "daejeon", name: "대전", latitude: 36.3504, longitude: 127.3845 },
  { id: "ulsan", name: "울산", latitude: 35.5384, longitude: 129.3114 },
  { id: "sejong", name: "세종", latitude: 36.48, longitude: 127.289 },
  { id: "suwon", name: "수원", latitude: 37.2636, longitude: 127.0286 },
  { id: "chuncheon", name: "춘천", latitude: 37.8813, longitude: 127.7298 },
  { id: "cheongju", name: "청주", latitude: 36.6424, longitude: 127.489 },
  { id: "jeonju", name: "전주", latitude: 35.8242, longitude: 127.148 },
  { id: "changwon", name: "창원", latitude: 35.2285, longitude: 128.6811 },
  { id: "jeju", name: "제주", latitude: 33.4996, longitude: 126.5312 },
] as const;

type WeatherResult = {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    weather_code: number;
  };
  daily: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
  };
};

const weatherLabel = (code: number) => {
  if (code === 0) return ["☀️", "맑음"];
  if (code <= 3) return ["⛅", "구름"];
  if (code <= 48) return ["🌫️", "안개"];
  if (code <= 67) return ["🌧️", "비"];
  if (code <= 77) return ["🌨️", "눈"];
  if (code <= 82) return ["🌦️", "소나기"];
  if (code <= 86) return ["🌨️", "눈 소나기"];
  return ["⛈️", "뇌우"];
};

type GeoResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  admin2?: string;
};
type NominatimResult = {
  place_id: number;
  name?: string;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    borough?: string;
    city_district?: string;
    county?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
  };
};

function LocationPicker({ widget }: { widget?: Widget }) {
  const legacy =
    KOREAN_CITIES.find((item) => item.id === widget?.data.city) ||
    KOREAN_CITIES[0];
  const [query, setQuery] = useState(
    widget?.data.locationName || (widget ? legacy.name : ""),
  );
  const [selected, setSelected] = useState({
    name: widget?.data.locationName || legacy.name,
    latitude: widget?.data.latitude ?? legacy.latitude,
    longitude: widget?.data.longitude ?? legacy.longitude,
  });
  const [results, setResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");

  const search = async () => {
    if (query.trim().length < 2) return;
    setSearching(true);
    setSearchMessage("");
    try {
      const params = new URLSearchParams({
        q: `${query.trim()}, 대한민국`,
        format: "jsonv2",
        addressdetails: "1",
        "accept-language": "ko",
        countrycodes: "kr",
        limit: "8",
        layer: "address",
      });
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`,
      );
      if (!response.ok) throw new Error("search unavailable");
      const data = (await response.json()) as NominatimResult[];
      const normalized = data.map((item) => ({
        id: item.place_id,
        name: item.name || item.display_name.split(",")[0],
        latitude: Number(item.lat),
        longitude: Number(item.lon),
        admin2:
          item.address?.borough ||
          item.address?.city_district ||
          item.address?.county ||
          item.address?.city ||
          item.address?.town ||
          item.address?.village,
        admin1: item.address?.state,
      }));
      setResults(normalized);
      if (!normalized.length)
        setSearchMessage("검색 결과가 없습니다. 동·구 이름을 바꿔보세요.");
    } catch {
      setResults([]);
      setSearchMessage("지역 검색에 실패했습니다. 잠시 후 다시 시도하세요.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="location-picker">
      <label>
        지역 검색
        <span className="location-search">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="예: 역삼동, 정자동, 해운대구"
          />
          <button type="button" onClick={search}>
            {searching ? "검색 중" : "검색"}
          </button>
        </span>
      </label>
      {results.length > 0 && (
        <div className="location-results">
          {results.map((result) => (
            <button
              type="button"
              key={result.id}
              onClick={() => {
                const name = [result.name, result.admin2, result.admin1]
                  .filter(Boolean)
                  .join(" · ");
                setSelected({
                  name,
                  latitude: result.latitude,
                  longitude: result.longitude,
                });
                setQuery(result.name);
                setResults([]);
              }}
            >
              <strong>{result.name}</strong>
              <small>
                {[result.admin2, result.admin1].filter(Boolean).join(" · ")}
              </small>
            </button>
          ))}
        </div>
      )}
      {searchMessage && (
        <small className="search-message">{searchMessage}</small>
      )}
      <small className="selected-location">선택 지역 · {selected.name}</small>
      <input type="hidden" name="locationName" value={selected.name} />
      <input type="hidden" name="latitude" value={selected.latitude} />
      <input type="hidden" name="longitude" value={selected.longitude} />
    </div>
  );
}

function WeatherWidget({ widget }: { widget: Widget }) {
  const legacy =
    KOREAN_CITIES.find((item) => item.id === widget.data.city) ||
    KOREAN_CITIES[0];
  const location = {
    name: widget.data.locationName || legacy.name,
    latitude: widget.data.latitude ?? legacy.latitude,
    longitude: widget.data.longitude ?? legacy.longitude,
  };
  const [weather, setWeather] = useState<WeatherResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const cacheKey = `ssafy-weather-${location.latitude}-${location.longitude}`;
    const controller = new AbortController();
    const load = async () => {
      try {
        const params = new URLSearchParams({
          latitude: String(location.latitude),
          longitude: String(location.longitude),
          current: "temperature_2m,apparent_temperature,weather_code",
          daily:
            "temperature_2m_max,temperature_2m_min,precipitation_probability_max",
          timezone: "Asia/Seoul",
          forecast_days: "1",
        });
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?${params}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("weather unavailable");
        const result = (await response.json()) as WeatherResult;
        setWeather(result);
        localStorage.setItem(cacheKey, JSON.stringify(result));
      } catch (reason) {
        if ((reason as Error).name === "AbortError") return;
        const cached = localStorage.getItem(cacheKey);
        if (cached) setWeather(JSON.parse(cached));
        else setError("날씨 예보 데이터를 불러올 수 없습니다.");
      }
    };
    load();
    return () => controller.abort();
  }, [location.latitude, location.longitude]);

  if (!weather)
    return <p className="api-state">{error || "날씨 예보 불러오는 중…"}</p>;
  const [icon, label] = weatherLabel(weather.current.weather_code);
  return (
    <div className="weather-content">
      <div className="weather-main">
        <span className="weather-icon" aria-hidden="true">
          {icon}
        </span>
        <div>
          <strong>{location.name}</strong>
          <small>{label} · BEST MATCH</small>
        </div>
        <b>{Math.round(weather.current.temperature_2m)}°</b>
      </div>
      <div className="weather-grid">
        <span>
          체감 <b>{Math.round(weather.current.apparent_temperature)}°</b>
        </span>
        <span>
          최고 <b>{Math.round(weather.daily.temperature_2m_max[0])}°</b>
        </span>
        <span>
          최저 <b>{Math.round(weather.daily.temperature_2m_min[0])}°</b>
        </span>
        <span>
          강수 <b>{weather.daily.precipitation_probability_max[0]}%</b>
        </span>
      </div>
      <small className="api-updated">
        업데이트 {weather.current.time.replace("T", " ")}
      </small>
    </div>
  );
}

type Holiday = { date: string; localName?: string; name: string };

function CalendarWidget() {
  const [month, setMonth] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const year = month.getFullYear();

  useEffect(() => {
    const controller = new AbortController();
    fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/KR`, {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : []))
      .then((data: Holiday[]) => setHolidays(data))
      .catch(() => setHolidays([]));
    return () => controller.abort();
  }, [year]);

  const offset = new Date(year, month.getMonth(), 1).getDay();
  const days = new Date(year, month.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: offset + days }, (_, index) =>
    index < offset ? null : index - offset + 1,
  );
  const holidayMap = new Map(
    holidays.map((holiday) => [
      holiday.date,
      holiday.localName || holiday.name,
    ]),
  );
  return (
    <div className="calendar-content">
      <div className="calendar-nav">
        <button
          onClick={() => setMonth(new Date(year, month.getMonth() - 1, 1))}
        >
          ‹
        </button>
        <strong>
          {year}. {String(month.getMonth() + 1).padStart(2, "0")}
        </strong>
        <button
          onClick={() => setMonth(new Date(year, month.getMonth() + 1, 1))}
        >
          ›
        </button>
      </div>
      <div className="calendar-grid calendar-weekdays">
        {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="calendar-grid">
        {cells.map((day, index) => {
          const date = day
            ? `${year}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            : "";
          const holiday = holidayMap.get(date);
          return (
            <span
              key={`${date}-${index}`}
              className={holiday ? "holiday" : ""}
              title={holiday || ""}
            >
              {day}
              {holiday && <i />}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function StudyTimer({
  widget,
  onData,
}: {
  widget: Widget;
  onData: (data: Widget["data"]) => void;
}) {
  const minutes = widget.data.timerMinutes || 25;
  const calculateRemaining = () =>
    widget.data.timerRunning && widget.data.timerEndsAt
      ? Math.max(
          0,
          Math.ceil(
            (new Date(widget.data.timerEndsAt).getTime() - Date.now()) / 1000,
          ),
        )
      : (widget.data.timerRemaining ?? minutes * 60);
  const [remaining, setRemaining] = useState(calculateRemaining);

  useEffect(() => {
    setRemaining(calculateRemaining());
    if (!widget.data.timerRunning || !widget.data.timerEndsAt) return;
    const id = window.setInterval(() => {
      const next = Math.max(
        0,
        Math.ceil(
          (new Date(widget.data.timerEndsAt!).getTime() - Date.now()) / 1000,
        ),
      );
      setRemaining(next);
      if (next === 0) {
        window.clearInterval(id);
        onData({
          ...widget.data,
          timerRemaining: 0,
          timerRunning: false,
          timerEndsAt: undefined,
        });
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [widget.data.timerEndsAt, widget.data.timerRunning, minutes]);

  const start = () => {
    const seconds = remaining || minutes * 60;
    onData({
      ...widget.data,
      timerRemaining: seconds,
      timerRunning: true,
      timerEndsAt: new Date(Date.now() + seconds * 1000).toISOString(),
    });
  };
  const pause = () =>
    onData({
      ...widget.data,
      timerRemaining: remaining,
      timerRunning: false,
      timerEndsAt: undefined,
    });
  const reset = () => {
    setRemaining(minutes * 60);
    onData({
      ...widget.data,
      timerRemaining: minutes * 60,
      timerRunning: false,
      timerEndsAt: undefined,
    });
  };

  return (
    <div className="study-timer">
      <strong>
        {String(Math.floor(remaining / 60)).padStart(2, "0")}:
        {String(remaining % 60).padStart(2, "0")}
      </strong>
      <div>
        <button onClick={widget.data.timerRunning ? pause : start}>
          {widget.data.timerRunning ? "PAUSE" : "START"}
        </button>
        <button onClick={reset}>RESET</button>
      </div>
    </div>
  );
}

function CountdownWidget({
  widget,
  onFontSize,
}: {
  widget: Widget;
  onFontSize: (fontSize: number) => void;
}) {
  const target = widget.data.countdownDate
    ? new Date(`${widget.data.countdownDate}T00:00:00`)
    : new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.ceil((target.getTime() - today.getTime()) / 86400000);
  const text =
    days === 0 ? "D-DAY" : days > 0 ? `D-${days}` : `D+${Math.abs(days)}`;
  const fontSize = widget.data.countdownFontSize || 56;
  const resizeText = (next: number) =>
    onFontSize(Math.min(120, Math.max(28, next)));

  return (
    <div className="countdown-content">
      <strong style={{ fontSize }}>{text}</strong>
      <div className="countdown-controls">
        <button aria-label="글자 작게" onClick={() => resizeText(fontSize - 4)}>
          A−
        </button>
        <button aria-label="글자 크게" onClick={() => resizeText(fontSize + 4)}>
          A＋
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [store, setStore] = useState<Store>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = localStorage.getItem("ssafy-dashboard-v1");
      return raw ? normalizeStore(JSON.parse(raw)) : initial;
    } catch {
      return initial;
    }
  });
  const [modal, setModal] = useState<{ type: Kind; widgetId?: string } | null>(
    null,
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [selectionBox, setSelectionBox] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [toast, setToast] = useState("");
  const [clock, setClock] = useState(new Date());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState<
    "workspaces" | "widgets" | "sizes" | "theme" | "data"
  >("workspaces");
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragIdsRef = useRef<string[]>([]);
  const selectedRef = useRef<string[]>([]);

  useEffect(() => {
    localStorage.setItem(
      "ssafy-dashboard-v1",
      JSON.stringify({ ...store, exportedAt: now() }),
    );
  }, [store]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  const update = (id: string, patch: Partial<Widget>) =>
    setStore((s) => ({
      ...s,
      widgets: s.widgets.map((w) =>
        w.id === id ? { ...w, ...patch, updatedAt: now() } : w,
      ),
    }));
  const updateLayout = (id: string, layout: Partial<Layout>) =>
    setStore((s) => ({
      ...s,
      widgets: s.widgets.map((w) =>
        w.id === id
          ? { ...w, layout: { ...w.layout, ...layout }, updatedAt: now() }
          : w,
      ),
    }));

  useEffect(() => {
    const selector = ".widget";
    if (!canvasRef.current) {
      interact(selector).unset();
      return;
    }
    interact(selector)
      .draggable({
        allowFrom: ".drag-handle",
        listeners: {
          start(e) {
            const id = (e.target as HTMLElement).dataset.id || "";
            dragIdsRef.current = selectedRef.current.includes(id)
              ? selectedRef.current
              : [id];
            if (!selectedRef.current.includes(id)) {
              selectedRef.current = [id];
              setSelected([id]);
            }
            document.body.classList.add("is-dragging");
          },
          move(e) {
            for (const id of dragIdsRef.current) {
              const target = canvasRef.current?.querySelector<HTMLElement>(
                `[data-id="${id}"]`,
              );
              if (!target) continue;
              const nextX = Number(target.dataset.x || 0) + e.dx;
              const nextY = Math.max(0, Number(target.dataset.y || 0) + e.dy);
              target.style.transform = `translate(${nextX}px, ${nextY}px)`;
              target.dataset.x = String(nextX);
              target.dataset.y = String(nextY);
            }
          },
          end() {
            const positions = new Map(
              dragIdsRef.current.map((id) => {
                const el = canvasRef.current?.querySelector<HTMLElement>(
                  `[data-id="${id}"]`,
                );
                return [
                  id,
                  {
                    x: Number(el?.dataset.x || 0),
                    y: Number(el?.dataset.y || 0),
                  },
                ] as const;
              }),
            );
            setStore((s) => ({
              ...s,
              widgets: s.widgets.map((w) =>
                positions.has(w.id)
                  ? {
                      ...w,
                      layout: { ...w.layout, ...positions.get(w.id)! },
                      updatedAt: now(),
                    }
                  : w,
              ),
            }));
            document.body.classList.remove("is-dragging");
          },
        },
      })
      .resizable({
        edges: { right: ".resize-corner", bottom: ".resize-corner" },
        modifiers: [
          interact.modifiers.restrictSize({ min: { width: 210, height: 86 } }),
        ],
        listeners: {
          move(e) {
            const target = e.target as HTMLElement;
            const isBookmark = target.dataset.type === "bookmark";
            const width = Math.max(isBookmark ? 210 : 240, e.rect.width);
            const height = Math.max(isBookmark ? 86 : 150, e.rect.height);
            const x = Number(target.dataset.x || 0) + e.deltaRect.left;
            const y = Math.max(
              0,
              Number(target.dataset.y || 0) + e.deltaRect.top,
            );
            target.style.width = `${width}px`;
            target.style.height = `${height}px`;
            target.style.transform = `translate(${x}px, ${y}px)`;
            target.dataset.x = String(x);
            target.dataset.y = String(y);
            target.dataset.width = String(width);
            target.dataset.height = String(height);
          },
          end(e) {
            const target = e.target as HTMLElement;
            updateLayout(target.dataset.id || "", {
              x: Number(target.dataset.x || 0),
              y: Number(target.dataset.y || 0),
              width: Number(target.dataset.width || 0),
              height: Number(target.dataset.height || 0),
            });
          },
        },
      });
    return () => {
      interact(selector).unset();
      document.body.classList.remove("is-dragging");
    };
  }, [settingsOpen, store.settings.grid, store.widgets]);

  const visibleWidgets = useMemo(
    () =>
      store.widgets.filter((w) => w.workspaceId === store.activeWorkspaceId),
    [store.widgets, store.activeWorkspaceId],
  );
  const modalWidget = modal?.widgetId
    ? store.widgets.find((w) => w.id === modal.widgetId)
    : undefined;
  const addWidget = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const type = modal!.type;
    const title = String(
      form.get("title") ||
        (type === "calendar"
          ? "달력"
          : type === "timer" || type === "countdown"
            ? ""
            : "새 위젯"),
    );
    const borderColor = String(form.get("borderColor") || "#303b47");
    const presetId = String(form.get("sizePreset") || "");
    const workspaceId = String(form.get("workspaceId") || "");
    const data =
      type === "launcher"
        ? {
            launcherLabel: String(form.get("launcherLabel") || "WEBEX"),
            launcherUrl: String(
              form.get("launcherUrl") || "https://www.webex.com/",
            ),
          }
        : type === "timer"
          ? {
              timerMinutes: Number(form.get("timerMinutes") || 25),
              timerRemaining: Number(form.get("timerMinutes") || 25) * 60,
              timerRunning: false,
            }
          : type === "countdown"
            ? {
                countdownDate: String(form.get("countdownDate") || ""),
                countdownFontSize: modalWidget?.data.countdownFontSize || 56,
              }
            : type === "weather"
              ? {
                  locationName: String(form.get("locationName") || "서울"),
                  latitude: Number(form.get("latitude") || 37.5665),
                  longitude: Number(form.get("longitude") || 126.978),
                }
              : type === "calendar"
                ? {}
                : type === "bookmark"
                  ? { url: String(form.get("content") || "https://") }
                  : type === "note"
                    ? { body: String(form.get("content") || "") }
                    : {
                        done: modalWidget?.data.done || false,
                        due: String(form.get("due") || ""),
                        priority: String(form.get("priority") || "MEDIUM"),
                      };
    if (modal?.widgetId) {
      setStore((s) => {
        const preset = s.settings.sizePresets.find((p) => p.id === presetId);
        return {
          ...s,
          widgets: s.widgets.map((w) =>
            w.id === modal.widgetId
              ? {
                  ...w,
                  title,
                  data,
                  workspaceId: workspaceId || w.workspaceId,
                  style: { borderColor },
                  layout: preset
                    ? {
                        ...w.layout,
                        width: preset.width,
                        height: preset.height,
                      }
                    : w.layout,
                  updatedAt: now(),
                }
              : w,
          ),
        };
      });
      setToast("위젯을 수정했습니다.");
    } else {
      setStore((s) => {
        const preset =
          s.settings.sizePresets.find((p) => p.id === presetId) ||
          s.settings.sizePresets[0];
        const contentMinimum =
          type === "calendar"
            ? { width: 320, height: 350 }
            : type === "weather"
              ? { width: 330, height: 270 }
              : { width: 0, height: 0 };
        return {
          ...s,
          widgets: [
            ...s.widgets,
            {
              ...make(
                type,
                title,
                80 + (visibleWidgets.length % 4) * 40,
                80 + (visibleWidgets.length % 5) * 40,
                data,
              ),
              workspaceId: s.activeWorkspaceId,
              style: {
                borderColor:
                  borderColor === "#303b47"
                    ? s.settings.widgetColors[type]
                    : borderColor,
              },
              layout: {
                ...make(type, title, 0, 0, data).layout,
                x: 80 + (visibleWidgets.length % 4) * 40,
                y: 80 + (visibleWidgets.length % 5) * 40,
                width: Math.max(preset.width, contentMinimum.width),
                height: Math.max(preset.height, contentMinimum.height),
              },
            },
          ],
        };
      });
      setToast("위젯을 추가했습니다.");
    }
    setModal(null);
  };
  const remove = (id: string) => {
    if (!confirm("이 위젯을 삭제할까요?")) return;
    setStore((s) => ({ ...s, widgets: s.widgets.filter((w) => w.id !== id) }));
    setToast("위젯을 삭제했습니다.");
  };
  const exportJson = () => {
    const blob = new Blob(
      [JSON.stringify({ ...store, exportedAt: now() }, null, 2)],
      { type: "application/json" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ssafy-dashboard-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const importJson = async (file?: File) => {
    if (!file) return;
    try {
      const parsed = normalizeStore(JSON.parse(await file.text()));
      if (!confirm("현재 데이터를 백업 파일 내용으로 교체할까요?")) return;
      setStore(parsed);
      setToast("워크스페이스를 복원했습니다.");
    } catch {
      setToast("유효하지 않은 백업 파일입니다. 기존 데이터는 유지됩니다.");
    }
  };
  const beginSelection = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || event.target !== event.currentTarget) return;
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const start = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const base = event.ctrlKey ? selected : [];
    const move = (e: PointerEvent) => {
      const current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      const box = {
        x: Math.min(start.x, current.x),
        y: Math.min(start.y, current.y),
        width: Math.abs(current.x - start.x),
        height: Math.abs(current.y - start.y),
      };
      setSelectionBox(box);
      const hits = visibleWidgets
        .filter(
          (w) =>
            w.layout.x < box.x + box.width &&
            w.layout.x + w.layout.width > box.x &&
            w.layout.y < box.y + box.height &&
            w.layout.y + w.layout.height > box.y,
        )
        .map((w) => w.id);
      setSelected([...new Set([...base, ...hits])]);
    };
    const end = () => {
      setSelectionBox(null);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
    };
    if (!event.ctrlKey) setSelected([]);
    setSelectionBox({ x: start.x, y: start.y, width: 0, height: 0 });
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
  };

  return (
    <main data-theme={store.settings.theme}>
      <header className="topbar">
        <div className="brand">
          <span className="prompt">&gt;_</span>
          <div>
            <strong>
              SSAFY <em>DASHBOARD</em>
            </strong>
            <small>PERSONAL DEV WORKSPACE</small>
          </div>
        </div>
      </header>
      <section className="stats" aria-label="요약">
        <div className="datetime">
          <span>
            {new Intl.DateTimeFormat("ko-KR", {
              month: "short",
              day: "2-digit",
              weekday: "short",
            }).format(clock)}
          </span>
          <b>
            {new Intl.DateTimeFormat("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            }).format(clock)}
          </b>
          <small>{clock.getFullYear()}</small>
        </div>
        <div className="stats-spacer" />
        <div className="widget-create">
          <button className="widget-create-trigger">WIDGET＋</button>
          <div className="widget-menu">
            {(
              [
                "bookmark",
                "note",
                "todo",
                "weather",
                "calendar",
                "timer",
                "countdown",
                "launcher",
              ] as Kind[]
            ).map((type) => (
              <button
                key={type}
                style={{ color: store.settings.widgetColors[type] }}
                onClick={() => setModal({ type })}
              >
                {type === "launcher" ? "QUICK LAUNCH" : type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="canvas-wrap">
        <div className="canvas-label">
          <div className="workspace-tabs">
            <button
              className={settingsOpen ? "active settings-tab" : "settings-tab"}
              aria-label="설정"
              onClick={() => {
                setSettingsOpen(true);
                setSelected([]);
              }}
            >
              ⚙
            </button>
            {store.workspaces.map((ws) => (
              <button
                key={ws.id}
                className={
                  !settingsOpen && ws.id === store.activeWorkspaceId
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setSettingsOpen(false);
                  setSelected([]);
                  setStore((s) => ({ ...s, activeWorkspaceId: ws.id }));
                }}
              >
                {ws.name}
              </button>
            ))}
          </div>
        </div>
        {settingsOpen ? (
          <div className="settings-space">
            <aside>
              <div className="settings-title">PREFERENCES</div>
              <button
                className={settingsSection === "workspaces" ? "active" : ""}
                onClick={() => setSettingsSection("workspaces")}
              >
                워크스페이스
              </button>
              <button
                className={settingsSection === "widgets" ? "active" : ""}
                onClick={() => setSettingsSection("widgets")}
              >
                위젯 스타일
              </button>
              <button
                className={settingsSection === "sizes" ? "active" : ""}
                onClick={() => setSettingsSection("sizes")}
              >
                위젯 크기
              </button>
              <button
                className={settingsSection === "theme" ? "active" : ""}
                onClick={() => setSettingsSection("theme")}
              >
                페이지 테마
              </button>
              <button
                className={settingsSection === "data" ? "active" : ""}
                onClick={() => setSettingsSection("data")}
              >
                데이터 관리
              </button>
            </aside>
            <section>
              {settingsSection === "workspaces" ? (
                <>
                  <div className="settings-heading">
                    <div>
                      <small>SETTINGS</small>
                      <h2>워크스페이스 관리</h2>
                      <p>
                        워크스페이스를 추가하거나 이름을 바꾸고 삭제할 수
                        있습니다.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const name = prompt(
                          "새 워크스페이스 이름",
                          `SPACE ${store.workspaces.length + 1}`,
                        );
                        if (!name) return;
                        const id = crypto.randomUUID();
                        setStore((s) => ({
                          ...s,
                          workspaces: [...s.workspaces, { id, name }],
                          activeWorkspaceId: id,
                        }));
                      }}
                    >
                      ＋ 새 워크스페이스
                    </button>
                  </div>
                  <div className="workspace-manager">
                    {store.workspaces.map((ws) => (
                      <div className="workspace-row" key={ws.id}>
                        <div>
                          <span>{ws.name.slice(0, 1).toUpperCase()}</span>
                          <strong>{ws.name}</strong>
                          <small>
                            {
                              store.widgets.filter(
                                (w) => w.workspaceId === ws.id,
                              ).length
                            }{" "}
                            widgets
                          </small>
                        </div>
                        <div>
                          <button
                            onClick={() => {
                              const name = prompt(
                                "워크스페이스 이름 변경",
                                ws.name,
                              );
                              if (!name) return;
                              setStore((s) => ({
                                ...s,
                                workspaces: s.workspaces.map((w) =>
                                  w.id === ws.id ? { ...w, name } : w,
                                ),
                              }));
                            }}
                          >
                            이름 변경
                          </button>
                          <button
                            className="danger"
                            disabled={store.workspaces.length === 1}
                            onClick={() => {
                              if (
                                !confirm(
                                  `'${ws.name}' 워크스페이스와 포함된 위젯을 삭제할까요?`,
                                )
                              )
                                return;
                              setStore((s) => {
                                const remaining = s.workspaces.filter(
                                  (w) => w.id !== ws.id,
                                );
                                return {
                                  ...s,
                                  workspaces: remaining,
                                  activeWorkspaceId:
                                    s.activeWorkspaceId === ws.id
                                      ? remaining[0].id
                                      : s.activeWorkspaceId,
                                  widgets: s.widgets.filter(
                                    (w) => w.workspaceId !== ws.id,
                                  ),
                                };
                              });
                            }}
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : settingsSection === "widgets" ? (
                <>
                  <div className="settings-heading">
                    <div>
                      <small>APPEARANCE</small>
                      <h2>위젯 테두리</h2>
                      <p>
                        새 위젯에 적용할 타입별 기본 테두리 색상을 설정합니다.
                      </p>
                    </div>
                  </div>
                  <div className="widget-color-settings">
                    {(
                      [
                        "bookmark",
                        "note",
                        "todo",
                        "weather",
                        "calendar",
                        "timer",
                        "countdown",
                        "launcher",
                      ] as Kind[]
                    ).map((type) => (
                      <label key={type}>
                        <span className={`kind kind-${type}`}>
                          {type === "bookmark"
                            ? "↗"
                            : type === "note"
                              ? "≡"
                              : type === "todo"
                                ? "✓"
                                : type === "weather"
                                  ? "☁"
                                  : type === "calendar"
                                    ? "□"
                                    : type === "timer"
                                      ? "◷"
                                      : type === "countdown"
                                        ? "D"
                                        : "⚡"}
                        </span>
                        <strong>{type.toUpperCase()}</strong>
                        <input
                          type="color"
                          value={store.settings.widgetColors[type]}
                          onChange={(e) =>
                            setStore((s) => ({
                              ...s,
                              settings: {
                                ...s.settings,
                                widgetColors: {
                                  ...s.settings.widgetColors,
                                  [type]: e.target.value,
                                },
                              },
                            }))
                          }
                        />
                        <code>{store.settings.widgetColors[type]}</code>
                        <button
                          onClick={() =>
                            setStore((s) => ({
                              ...s,
                              widgets: s.widgets.map((w) =>
                                w.type === type
                                  ? {
                                      ...w,
                                      style: {
                                        borderColor:
                                          s.settings.widgetColors[type],
                                      },
                                    }
                                  : w,
                              ),
                            }))
                          }
                        >
                          기존 위젯에도 적용
                        </button>
                      </label>
                    ))}
                  </div>
                </>
              ) : settingsSection === "sizes" ? (
                <>
                  <div className="settings-heading">
                    <div>
                      <small>LAYOUT</small>
                      <h2>위젯 크기 프리셋</h2>
                      <p>위젯 생성과 수정 시 선택할 크기를 관리합니다.</p>
                    </div>
                    <button
                      onClick={() => {
                        const name = prompt("프리셋 이름", "새 크기");
                        if (!name) return;
                        const width = Number(prompt("너비(px)", "300"));
                        const height = Number(prompt("높이(px)", "200"));
                        if (
                          !Number.isFinite(width) ||
                          !Number.isFinite(height) ||
                          width < 240 ||
                          height < 150
                        )
                          return setToast("최소 크기는 240×150입니다.");
                        setStore((s) => ({
                          ...s,
                          settings: {
                            ...s.settings,
                            sizePresets: [
                              ...s.settings.sizePresets,
                              { id: crypto.randomUUID(), name, width, height },
                            ],
                          },
                        }));
                      }}
                    >
                      ＋ 프리셋 추가
                    </button>
                  </div>
                  <div className="size-preset-list">
                    {store.settings.sizePresets.map((preset) => (
                      <div key={preset.id}>
                        <span
                          className="size-preview"
                          style={{
                            aspectRatio: `${preset.width}/${preset.height}`,
                          }}
                        />
                        <strong>{preset.name}</strong>
                        <code>
                          {preset.width} × {preset.height}
                        </code>
                        <button
                          onClick={() => {
                            const name = prompt("프리셋 이름", preset.name);
                            if (!name) return;
                            const width = Number(
                              prompt("너비(px)", String(preset.width)),
                            );
                            const height = Number(
                              prompt("높이(px)", String(preset.height)),
                            );
                            if (
                              !Number.isFinite(width) ||
                              !Number.isFinite(height) ||
                              width < 240 ||
                              height < 150
                            )
                              return setToast("최소 크기는 240×150입니다.");
                            setStore((s) => ({
                              ...s,
                              settings: {
                                ...s.settings,
                                sizePresets: s.settings.sizePresets.map((p) =>
                                  p.id === preset.id
                                    ? { ...p, name, width, height }
                                    : p,
                                ),
                              },
                            }));
                          }}
                        >
                          수정
                        </button>
                        <button
                          className="danger"
                          disabled={store.settings.sizePresets.length === 1}
                          onClick={() =>
                            setStore((s) => ({
                              ...s,
                              settings: {
                                ...s.settings,
                                sizePresets: s.settings.sizePresets.filter(
                                  (p) => p.id !== preset.id,
                                ),
                              },
                            }))
                          }
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : settingsSection === "theme" ? (
                <>
                  <div className="settings-heading">
                    <div>
                      <small>APPEARANCE</small>
                      <h2>페이지 테마</h2>
                      <p>대시보드 전체의 색상 테마를 선택합니다.</p>
                    </div>
                  </div>
                  <div className="theme-options">
                    {(["dark", "light", "blue"] as Theme[]).map((theme) => (
                      <button
                        key={theme}
                        className={
                          store.settings.theme === theme ? "active" : ""
                        }
                        onClick={() =>
                          setStore((s) => ({
                            ...s,
                            settings: { ...s.settings, theme },
                          }))
                        }
                      >
                        <span className={`theme-swatch ${theme}`}>
                          <i />
                          <i />
                          <i />
                        </span>
                        <strong>
                          {theme === "dark"
                            ? "다크"
                            : theme === "light"
                              ? "화이트"
                              : "파스텔 블루"}
                        </strong>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="settings-heading">
                    <div>
                      <small>BACKUP</small>
                      <h2>데이터 관리</h2>
                      <p>
                        대시보드 전체 데이터를 파일로 내보내거나 이전 백업을
                        가져옵니다.
                      </p>
                    </div>
                  </div>
                  <div className="data-actions">
                    <article>
                      <strong>데이터 내보내기</strong>
                      <p>워크스페이스, 위젯, 설정을 JSON 파일로 저장합니다.</p>
                      <button onClick={exportJson}>↓ EXPORT</button>
                    </article>
                    <article>
                      <strong>데이터 가져오기</strong>
                      <p>저장해 둔 JSON 파일로 현재 대시보드를 복원합니다.</p>
                      <button onClick={() => fileRef.current?.click()}>
                        ↑ IMPORT
                      </button>
                      <input
                        ref={fileRef}
                        hidden
                        type="file"
                        accept="application/json"
                        onChange={(e) => importJson(e.target.files?.[0])}
                      />
                    </article>
                  </div>
                </>
              )}
            </section>
          </div>
        ) : (
          <div
            className="canvas"
            ref={canvasRef}
            onPointerDown={beginSelection}
            style={{
              height: Math.max(
                650,
                ...visibleWidgets.map((w) => w.layout.y + w.layout.height + 80),
              ),
            }}
          >
            {selectionBox && (
              <span
                className="selection-box"
                style={{
                  left: selectionBox.x,
                  top: selectionBox.y,
                  width: selectionBox.width,
                  height: selectionBox.height,
                }}
              />
            )}
            {visibleWidgets.map((w) => (
              <article
                key={w.id}
                data-id={w.id}
                data-type={w.type}
                data-x={w.layout.x}
                data-y={w.layout.y}
                data-width={w.layout.width}
                data-height={w.layout.height}
                data-z={w.layout.zIndex}
                className={`widget widget-${w.type} ${selected.includes(w.id) ? "selected" : ""}`}
                style={{
                  transform: `translate(${w.layout.x}px, ${w.layout.y}px)`,
                  width: w.layout.width,
                  height: w.layout.height,
                  zIndex: w.layout.zIndex,
                  borderColor: w.style.borderColor,
                }}
                onPointerDownCapture={(e) => {
                  if (e.button !== 0) return;
                  const nextZ =
                    Math.max(
                      0,
                      ...store.widgets.map((item) => item.layout.zIndex),
                    ) + 1;
                  e.currentTarget.style.zIndex = String(nextZ);
                  e.currentTarget.dataset.z = String(nextZ);
                }}
                onPointerUp={(e) => {
                  const nextZ = Number(e.currentTarget.dataset.z || 1);
                  const widgetId = w.id;
                  window.setTimeout(() => {
                    setStore((s) => ({
                      ...s,
                      widgets: s.widgets.map((item) =>
                        item.id === widgetId
                          ? {
                              ...item,
                              layout: { ...item.layout, zIndex: nextZ },
                              updatedAt: now(),
                            }
                          : item,
                      ),
                    }));
                  }, 0);
                }}
                onClick={(e) => {
                  if (
                    (e.target as HTMLElement).closest("button,a,input,textarea")
                  )
                    return;
                  if (e.ctrlKey)
                    setSelected((s) =>
                      s.includes(w.id)
                        ? s.filter((id) => id !== w.id)
                        : [...s, w.id],
                    );
                  else if (!selected.includes(w.id)) setSelected([w.id]);
                }}
              >
                <div className="widget-top drag-handle">
                  <Icon type={w.type} />
                  <span>{w.type.toUpperCase()}</span>
                  <div className="widget-tools">
                    <button
                      aria-label="수정"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => setModal({ type: w.type, widgetId: w.id })}
                    >
                      ✎
                    </button>
                    <button
                      aria-label="복제"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() =>
                        setStore((s) => ({
                          ...s,
                          widgets: [
                            ...s.widgets,
                            {
                              ...w,
                              id: crypto.randomUUID(),
                              layout: {
                                ...w.layout,
                                x: w.layout.x + 20,
                                y: w.layout.y + 20,
                              },
                            },
                          ],
                        }))
                      }
                    >
                      ⧉
                    </button>
                    <button
                      aria-label="삭제"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => remove(w.id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="widget-body">
                  {w.type === "bookmark" ? (
                    <a
                      className="bookmark-content"
                      href={w.data.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <h2>{w.title}</h2>
                    </a>
                  ) : (
                    <>
                      {w.type !== "calendar" && w.title && (
                        <h2
                          className="widget-title"
                          style={{ borderBottomColor: w.style.borderColor }}
                        >
                          {w.title}
                        </h2>
                      )}
                      {w.type === "note" && (
                        <textarea
                          aria-label={`${w.title} 내용`}
                          value={w.data.body || ""}
                          readOnly
                        />
                      )}
                      {w.type === "todo" && (
                        <div className="todo-footer">
                          <label className="todo">
                            <input
                              type="checkbox"
                              checked={!!w.data.done}
                              onChange={(e) =>
                                update(w.id, {
                                  data: { ...w.data, done: e.target.checked },
                                })
                              }
                            />
                            <span className={w.data.done ? "done" : ""}>
                              {w.data.done ? "COMPLETED" : "IN PROGRESS"}
                            </span>
                          </label>
                          <span className="todo-due">
                            {w.data.due || "NO DEADLINE"}
                          </span>
                          <span
                            className={`priority ${w.data.priority?.toLowerCase()}`}
                          >
                            {w.data.priority}
                          </span>
                        </div>
                      )}
                      {w.type === "weather" && <WeatherWidget widget={w} />}
                      {w.type === "calendar" && <CalendarWidget />}
                      {w.type === "timer" && (
                        <StudyTimer
                          widget={w}
                          onData={(data) => update(w.id, { data })}
                        />
                      )}
                      {w.type === "countdown" && (
                        <CountdownWidget
                          widget={w}
                          onFontSize={(fontSize) =>
                            setStore((s) => ({
                              ...s,
                              widgets: s.widgets.map((item) =>
                                item.id === w.id
                                  ? {
                                      ...item,
                                      data: {
                                        ...item.data,
                                        countdownFontSize: fontSize,
                                      },
                                      layout: {
                                        ...item.layout,
                                        width: Math.max(
                                          item.layout.width,
                                          Math.ceil(fontSize * 3.2 + 36),
                                        ),
                                        height: Math.max(
                                          item.layout.height,
                                          fontSize + (item.title ? 130 : 92),
                                        ),
                                      },
                                      updatedAt: now(),
                                    }
                                  : item,
                              ),
                            }))
                          }
                        />
                      )}
                      {w.type === "launcher" && (
                        <div className="quick-launch-grid">
                          <a
                            href={
                              w.data.launcherUrl || "https://www.webex.com/"
                            }
                            target="_blank"
                            rel="noreferrer"
                          >
                            <span>W</span>
                            <strong>{w.data.launcherLabel || "WEBEX"}</strong>
                          </a>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <span className="resize-corner" />
              </article>
            ))}
          </div>
        )}
      </section>
      <footer>
        <span>
          LOCAL STORAGE <b>ACTIVE</b>
        </span>
        <span>DATA STAYS ON THIS DEVICE</span>
        <span>SSAFY DASHBOARD · V1.0.1</span>
      </footer>
      {modal && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <form className="modal" onSubmit={addWidget}>
            <div>
              <span>
                {modalWidget ? "EDIT" : "NEW"} / {modal.type.toUpperCase()}
              </span>
              <button type="button" onClick={() => setModal(null)}>
                ×
              </button>
            </div>
            <h2>
              {modalWidget
                ? "위젯 수정"
                : `새 ${modal.type === "bookmark" ? "북마크" : modal.type === "note" ? "메모" : modal.type === "todo" ? "할 일" : modal.type === "weather" ? "날씨" : modal.type === "calendar" ? "달력" : modal.type === "timer" ? "학습 타이머" : modal.type === "countdown" ? "카운트다운" : "빠른 실행"}`}
            </h2>
            {modal.type !== "calendar" && (
              <label>
                제목
                <input
                  name="title"
                  required={
                    modal.type !== "timer" && modal.type !== "countdown"
                  }
                  autoFocus
                  defaultValue={modalWidget?.title}
                  placeholder="제목을 입력하세요"
                />
              </label>
            )}
            <label>
              위젯 크기
              <select
                name="sizePreset"
                defaultValue={
                  modalWidget ? "" : store.settings.sizePresets[0].id
                }
              >
                {modalWidget && <option value="">변경 안 함</option>}
                {store.settings.sizePresets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name} · {preset.width}×{preset.height}
                  </option>
                ))}
              </select>
            </label>
            {modalWidget && (
              <label>
                워크스페이스
                <select
                  name="workspaceId"
                  defaultValue={modalWidget.workspaceId}
                >
                  {store.workspaces.map((workspace) => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label>
              테두리 색상
              <input
                className="color-input"
                name="borderColor"
                type="color"
                defaultValue={
                  modalWidget?.style.borderColor ||
                  store.settings.widgetColors[modal.type]
                }
              />
            </label>
            {(modal.type === "bookmark" || modal.type === "note") && (
              <label>
                {modal.type === "bookmark" ? "URL" : "내용"}
                {modal.type === "note" ? (
                  <textarea
                    name="content"
                    rows={5}
                    defaultValue={modalWidget?.data.body}
                    placeholder="메모를 입력하세요"
                  />
                ) : (
                  <input
                    name="content"
                    type="url"
                    defaultValue={modalWidget?.data.url || "https://"}
                    required
                  />
                )}
              </label>
            )}
            {modal.type === "weather" && (
              <LocationPicker widget={modalWidget} />
            )}
            {modal.type === "timer" && (
              <label>
                학습 시간(분)
                <input
                  name="timerMinutes"
                  type="number"
                  min="1"
                  max="180"
                  defaultValue={modalWidget?.data.timerMinutes || 25}
                  required
                />
              </label>
            )}
            {modal.type === "countdown" && (
              <label>
                목표 날짜
                <input
                  name="countdownDate"
                  type="date"
                  defaultValue={
                    modalWidget?.data.countdownDate ||
                    new Date(Date.now() + 30 * 86400000)
                      .toISOString()
                      .slice(0, 10)
                  }
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  required
                />
              </label>
            )}
            {modal.type === "launcher" && (
              <>
                <label>
                  버튼 이름
                  <input
                    name="launcherLabel"
                    defaultValue={modalWidget?.data.launcherLabel || "WEBEX"}
                    required
                  />
                </label>
                <label>
                  실행 URL
                  <input
                    name="launcherUrl"
                    type="url"
                    defaultValue={
                      modalWidget?.data.launcherUrl || "https://www.webex.com/"
                    }
                    required
                  />
                </label>
              </>
            )}
            {modal.type === "todo" && (
              <>
                <label>
                  마감일
                  <input
                    name="due"
                    type="date"
                    defaultValue={
                      modalWidget?.data.due ||
                      new Date().toISOString().slice(0, 10)
                    }
                    onClick={(e) => e.currentTarget.showPicker?.()}
                  />
                </label>
                <label>
                  우선순위
                  <select
                    name="priority"
                    defaultValue={modalWidget?.data.priority || "MEDIUM"}
                  >
                    <option>HIGH</option>
                    <option>MEDIUM</option>
                    <option>LOW</option>
                  </select>
                </label>
              </>
            )}
            <div className="modal-actions">
              <button type="button" onClick={() => setModal(null)}>
                CANCEL
              </button>
              <button type="submit">
                {modalWidget ? "SAVE CHANGES" : "CREATE WIDGET"}
              </button>
            </div>
          </form>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </main>
  );
}
