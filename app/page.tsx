"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import interact from "interactjs";
import { z } from "zod";

type Kind = "bookmark" | "note" | "todo" | "weather" | "calendar";
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
      type: z.enum(["bookmark", "note", "todo", "weather", "calendar"]),
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
};
const DEFAULT_SIZE_PRESETS: SizePreset[] = [
  { id: "size-default", name: "κΈ°λ³Έ", width: 300, height: 200 },
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
    message: "κΎΈμ¤€ν•¨μ΄ κ²°κµ­ μ‹¤λ ¥μ„ λ§λ“ λ‹¤.",
    widgetColors: DEFAULT_WIDGET_COLORS,
    sizePresets: DEFAULT_SIZE_PRESETS,
    theme: "dark",
  },
  workspaces: [{ id: MAIN_WORKSPACE, name: "MAIN" }],
  activeWorkspaceId: MAIN_WORKSPACE,
  widgets: [
    make("bookmark", "SSAFY GITLAB", 40, 40, { url: "https://lab.ssafy.com" }),
    make("todo", "μ¤λμ ν•™μµ", 360, 40, {
      done: false,
      due: new Date().toISOString().slice(0, 10),
      priority: "HIGH",
    }),
    make("note", "μ•κ³ λ¦¬μ¦ λ©”λª¨", 40, 270, {
      body: "BFS: νμ— λ„£μ„ λ• λ°©λ¬Έ μ²λ¦¬\nμ‹κ°„λ³µμ΅λ„ O(V + E)",
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
      message: parsed.settings.message || "κΎΈμ¤€ν•¨μ΄ κ²°κµ­ μ‹¤λ ¥μ„ λ§λ“ λ‹¤.",
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
        ? "β†—"
        : type === "note"
          ? "β‰΅"
          : type === "todo"
            ? "β“"
            : type === "weather"
              ? "β"
              : "β–΅"}
    </span>
  );
}

const KOREAN_CITIES = [
  { id: "seoul", name: "μ„μΈ", latitude: 37.5665, longitude: 126.978 },
  { id: "busan", name: "λ¶€μ‚°", latitude: 35.1796, longitude: 129.0756 },
  { id: "daegu", name: "λ€κµ¬", latitude: 35.8714, longitude: 128.6014 },
  { id: "incheon", name: "μΈμ²", latitude: 37.4563, longitude: 126.7052 },
  { id: "gwangju", name: "κ΄‘μ£Ό", latitude: 35.1595, longitude: 126.8526 },
  { id: "daejeon", name: "λ€μ „", latitude: 36.3504, longitude: 127.3845 },
  { id: "ulsan", name: "μΈμ‚°", latitude: 35.5384, longitude: 129.3114 },
  { id: "sejong", name: "μ„ΈμΆ…", latitude: 36.48, longitude: 127.289 },
  { id: "suwon", name: "μμ›", latitude: 37.2636, longitude: 127.0286 },
  { id: "chuncheon", name: "μ¶μ²", latitude: 37.8813, longitude: 127.7298 },
  { id: "cheongju", name: "μ²­μ£Ό", latitude: 36.6424, longitude: 127.489 },
  { id: "jeonju", name: "μ „μ£Ό", latitude: 35.8242, longitude: 127.148 },
  { id: "changwon", name: "μ°½μ›", latitude: 35.2285, longitude: 128.6811 },
  { id: "jeju", name: "μ μ£Ό", latitude: 33.4996, longitude: 126.5312 },
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
  if (code === 0) return ["β€οΈ", "λ§‘μ"];
  if (code <= 3) return ["β›…", "κµ¬λ¦„"];
  if (code <= 48) return ["π«οΈ", "μ•κ°"];
  if (code <= 67) return ["π§οΈ", "λΉ„"];
  if (code <= 77) return ["π¨οΈ", "λ"];
  if (code <= 82) return ["π¦οΈ", "μ†λ‚κΈ°"];
  if (code <= 86) return ["π¨οΈ", "λ μ†λ‚κΈ°"];
  return ["β›οΈ", "λ‡μ°"];
};

function WeatherWidget({ cityId }: { cityId: string }) {
  const city =
    KOREAN_CITIES.find((item) => item.id === cityId) || KOREAN_CITIES[0];
  const [weather, setWeather] = useState<WeatherResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const cacheKey = `ssafy-weather-${city.id}`;
    const controller = new AbortController();
    const load = async () => {
      try {
        const params = new URLSearchParams({
          latitude: String(city.latitude),
          longitude: String(city.longitude),
          current: "temperature_2m,apparent_temperature,weather_code",
          daily:
            "temperature_2m_max,temperature_2m_min,precipitation_probability_max",
          timezone: "Asia/Seoul",
          forecast_days: "1",
          models: "kma_seamless",
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
        else setError("KMA μλ³΄ λ°μ΄ν„°λ¥Ό λ¶λ¬μ¬ μ μ—†μµλ‹λ‹¤.");
      }
    };
    load();
    return () => controller.abort();
  }, [city]);

  if (!weather)
    return <p className="api-state">{error || "KMA μλ³΄ λ¶λ¬μ¤λ” μ¤‘β€¦"}</p>;
  const [icon, label] = weatherLabel(weather.current.weather_code);
  return (
    <div className="weather-content">
      <div className="weather-main">
        <span className="weather-icon" aria-hidden="true">
          {icon}
        </span>
        <div>
          <strong>{city.name}</strong>
          <small>{label} Β· KMA SEAMLESS</small>
        </div>
        <b>{Math.round(weather.current.temperature_2m)}Β°</b>
      </div>
      <div className="weather-grid">
        <span>
          μ²΄κ° <b>{Math.round(weather.current.apparent_temperature)}Β°</b>
        </span>
        <span>
          μµκ³  <b>{Math.round(weather.daily.temperature_2m_max[0])}Β°</b>
        </span>
        <span>
          μµμ € <b>{Math.round(weather.daily.temperature_2m_min[0])}Β°</b>
        </span>
        <span>
          κ°•μ <b>{weather.daily.precipitation_probability_max[0]}%</b>
        </span>
      </div>
      <small className="api-updated">
        μ—…λ°μ΄νΈ {weather.current.time.replace("T", " ")}
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
          β€Ή
        </button>
        <strong>
          {year}. {String(month.getMonth() + 1).padStart(2, "0")}
        </strong>
        <button
          onClick={() => setMonth(new Date(year, month.getMonth() + 1, 1))}
        >
          β€Ί
        </button>
      </div>
      <div className="calendar-grid calendar-weekdays">
        {["μΌ", "μ›”", "ν™”", "μ", "λª©", "κΈ", "ν† "].map((day) => (
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
      <div className="holiday-list">
        {holidays
          .filter((holiday) =>
            holiday.date.startsWith(
              `${year}-${String(month.getMonth() + 1).padStart(2, "0")}`,
            ),
          )
          .map((holiday) => (
            <small key={holiday.date}>
              <b>{holiday.date.slice(8)}</b> {holiday.localName || holiday.name}
            </small>
          ))}
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
    setStoreχm{¶‰ΛkΊwµηM±…ΝΝ9…µ”υμ(€€€€€€€€€€€€€€€€€€€€€€€€€ΝΡ½Ι”ΉΝ•ΡΡ¥ΉΜΉΡ΅•µ”€τττΡ΅•µ”€ό€‰…Ρ¥Ω”€θ€(€€€€€€€€€€€€€€€€€€€€€€€τ(€€€€€€€€€€€€€€€€€€€€€€€½Ή±¥¬υμ ¤€τψ(€€€€€€€€€€€€€€€€€€€€€€€€€Ν•ΡMΡ½Ι” ΅Μ¤€τψ€΅μ(€€€€€€€€€€€€€€€€€€€€€€€€€€€€ΈΈΉΜ°(€€€€€€€€€€€€€€€€€€€€€€€€€€€Ν•ΡΡ¥ΉΜθμ€ΈΈΉΜΉΝ•ΡΡ¥ΉΜ°Ρ΅•µ”τ°(€€€€€€€€€€€€€€€€€€€€€€€€€τ¤¤(€€€€€€€€€€€€€€€€€€€€€€€τ(€€€€€€€€€€€€€€€€€€€€€€ψ(€€€€€€€€€€€€€€€€€€€€€€€€ρΝΑ…Έ±…ΝΝ9…µ”υνΡ΅•µ”µΝέ…Ρ €‘νΡ΅•µ•υτψ(€€€€€€€€€€€€€€€€€€€€€€€€€€ρ¤€Όψ(€€€€€€€€€€€€€€€€€€€€€€€€€€ρ¤€Όψ(€€€€€€€€€€€€€€€€€€€€€€€€€€ρ¤€Όψ(€€€€€€€€€€€€€€€€€€€€€€€€π½ΝΑ…Έψ(€€€€€€€€€€€€€€€€€€€€€€€€ρΝΡΙ½Ήψ(€€€€€€€€€€€€€€€€€€€€€€€€€νΡ΅•µ”€τττ€‰‘…Ι¬(€€€€€€€€€€€€€€€€€€€€€€€€€€€€ό€‹®.“¶°(€€€€€€€€€€€€€€€€€€€€€€€€€€€€θΡ΅•µ”€τττ€‰±¥΅Π(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ό€‹¶fS²vΣ¶*ΰ(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€θ€‹¶23²*“¶Pƒ®βS® ‰τ(€€€€€€€€€€€€€€€€€€€€€€€€π½ΝΡΙ½Ήψ(€€€€€€€€€€€€€€€€€€€€€€π½‰ΥΡΡ½Έψ(€€€€€€€€€€€€€€€€€€€€¤¥τ(€€€€€€€€€€€€€€€€€€π½‘¥Ψψ(€€€€€€€€€€€€€€€€πΌψ(€€€€€€€€€€€€€€¤€θ€ (€€€€€€€€€€€€€€€€πψ(€€€€€€€€€€€€€€€€€€ρ‘¥Ψ±…ΝΝ9…µ”τ‰Ν•ΡΡ¥ΉΜµ΅•…‘¥Ήψ(€€€€€€€€€€€€€€€€€€€€ρ‘¥Ψψ(€€€€€€€€€€€€€€€€€€€€€€ρΝµ…±°ω	-U@π½Νµ…±°ψ(€€€€€€€€€€€€€€€€€€€€€€ρ Θϋ®6Γ²vΣ¶ΐƒªÒ®°π½ Θψ(€€€€€€€€€€€€€€€€€€€€€€ρΐψ(€€€€€€€€€€€€€€€€€€€€€€€ƒ®2².s®ΞΣ®Npƒ²‚²ΚΠƒ®6Γ²vΣ¶Γ®–πƒ¶23²vσ®†pƒ®
Σ®ΞΣ®
ΣªΖΓ®
`ƒ²vΣ²‚ƒ®ΒΗ²^²v(€€€€€€€€€€€€€€€€€€€€€€€ƒªΒ²‚γ²bΧ®.#®.Έ(€€€€€€€€€€€€€€€€€€€€€€π½ΐψ(€€€€€€€€€€€€€€€€€€€€π½‘¥Ψψ(€€€€€€€€€€€€€€€€€€π½‘¥Ψψ(€€€€€€€€€€€€€€€€€€ρ‘¥Ψ±…ΝΝ9…µ”τ‰‘…Ρ„µ…Ρ¥½ΉΜψ(€€€€€€€€€€€€€€€€€€€€ρ…ΙΡ¥±”ψ(€€€€€€€€€€€€€€€€€€€€€€ρΝΡΙ½Ήϋ®6Γ²vΣ¶ΐƒ®
Σ®ΞΣ®
Σªβΐπ½ΝΡΙ½Ήψ(€€€€€€€€€€€€€€€€€€€€€€ρΐϋ²n3¶³²*“¶:c²vΣ²*°ƒ²r²‚Ό°ƒ²“²‚W²v)M=8ƒ¶23²vσ®†pƒ²‚²z—¶V§®.#®.Έπ½ΐψ(€€€€€€€€€€€€€€€€€€€€€€ρ‰ΥΡΡ½Έ½Ή±¥¬υν•αΑ½ΙΡ)Ν½ΉτϋLaA=IPπ½‰ΥΡΡ½Έψ(€€€€€€€€€€€€€€€€€€€€π½…ΙΡ¥±”ψ(€€€€€€€€€€€€€€€€€€€€ρ…ΙΡ¥±”ψ(€€€€€€€€€€€€€€€€€€€€€€ρΝΡΙ½Ήϋ®6Γ²vΣ¶ΐƒªΒ²‚γ²b“ªβΐπ½ΝΡΙ½Ήψ(€€€€€€€€€€€€€€€€€€€€€€ρΐϋ²‚²z—¶VΠƒ®FP)M=8ƒ¶23²vσ®†pƒ¶b²z°ƒ®2².s®ΞΣ®Ns®–πƒ®ΞΧ²nC¶V§®.#®.Έπ½ΐψ(€€€€€€€€€€€€€€€€€€€€€€ρ‰ΥΡΡ½Έ½Ή±¥¬υμ ¤€τψ™¥±•I•ΉΥΙΙ•ΉΠόΉ±¥¬ ¥τψ(€€€€€€€€€€€€€€€€€€€€€€€ƒD%5A=IP(€€€€€€€€€€€€€€€€€€€€€€π½‰ΥΡΡ½Έψ(€€€€€€€€€€€€€€€€€€€€€€ρ¥ΉΑΥΠ(€€€€€€€€€€€€€€€€€€€€€€€Ι•υν™¥±•I•™τ(€€€€€€€€€€€€€€€€€€€€€€€΅¥‘‘•Έ(€€€€€€€€€€€€€€€€€€€€€€€ΡεΑ”τ‰™¥±”(€€€€€€€€€€€€€€€€€€€€€€€…•ΑΠτ‰…ΑΑ±¥…Ρ¥½Έ½©Ν½Έ(€€€€€€€€€€€€€€€€€€€€€€€½Ή΅…Ή”υμ΅”¤€τψ¥µΑ½ΙΡ)Ν½Έ΅”ΉΡ…Ι•ΠΉ™¥±•ΜόΉlΑt¥τ(€€€€€€€€€€€€€€€€€€€€€€Όψ(€€€€€€€€€€€€€€€€€€€€π½…ΙΡ¥±”ψ(€€€€€€€€€€€€€€€€€€π½‘¥Ψψ(€€€€€€€€€€€€€€€€πΌψ(€€€€€€€€€€€€€€¥τ(€€€€€€€€€€€€π½Ν•Ρ¥½Έψ(€€€€€€€€€€π½‘¥Ψψ(€€€€€€€€¤€θ€ (€€€€€€€€€€ρ‘¥Ψ(€€€€€€€€€€€±…ΝΝ9…µ”τ‰…ΉΩ…Μ(€€€€€€€€€€€Ι•υν…ΉΩ…ΝI•™τ(€€€€€€€€€€€½ΉA½¥ΉΡ•Ι½έΈυν‰•¥ΉM•±•Ρ¥½Ήτ(€€€€€€€€€€€ΝΡε±”υνμ(€€€€€€€€€€€€€΅•¥΅Πθ5…Ρ Ήµ…ΰ (€€€€€€€€€€€€€€€€ΨΤΐ°(€€€€€€€€€€€€€€€€ΈΈΉΩ¥Ν¥‰±•]¥‘•ΡΜΉµ…ΐ ΅ά¤€τψάΉ±…ε½ΥΠΉδ€¬άΉ±…ε½ΥΠΉ΅•¥΅Π€¬€ΰΐ¤°(€€€€€€€€€€€€€€¤°(€€€€€€€€€€€υτ(€€€€€€€€€€ψ(€€€€€€€€€€€νΝ•±•Ρ¥½Ή	½ΰ€€ (€€€€€€€€€€€€€€ρΝΑ…Έ(€€€€€€€€€€€€€€€±…ΝΝ9…µ”τ‰Ν•±•Ρ¥½Έµ‰½ΰ(€€€€€€€€€€€€€€€ΝΡε±”υνμ(€€€€€€€€€€€€€€€€€±•™ΠθΝ•±•Ρ¥½Ή	½ΰΉΰ°(€€€€€€€€€€€€€€€€€Ρ½ΐθΝ•±•Ρ¥½Ή	½ΰΉδ°(€€€€€€€€€€€€€€€€€έ¥‘Ρ θΝ•±•Ρ¥½Ή	½ΰΉέ¥‘Ρ °(€€€€€€€€€€€€€€€€€΅•¥΅ΠθΝ•±•Ρ¥½Ή	½ΰΉ΅•¥΅Π°(€€€€€€€€€€€€€€€υτ(€€€€€€€€€€€€€€Όψ(€€€€€€€€€€€€¥τ(€€€€€€€€€€€νΩ¥Ν¥‰±•]¥‘•ΡΜΉµ…ΐ ΅ά¤€τψ€ (€€€€€€€€€€€€€€ρ…ΙΡ¥±”(€€€€€€€€€€€€€€€­•δυνάΉ¥‘τ(€€€€€€€€€€€€€€€‘…Ρ„µ¥υνάΉ¥‘τ(€€€€€€€€€€€€€€€‘…Ρ„µΰυνάΉ±…ε½ΥΠΉατ(€€€€€€€€€€€€€€€‘…Ρ„µδυνάΉ±…ε½ΥΠΉετ(€€€€€€€€€€€€€€€‘…Ρ„µέ¥‘Ρ υνάΉ±…ε½ΥΠΉέ¥‘Ρ΅τ(€€€€€€€€€€€€€€€‘…Ρ„µ΅•¥΅ΠυνάΉ±…ε½ΥΠΉ΅•¥΅Ρτ(€€€€€€€€€€€€€€€‘…Ρ„µθυνάΉ±…ε½ΥΠΉι%Ή‘•ατ(€€€€€€€€€€€€€€€±…ΝΝ9…µ”υνέ¥‘•Π€‘νΝ•±•Ρ•Ή¥Ή±Υ‘•Μ΅άΉ¥¤€ό€‰Ν•±•Ρ•€θ€‰υτ(€€€€€€€€€€€€€€€ΝΡε±”υνμ(€€€€€€€€€€€€€€€€€ΡΙ…ΉΝ™½Ι΄θΡΙ…ΉΝ±…Ρ” ‘νάΉ±…ε½ΥΠΉαυΑΰ°€‘νάΉ±…ε½ΥΠΉευΑΰ¥€°(€€€€€€€€€€€€€€€€€έ¥‘Ρ θάΉ±…ε½ΥΠΉέ¥‘Ρ °(€€€€€€€€€€€€€€€€€΅•¥΅ΠθάΉ±…ε½ΥΠΉ΅•¥΅Π°(€€€€€€€€€€€€€€€€€ι%Ή‘•ΰθάΉ±…ε½ΥΠΉι%Ή‘•ΰ°(€€€€€€€€€€€€€€€€€‰½Ι‘•Ι½±½ΘθάΉΝΡε±”Ή‰½Ι‘•Ι½±½Θ°(€€€€€€€€€€€€€€€υτ(€€€€€€€€€€€€€€€½ΉA½¥ΉΡ•Ι½έΉ…ΑΡΥΙ”υμ΅”¤€τψμ(€€€€€€€€€€€€€€€€€¥€΅”Ή‰ΥΡΡ½Έ€„ττ€ΐ¤Ι•ΡΥΙΈμ(€€€€€€€€€€€€€€€€€½ΉΝΠΉ•αΡh€τ(€€€€€€€€€€€€€€€€€€€5…Ρ Ήµ…ΰ (€€€€€€€€€€€€€€€€€€€€€€ΐ°(€€€€€€€€€€€€€€€€€€€€€€ΈΈΉΝΡ½Ι”Ήέ¥‘•ΡΜΉµ…ΐ ΅¥Ρ•΄¤€τψ¥Ρ•΄Ή±…ε½ΥΠΉι%Ή‘•ΰ¤°(€€€€€€€€€€€€€€€€€€€€¤€¬€Δμ(€€€€€€€€€€€€€€€€€”ΉΥΙΙ•ΉΡQ…Ι•ΠΉΝΡε±”Ήι%Ή‘•ΰ€τMΡΙ¥Ή΅Ή•αΡh¤μ(€€€€€€€€€€€€€€€€€”ΉΥΙΙ•ΉΡQ…Ι•ΠΉ‘…Ρ…Ν•ΠΉθ€τMΡΙ¥Ή΅Ή•αΡh¤μ(€€€€€€€€€€€€€€€υτ(€€€€€€€€€€€€€€€½ΉA½¥ΉΡ•ΙUΐυμ΅”¤€τψμ(€€€€€€€€€€€€€€€€€½ΉΝΠΉ•αΡh€τ9Υµ‰•Θ΅”ΉΥΙΙ•ΉΡQ…Ι•ΠΉ‘…Ρ…Ν•ΠΉθρπ€Δ¤μ(€€€€€€€€€€€€€€€€€½ΉΝΠέ¥‘•Ρ%€τάΉ¥μ(€€€€€€€€€€€€€€€€€έ¥Ή‘½άΉΝ•ΡQ¥µ•½ΥΠ  ¤€τψμ(€€€€€€€€€€€€€€€€€€€Ν•ΡMΡ½Ι” ΅Μ¤€τψ€΅μ(€€€€€€€€€€€€€€€€€€€€€€ΈΈΉΜ°(€€€€€€€€€€€€€€€€€€€€€έ¥‘•ΡΜθΜΉέ¥‘•ΡΜΉµ…ΐ ΅¥Ρ•΄¤€τψ(€€€€€€€€€€€€€€€€€€€€€€€¥Ρ•΄Ή¥€τττέ¥‘•Ρ%(€€€€€€€€€€€€€€€€€€€€€€€€€€όμ(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ΈΈΉ¥Ρ•΄°(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€±…ε½ΥΠθμ€ΈΈΉ¥Ρ•΄Ή±…ε½ΥΠ°ι%Ή‘•ΰθΉ•αΡhτ°(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ΥΑ‘…Ρ•‘ΠθΉ½ά ¤°(€€€€€€€€€€€€€€€€€€€€€€€€€€€τ(€€€€€€€€€€€€€€€€€€€€€€€€€€θ¥Ρ•΄°(€€€€€€€€€€€€€€€€€€€€€€¤°(€€€€€€€€€€€€€€€€€€€τ¤¤μ(€€€€€€€€€€€€€€€€€τ°€ΐ¤μ(€€€€€€€€€€€€€€€υτ(€€€€€€€€€€€€€€€½Ή±¥¬υμ΅”¤€τψμ(€€€€€€€€€€€€€€€€€¥€ (€€€€€€€€€€€€€€€€€€€€΅”ΉΡ…Ι•Π…Μ!Q51±•µ•ΉΠ¤Ή±½Ν•ΝΠ ‰‰ΥΡΡ½Έ±„±¥ΉΑΥΠ±Ρ•αΡ…Ι•„¤(€€€€€€€€€€€€€€€€€€¤(€€€€€€€€€€€€€€€€€€€Ι•ΡΥΙΈμ(€€€€€€€€€€€€€€€€€¥€΅”ΉΡΙ±-•δ¤(€€€€€€€€€€€€€€€€€€€Ν•ΡM•±•Ρ• ΅Μ¤€τψ(€€€€€€€€€€€€€€€€€€€€€ΜΉ¥Ή±Υ‘•Μ΅άΉ¥¤(€€€€€€€€€€€€€€€€€€€€€€€€όΜΉ™¥±Ρ•Θ ΅¥¤€τψ¥€„ττάΉ¥¤(€€€€€€€€€€€€€€€€€€€€€€€€θlΈΈΉΜ°άΉ¥‘t°(€€€€€€€€€€€€€€€€€€€€¤μ(€€€€€€€€€€€€€€€€€•±Ν”¥€ …Ν•±•Ρ•Ή¥Ή±Υ‘•Μ΅άΉ¥¤¤Ν•ΡM•±•Ρ•΅mάΉ¥‘t¤μ(€€€€€€€€€€€€€€€υτ(€€€€€€€€€€€€€€ψ(€€€€€€€€€€€€€€€€ρ‘¥Ψ±…ΝΝ9…µ”τ‰έ¥‘•ΠµΡ½ΐ‘Ι…µ΅…Ή‘±”ψ(€€€€€€€€€€€€€€€€€€ρ%½ΈΡεΑ”υνάΉΡεΑ•τ€Όψ(€€€€€€€€€€€€€€€€€€ρΝΑ…ΈωνάΉΡεΑ”ΉΡ½UΑΑ•Ι…Ν” ¥τπ½ΝΑ…Έψ(€€€€€€€€€€€€€€€€€€ρ‘¥Ψ±…ΝΝ9…µ”τ‰έ¥‘•ΠµΡ½½±Μψ(€€€€€€€€€€€€€€€€€€€€ρ‰ΥΡΡ½Έ(€€€€€€€€€€€€€€€€€€€€€…Ι¥„µ±…‰•°τ‹²"c²‚T(€€€€€€€€€€€€€€€€€€€€€½ΉA½¥ΉΡ•Ι½έΈυμ΅”¤€τψ”ΉΝΡ½ΑAΙ½Α……Ρ¥½Έ ¥τ(€€€€€€€€€€€€€€€€€€€€€½Ή±¥¬υμ ¤€τψΝ•Ρ5½‘…°΅μΡεΑ”θάΉΡεΑ”°έ¥‘•Ρ%θάΉ¥τ¥τ(€€€€€€€€€€€€€€€€€€€€ψ(€€€€€€€€€€€€€€€€€€€€€ƒr8(€€€€€€€€€€€€€€€€€€€€π½‰ΥΡΡ½Έψ(€€€€€€€€€€€€€€€€€€€€ρ‰ΥΡΡ½Έ(€€€€€€€€€€€€€€€€€€€€€…Ι¥„µ±…‰•°τ‹®ΞΧ²‚p(€€€€€€€€€€€€€€€€€€€€€½ΉA½¥ΉΡ•Ι½έΈυμ΅”¤€τψ”ΉΝΡ½ΑAΙ½Α……Ρ¥½Έ ¥τ(€€€€€€€€€€€€€€€€€€€€€½Ή±¥¬υμ ¤€τψ(€€€€€€€€€€€€€€€€€€€€€€€Ν•ΡMΡ½Ι” ΅Μ¤€τψ€΅μ(€€€€€€€€€€€€€€€€€€€€€€€€€€ΈΈΉΜ°(€€€€€€€€€€€€€€€€€€€€€€€€€έ¥‘•ΡΜθl(€€€€€€€€€€€€€€€€€€€€€€€€€€€€ΈΈΉΜΉέ¥‘•ΡΜ°(€€€€€€€€€€€€€€€€€€€€€€€€€€€μ(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ΈΈΉά°(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€¥θΙεΑΡΌΉΙ…Ή‘½µUU% ¤°(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€±…ε½ΥΠθμ(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ΈΈΉάΉ±…ε½ΥΠ°(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ΰθάΉ±…ε½ΥΠΉΰ€¬€Θΐ°(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€δθάΉ±…ε½ΥΠΉδ€¬€Θΐ°(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€τ°(€€€€€€€€€€€€€€€€€€€€€€€€€€€τ°(€€€€€€€€€€€€€€€€€€€€€€€€€t°(€€€€€€€€€€€€€€€€€€€€€€€τ¤¤(€€€€€€€€€€€€€€€€€€€€€τ(€€€€€€€€€€€€€€€€€€€€ψ(€€€€€€€€€€€€€€€€€€€€€ƒ$(€€€€€€€€€€€€€€€€€€€€π½‰ΥΡΡ½Έψ(€€€€€€€€€€€€€€€€€€€€ρ‰ΥΡΡ½Έ(€€€€€€€€€€€€€€€€€€€€€…Ι¥„µ±…‰•°τ‹²
·²‚p(€€€€€€€€€€€€€€€€€€€€€½ΉA½¥ΉΡ•Ι½έΈυμ΅”¤€τψ”ΉΝΡ½ΑAΙ½Α……Ρ¥½Έ ¥τ(€€€€€€€€€€€€€€€€€€€€€½Ή±¥¬υμ ¤€τψΙ•µ½Ω”΅άΉ¥¥τ(€€€€€€€€€€€€€€€€€€€€ψ(€€€€€€€€€€€€€€€€€€€€€ƒ\(€€€€€€€€€€€€€€€€€€€€π½‰ΥΡΡ½Έψ(€€€€€€€€€€€€€€€€€€π½‘¥Ψψ(€€€€€€€€€€€€€€€€π½‘¥Ψψ(€€€€€€€€€€€€€€€€ρ‘¥Ψ±…ΝΝ9…µ”τ‰έ¥‘•Πµ‰½‘δψ(€€€€€€€€€€€€€€€€€νάΉΡεΑ”€τττ€‰‰½½­µ…Ι¬€ό€ (€€€€€€€€€€€€€€€€€€€€ρ„(€€€€€€€€€€€€€€€€€€€€€±…ΝΝ9…µ”τ‰‰½½­µ…Ι¬µ½ΉΡ•ΉΠ(€€€€€€€€€€€€€€€€€€€€€΅Ι•υνάΉ‘…Ρ„ΉΥΙ±τ(€€€€€€€€€€€€€€€€€€€€€Ρ…Ι•Πτ‰}‰±…Ή¬(€€€€€€€€€€€€€€€€€€€€€Ι•°τ‰Ή½Ι•™•ΙΙ•Θ(€€€€€€€€€€€€€€€€€€€€ψ(€€€€€€€€€€€€€€€€€€€€€€ρ ΘωνάΉΡ¥Ρ±•τπ½ Θψ(€€€€€€€€€€€€€€€€€€€€€€ρΐ±…ΝΝ9…µ”τ‰ΥΙ°ωνάΉ‘…Ρ„ΉΥΙ±τπ½ΐψ(€€€€€€€€€€€€€€€€€€€€€€ρΝΑ…Έ±…ΝΝ9…µ”τ‰‰½½­µ…Ι¬µ½Α•Έω=A8IM=UIƒ\π½ΝΑ…Έψ(€€€€€€€€€€€€€€€€€€€€π½„ψ(€€€€€€€€€€€€€€€€€€¤€θ€ (€€€€€€€€€€€€€€€€€€€€πψ(€€€€€€€€€€€€€€€€€€€€€€ρ ΘωνάΉΡ¥Ρ±•τπ½ Θψ(€€€€€€€€€€€€€€€€€€€€€νάΉΡεΑ”€τττ€‰Ή½Ρ”€€ (€€€€€€€€€€€€€€€€€€€€€€€€ρΡ•αΡ…Ι•„(€€€€€€€€€€€€€€€€€€€€€€€€€…Ι¥„µ±…‰•°υν€‘νάΉΡ¥Ρ±•τƒ®
Σ²j¥τ(€€€€€€€€€€€€€€€€€€€€€€€€€Ω…±Υ”υνάΉ‘…Ρ„Ή‰½‘δρπ€‰τ(€€€€€€€€€€€€€€€€€€€€€€€€€Ι•…‘=Ή±δ(€€€€€€€€€€€€€€€€€€€€€€€€Όψ(€€€€€€€€€€€€€€€€€€€€€€¥τ(€€€€€€€€€€€€€€€€€€€€€νάΉΡεΑ”€τττ€‰Ρ½‘Ό€€ (€€€€€€€€€€€€€€€€€€€€€€€€ρ‘¥Ψ±…ΝΝ9…µ”τ‰Ρ½‘Όµ™½½Ρ•Θψ(€€€€€€€€€€€€€€€€€€€€€€€€€€ρ±…‰•°±…ΝΝ9…µ”τ‰Ρ½‘Όψ(€€€€€€€€€€€€€€€€€€€€€€€€€€€€ρ¥ΉΑΥΠ(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ΡεΑ”τ‰΅•­‰½ΰ(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€΅•­•υμ„…άΉ‘…Ρ„Ή‘½Ή•τ(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€½Ή΅…Ή”υμ΅”¤€τψ(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ΥΑ‘…Ρ”΅άΉ¥°μ(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€‘…Ρ„θμ€ΈΈΉάΉ‘…Ρ„°‘½Ή”θ”ΉΡ…Ι•ΠΉ΅•­•τ°(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€τ¤(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€τ(€€€€€€€€€€€€€€€€€€€€€€€€€€€€Όψ(€€€€€€€€€€€€€€€€€€€€€€€€€€€€ρΝΑ…Έ±…ΝΝ9…µ”υνάΉ‘…Ρ„Ή‘½Ή”€ό€‰‘½Ή”€θ€‰τψ(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€νάΉ‘…Ρ„Ή‘½Ή”€ό€‰=5A1Q€θ€‰%8AI=IML‰τ(€€€€€€€€€€€€€€€€€€€€€€€€€€€€π½ΝΑ…Έψ(€€€€€€€€€€€€€€€€€€€€€€€€€€π½±…‰•°ψ(€€€€€€€€€€€€€€€€€€€€€€€€€€ρΝΑ…Έ±…ΝΝ9…µ”τ‰Ρ½‘Όµ‘Υ”ψ(€€€€€€€€€€€€€€€€€€€€€€€€€€€νάΉ‘…Ρ„Ή‘Υ”ρπ€‰9<1%9‰τ(€€€€€€€€€€€€€€€€€€€€€€€€€€π½ΝΑ…Έψ(€€€€€€€€€€€€€€€€€€€€€€€€€€ρΝΑ…Έ(€€€€€€€€€€€€€€€€€€€€€€€€€€€±…ΝΝ9…µ”υνΑΙ¥½Ι¥Ρδ€‘νάΉ‘…Ρ„ΉΑΙ¥½Ι¥ΡδόΉΡ½1½έ•Ι…Ν” ¥υτ(€€€€€€€€€€€€€€€€€€€€€€€€€€ψ(€€€€€€€€€€€€€€€€€€€€€€€€€€€νάΉ‘…Ρ„ΉΑΙ¥½Ι¥Ρετ(€€€€€€€€€€€€€€€€€€€€€€€€€€π½ΝΑ…Έψ(€€€€€€€€€€€€€€€€€€€€€€€€π½‘¥Ψψ(€€€€€€€€€€€€€€€€€€€€€€¥τ(€€€€€€€€€€€€€€€€€€€€€νάΉΡεΑ”€τττ€‰έ•…Ρ΅•Θ€€ (€€€€€€€€€€€€€€€€€€€€€€€€ρ]•…Ρ΅•Ι]¥‘•Π¥Ρε%υνάΉ‘…Ρ„Ή¥Ρδρπ€‰Ν•½Υ°‰τ€Όψ(€€€€€€€€€€€€€€€€€€€€€€¥τ(€€€€€€€€€€€€€€€€€€€€€νάΉΡεΑ”€τττ€‰…±•Ή‘…Θ€€ρ…±•Ή‘…Ι]¥‘•Π€Όωτ(€€€€€€€€€€€€€€€€€€€€πΌψ(€€€€€€€€€€€€€€€€€€¥τ(€€€€€€€€€€€€€€€€π½‘¥Ψψ(€€€€€€€€€€€€€€€€ρΝΑ…Έ±…ΝΝ9…µ”τ‰Ι•Ν¥ι”µ½ΙΉ•Θ€Όψ(€€€€€€€€€€€€€€π½…ΙΡ¥±”ψ(€€€€€€€€€€€€¤¥τ(€€€€€€€€€€π½‘¥Ψψ(€€€€€€€€¥τ(€€€€€€π½Ν•Ρ¥½Έψ(€€€€€€ρ™½½Ρ•Θψ(€€€€€€€€ρΝΑ…Έψ(€€€€€€€€€1=0MQ=I€ρωQ%Yπ½ψ(€€€€€€€€π½ΝΑ…Έψ(€€€€€€€€ρΝΑ…ΈωQMQeL=8Q!%LY%π½ΝΑ…Έψ(€€€€€€€€ρΝΑ…ΈωMMdM!	=Iƒ
άXΔΈΐΈΔπ½ΝΑ…Έψ(€€€€€€π½™½½Ρ•Θψ(€€€€€νµ½‘…°€€ (€€€€€€€€ρ‘¥Ψ(€€€€€€€€€±…ΝΝ9…µ”τ‰µ½‘…°µ‰…­‘Ι½ΐ(€€€€€€€€€½Ή5½ΥΝ•½έΈυμ΅”¤€τψ”ΉΡ…Ι•Π€τττ”ΉΥΙΙ•ΉΡQ…Ι•Π€Ν•Ρ5½‘…°΅ΉΥ±°¥τ(€€€€€€€€ψ(€€€€€€€€€€ρ™½Ι΄±…ΝΝ9…µ”τ‰µ½‘…°½ΉMΥ‰µ¥Πυν…‘‘]¥‘•Ρτψ(€€€€€€€€€€€€ρ‘¥Ψψ(€€€€€€€€€€€€€€ρΝΑ…Έψ(€€€€€€€€€€€€€€€νµ½‘…±]¥‘•Π€ό€‰%P€θ€‰9\‰τ€Όνµ½‘…°ΉΡεΑ”ΉΡ½UΑΑ•Ι…Ν” ¥τ(€€€€€€€€€€€€€€π½ΝΑ…Έψ(€€€€€€€€€€€€€€ρ‰ΥΡΡ½ΈΡεΑ”τ‰‰ΥΡΡ½Έ½Ή±¥¬υμ ¤€τψΝ•Ρ5½‘…°΅ΉΥ±°¥τψ(€€€€€€€€€€€€€€€ƒ\(€€€€€€€€€€€€€€π½‰ΥΡΡ½Έψ(€€€€€€€€€€€€π½‘¥Ψψ(€€€€€€€€€€€€ρ Θψ(€€€€€€€€€€€€€νµ½‘…±]¥‘•Π(€€€€€€€€€€€€€€€€ό€‹²r²‚Όƒ²"c²‚T(€€€€€€€€€€€€€€€€θƒ² €‘νµ½‘…°ΉΡεΑ”€τττ€‰‰½½­µ…Ι¬€ό€‹®Ϊ®#¶°€θµ½‘…°ΉΡεΑ”€τττ€‰Ή½Ρ”€ό€‹®¦S®ª €θµ½‘…°ΉΡεΑ”€τττ€‰Ρ½‘Ό€ό€‹¶V€ƒ²vπ€θµ½‘…°ΉΡεΑ”€τττ€‰έ•…Ρ΅•Θ€ό€‹®
ƒ²R €θ€‹®.³®‚”‰υτ(€€€€€€€€€€€€π½ Θψ(€€€€€€€€€€€€ρ±…‰•°ψ(€€€€€€€€€€€€€ƒ²‚s®ª¤(€€€€€€€€€€€€€€ρ¥ΉΑΥΠ(€€€€€€€€€€€€€€€Ή…µ”τ‰Ρ¥Ρ±”(€€€€€€€€€€€€€€€Ι•ΕΥ¥Ι•(€€€€€€€€€€€€€€€…ΥΡ½½ΥΜ(€€€€€€€€€€€€€€€‘•™…Υ±ΡY…±Υ”υνµ½‘…±]¥‘•ΠόΉΡ¥Ρ±•τ(€€€€€€€€€€€€€€€Α±…•΅½±‘•Θτ‹²‚s®ª§²vƒ²z®‚—¶Vc²γ²jP(€€€€€€€€€€€€€€Όψ(€€€€€€€€€€€€π½±…‰•°ψ(€€€€€€€€€€€€ρ±…‰•°ψ(€€€€€€€€€€€€€ƒ²r²‚Όƒ¶³ªβΐ(€€€€€€€€€€€€€€ρΝ•±•Π(€€€€€€€€€€€€€€€Ή…µ”τ‰Ν¥ι•AΙ•Ν•Π(€€€€€€€€€€€€€€€‘•™…Υ±ΡY…±Υ”υμ(€€€€€€€€€€€€€€€€€µ½‘…±]¥‘•Π€ό€€θΝΡ½Ι”ΉΝ•ΡΡ¥ΉΜΉΝ¥ι•AΙ•Ν•ΡΝlΑtΉ¥(€€€€€€€€€€€€€€€τ(€€€€€€€€€€€€€€ψ(€€€€€€€€€€€€€€€νµ½‘…±]¥‘•Π€€ρ½ΑΡ¥½ΈΩ…±Υ”τϋ®ΞªΚτƒ²V ƒ¶V π½½ΑΡ¥½Έωτ(€€€€€€€€€€€€€€€νΝΡ½Ι”ΉΝ•ΡΡ¥ΉΜΉΝ¥ι•AΙ•Ν•ΡΜΉµ…ΐ ΅ΑΙ•Ν•Π¤€τψ€ (€€€€€€€€€€€€€€€€€€ρ½ΑΡ¥½Έ­•δυνΑΙ•Ν•ΠΉ¥‘τΩ…±Υ”υνΑΙ•Ν•ΠΉ¥‘τψ(€€€€€€€€€€€€€€€€€€€νΑΙ•Ν•ΠΉΉ…µ•τƒ
άνΑΙ•Ν•ΠΉέ¥‘Ρ΅χ]νΑΙ•Ν•ΠΉ΅•¥΅Ρτ(€€€€€€€€€€€€€€€€€€π½½ΑΡ¥½Έψ(€€€€€€€€€€€€€€€€¤¥τ(€€€€€€€€€€€€€€π½Ν•±•Πψ(€€€€€€€€€€€€π½±…‰•°ψ(€€€€€€€€€€€νµ½‘…±]¥‘•Π€€ (€€€€€€€€€€€€€€ρ±…‰•°ψ(€€€€€€€€€€€€€€€ƒ²n3¶³²*“¶:c²vΣ²*(€€€€€€€€€€€€€€€€ρΝ•±•Π(€€€€€€€€€€€€€€€€€Ή…µ”τ‰έ½Ι­ΝΑ…•%(€€€€€€€€€€€€€€€€€‘•™…Υ±ΡY…±Υ”υνµ½‘…±]¥‘•ΠΉέ½Ι­ΝΑ…•%‘τ(€€€€€€€€€€€€€€€€ψ(€€€€€€€€€€€€€€€€€νΝΡ½Ι”Ήέ½Ι­ΝΑ…•ΜΉµ…ΐ ΅έ½Ι­ΝΑ…”¤€τψ€ (€€€€€€€€€€€€€€€€€€€€ρ½ΑΡ¥½Έ­•δυνέ½Ι­ΝΑ…”Ή¥‘τΩ…±Υ”υνέ½Ι­ΝΑ…”Ή¥‘τψ(€€€€€€€€€€€€€€€€€€€€€νέ½Ι­ΝΑ…”ΉΉ…µ•τ(€€€€€€€€€€€€€€€€€€€€π½½ΑΡ¥½Έψ(€€€€€€€€€€€€€€€€€€¤¥τ(€€€€€€€€€€€€€€€€π½Ν•±•Πψ(€€€€€€€€€€€€€€π½±…‰•°ψ(€€€€€€€€€€€€¥τ(€€€€€€€€€€€€ρ±…‰•°ψ(€€€€€€€€€€€€€ƒ¶3®FC®°ƒ²'²(€€€€€€€€€€€€€€ρ¥ΉΑΥΠ(€€€€€€€€€€€€€€€±…ΝΝ9…µ”τ‰½±½Θµ¥ΉΑΥΠ(€€€€€€€€€€€€€€€Ή…µ”τ‰‰½Ι‘•Ι½±½Θ(€€€€€€€€€€€€€€€ΡεΑ”τ‰½±½Θ(€€€€€€€€€€€€€€€‘•™…Υ±ΡY…±Υ”υμ(€€€€€€€€€€€€€€€€€µ½‘…±]¥‘•ΠόΉΝΡε±”Ή‰½Ι‘•Ι½±½Θρπ(€€€€€€€€€€€€€€€€€ΝΡ½Ι”ΉΝ•ΡΡ¥ΉΜΉέ¥‘•Ρ½±½ΙΝmµ½‘…°ΉΡεΑ•t(€€€€€€€€€€€€€€€τ(€€€€€€€€€€€€€€Όψ(€€€€€€€€€€€€π½±…‰•°ψ(€€€€€€€€€€€μ΅µ½‘…°ΉΡεΑ”€τττ€‰‰½½­µ…Ι¬ρπµ½‘…°ΉΡεΑ”€τττ€‰Ή½Ρ”¤€€ (€€€€€€€€€€€€€€ρ±…‰•°ψ(€€€€€€€€€€€€€€€νµ½‘…°ΉΡεΑ”€τττ€‰‰½½­µ…Ι¬€ό€‰UI0€θ€‹®
Σ²j¤‰τ(€€€€€€€€€€€€€€€νµ½‘…°ΉΡεΑ”€τττ€‰Ή½Ρ”€ό€ (€€€€€€€€€€€€€€€€€€ρΡ•αΡ…Ι•„(€€€€€€€€€€€€€€€€€€€Ή…µ”τ‰½ΉΡ•ΉΠ(€€€€€€€€€€€€€€€€€€€Ι½έΜυμΥτ(€€€€€€€€€€€€€€€€€€€‘•™…Υ±ΡY…±Υ”υνµ½‘…±]¥‘•ΠόΉ‘…Ρ„Ή‰½‘ετ(€€€€€€€€€€€€€€€€€€€Α±…•΅½±‘•Θτ‹®¦S®ª£®–πƒ²z®‚—¶Vc²γ²jP(€€€€€€€€€€€€€€€€€€Όψ(€€€€€€€€€€€€€€€€¤€θ€ (€€€€€€€€€€€€€€€€€€ρ¥ΉΑΥΠ(€€€€€€€€€€€€€€€€€€€Ή…µ”τ‰½ΉΡ•ΉΠ(€€€€€€€€€€€€€€€€€€€ΡεΑ”τ‰ΥΙ°(€€€€€€€€€€€€€€€€€€€‘•™…Υ±ΡY…±Υ”υνµ½‘…±]¥‘•ΠόΉ‘…Ρ„ΉΥΙ°ρπ€‰΅ΡΡΑΜθΌΌ‰τ(€€€€€€€€€€€€€€€€€€€Ι•ΕΥ¥Ι•(€€€€€€€€€€€€€€€€€€Όψ(€€€€€€€€€€€€€€€€¥τ(€€€€€€€€€€€€€€π½±…‰•°ψ(€€€€€€€€€€€€¥τ(€€€€€€€€€€€νµ½‘…°ΉΡεΑ”€τττ€‰έ•…Ρ΅•Θ€€ (€€€€€€€€€€€€€€ρ±…‰•°ψ(€€€€€€€€€€€€€€€ƒ²²^΄(€€€€€€€€€€€€€€€€ρΝ•±•Π(€€€€€€€€€€€€€€€€€Ή…µ”τ‰¥Ρδ(€€€€€€€€€€€€€€€€€‘•™…Υ±ΡY…±Υ”υνµ½‘…±]¥‘•ΠόΉ‘…Ρ„Ή¥Ρδρπ€‰Ν•½Υ°‰τ(€€€€€€€€€€€€€€€€ψ(€€€€€€€€€€€€€€€€€ν-=I9}%Q%LΉµ…ΐ ΅¥Ρδ¤€τψ€ (€€€€€€€€€€€€€€€€€€€€ρ½ΑΡ¥½Έ­•δυν¥ΡδΉ¥‘τΩ…±Υ”υν¥ΡδΉ¥‘τψ(€€€€€€€€€€€€€€€€€€€€€ν¥ΡδΉΉ…µ•τ(€€€€€€€€€€€€€€€€€€€€π½½ΑΡ¥½Έψ(€€€€€€€€€€€€€€€€€€¤¥τ(€€€€€€€€€€€€€€€€π½Ν•±•Πψ(€€€€€€€€€€€€€€π½±…‰•°ψ(€€€€€€€€€€€€¥τ(€€€€€€€€€€€νµ½‘…°ΉΡεΑ”€τττ€‰Ρ½‘Ό€€ (€€€€€€€€€€€€€€πψ(€€€€€€€€€€€€€€€€ρ±…‰•°ψ(€€€€€€€€€€€€€€€€€ƒ®#ªΒC²vπ(€€€€€€€€€€€€€€€€€€ρ¥ΉΑΥΠ(€€€€€€€€€€€€€€€€€€€Ή…µ”τ‰‘Υ”(€€€€€€€€€€€€€€€€€€€ΡεΑ”τ‰‘…Ρ”(€€€€€€€€€€€€€€€€€€€‘•™…Υ±ΡY…±Υ”υμ(€€€€€€€€€€€€€€€€€€€€€µ½‘…±]¥‘•ΠόΉ‘…Ρ„Ή‘Υ”ρπ(€€€€€€€€€€€€€€€€€€€€€Ή•ά…Ρ” ¤ΉΡ½%M=MΡΙ¥Ή ¤ΉΝ±¥” ΐ°€Δΐ¤(€€€€€€€€€€€€€€€€€€€τ(€€€€€€€€€€€€€€€€€€€½Ή±¥¬υμ΅”¤€τψ”ΉΥΙΙ•ΉΡQ…Ι•ΠΉΝ΅½έA¥­•ΘόΈ ¥τ(€€€€€€€€€€€€€€€€€€Όψ(€€€€€€€€€€€€€€€€π½±…‰•°ψ(€€€€€€€€€€€€€€€€ρ±…‰•°ψ(€€€€€€€€€€€€€€€€€ƒ²jΓ²ƒ²"s²r(€€€€€€€€€€€€€€€€€€ρΝ•±•Π(€€€€€€€€€€€€€€€€€€€Ή…µ”τ‰ΑΙ¥½Ι¥Ρδ(€€€€€€€€€€€€€€€€€€€‘•™…Υ±ΡY…±Υ”υνµ½‘…±]¥‘•ΠόΉ‘…Ρ„ΉΑΙ¥½Ι¥Ρδρπ€‰5%U4‰τ(€€€€€€€€€€€€€€€€€€ψ(€€€€€€€€€€€€€€€€€€€€ρ½ΑΡ¥½Έω!% π½½ΑΡ¥½Έψ(€€€€€€€€€€€€€€€€€€€€ρ½ΑΡ¥½Έω5%U4π½½ΑΡ¥½Έψ(€€€€€€€€€€€€€€€€€€€€ρ½ΑΡ¥½Έω1=\π½½ΑΡ¥½Έψ(€€€€€€€€€€€€€€€€€€π½Ν•±•Πψ(€€€€€€€€€€€€€€€€π½±…‰•°ψ(€€€€€€€€€€€€€€πΌψ(€€€€€€€€€€€€¥τ(€€€€€€€€€€€€ρ‘¥Ψ±…ΝΝ9…µ”τ‰µ½‘…°µ…Ρ¥½ΉΜψ(€€€€€€€€€€€€€€ρ‰ΥΡΡ½ΈΡεΑ”τ‰‰ΥΡΡ½Έ½Ή±¥¬υμ ¤€τψΝ•Ρ5½‘…°΅ΉΥ±°¥τψ(€€€€€€€€€€€€€€€90(€€€€€€€€€€€€€€π½‰ΥΡΡ½Έψ(€€€€€€€€€€€€€€ρ‰ΥΡΡ½ΈΡεΑ”τ‰ΝΥ‰µ¥Πψ(€€€€€€€€€€€€€€€νµ½‘…±]¥‘•Π€ό€‰MY!9L€θ€‰IQ]%P‰τ(€€€€€€€€€€€€€€π½‰ΥΡΡ½Έψ(€€€€€€€€€€€€π½‘¥Ψψ(€€€€€€€€€€π½™½Ι΄ψ(€€€€€€€€π½‘¥Ψψ(€€€€€€¥τ(€€€€€νΡ½…ΝΠ€€ (€€€€€€€€ρ‘¥Ψ±…ΝΝ9…µ”τ‰Ρ½…ΝΠΙ½±”τ‰ΝΡ…ΡΥΜψ(€€€€€€€€€νΡ½…ΝΡτ(€€€€€€€€π½‘¥Ψψ(€€€€€€¥τ(€€€€π½µ…¥Έψ(€€¤μ)τ(