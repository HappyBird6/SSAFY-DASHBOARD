"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import interact from "interactjs";
import { z } from "zod";

type Kind =
  | "bookmark"
  | "note"
  | "todo"
  | "todolist"
  | "weather"
  | "calendar"
  | "timer"
  | "countdown"
  | "fish"
  | "launcher";
type Layout = {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
};
type BookmarkLink = { id: string; label: string; url: string };
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
    links?: BookmarkLink[];
    body?: string;
    done?: boolean;
    due?: string;
    priority?: string;
    todolistSort?: "priority" | "date";
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
    fishSpecies?: string;
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
    catEnabled: boolean;
    catAnimationSpeed: number;
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
        todolist: z.string().optional(),
        weather: z.string().optional(),
        calendar: z.string().optional(),
        timer: z.string().optional(),
        countdown: z.string().optional(),
        launcher: z.string().optional(),
        fish: z.string().optional(),
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
    catEnabled: z.boolean().optional(),
    catAnimationSpeed: z.number().min(0.25).max(1.25).optional(),
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
        "todolist",
        "weather",
        "calendar",
        "timer",
        "countdown",
        "fish",
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
        links: z
          .array(
            z.object({ id: z.string(), label: z.string(), url: z.string() }),
          )
          .optional(),
        body: z.string().optional(),
        done: z.boolean().optional(),
        due: z.string().optional(),
        priority: z.string().optional(),
        todolistSort: z.enum(["priority", "date"]).optional(),
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
        fishSpecies: z.string().optional(),
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
  todolist: "#a7f3d0",
  weather: "#38bdf8",
  calendar: "#f59e0b",
  timer: "#22c55e",
  countdown: "#f97316",
  fish: "#22d3ee",
  launcher: "#60a5fa",
};
const DEFAULT_SIZE_PRESETS: SizePreset[] = [
  { id: "size-default", name: "湲곕낯", width: 300, height: 200 },
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
    message: "袁몄??⑥씠 寃곌뎅 ?ㅻ젰??留뚮뱺??",
    widgetColors: DEFAULT_WIDGET_COLORS,
    sizePresets: DEFAULT_SIZE_PRESETS,
    theme: "dark",
    catEnabled: true,
    catAnimationSpeed: 0.5,
  },
  workspaces: [{ id: MAIN_WORKSPACE, name: "MAIN" }],
  activeWorkspaceId: MAIN_WORKSPACE,
  widgets: [
    make("bookmark", "SSAFY GITLAB", 40, 40, { url: "https://lab.ssafy.com" }),
    make("todo", "?ㅻ뒛???숈뒿", 360, 40, {
      done: false,
      due: new Date().toISOString().slice(0, 10),
      priority: "HIGH",
    }),
    make("note", "?뚭퀬由ъ쬁 硫붾え", 40, 270, {
      body: "BFS: ?먯뿉 ?ｌ쓣 ??諛⑸Ц 泥섎━\n?쒓컙蹂듭옟??O(V + E)",
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
      message: parsed.settings.message || "袁몄??⑥씠 寃곌뎅 ?ㅻ젰??留뚮뱺??",
      widgetColors,
      sizePresets,
      theme: parsed.settings.theme || "dark",
      catEnabled: parsed.settings.catEnabled ?? true,
      catAnimationSpeed: Math.min(
        1.25,
        Math.max(0.25, parsed.settings.catAnimationSpeed ?? 0.5),
      ),
    },
    workspaces,
    activeWorkspaceId,
    widgets: parsed.widgets
      .filter((w) => w.type !== "launcher" && w.type !== "fish")
      .map((w) => {
      const links =
        w.type === "bookmark" && !w.data.links?.length && w.data.url
          ? [{ id: crypto.randomUUID(), label: w.title || "LINK", url: w.data.url }]
          : w.data.links;
      return {
        ...w,
        groupId: null,
        workspaceId: w.workspaceId || MAIN_WORKSPACE,
        data: { ...w.data, links },
        style:
          !w.style || w.style.borderColor === "#303b47"
            ? { borderColor: widgetColors[w.type] }
            : w.style,
      };
      }),
  };
};

function Icon({ type }: { type: Kind }) {
  return (
    <span className={`kind kind-${type}`}>
      {type === "bookmark"
        ? "??
        : type === "note"
          ? "??
          : type === "todo"
            ? "??
            : type === "todolist"
              ? "??
            : type === "weather"
              ? "??
              : type === "calendar"
                ? "??
                : type === "timer"
                  ? "??
                  : type === "countdown"
                    ? "D"
                    : type === "fish"
                      ? "?맆"
                    : "??}
    </span>
  );
}

const KOREAN_CITIES = [
  { id: "seoul", name: "?쒖슱", latitude: 37.5665, longitude: 126.978 },
  { id: "busan", name: "遺??, latitude: 35.1796, longitude: 129.0756 },
  { id: "daegu", name: "?援?, latitude: 35.8714, longitude: 128.6014 },
  { id: "incheon", name: "?몄쿇", latitude: 37.4563, longitude: 126.7052 },
  { id: "gwangju", name: "愿묒＜", latitude: 35.1595, longitude: 126.8526 },
  { id: "daejeon", name: "???, latitude: 36.3504, longitude: 127.3845 },
  { id: "ulsan", name: "?몄궛", latitude: 35.5384, longitude: 129.3114 },
  { id: "sejong", name: "?몄쥌", latitude: 36.48, longitude: 127.289 },
  { id: "suwon", name: "?섏썝", latitude: 37.2636, longitude: 127.0286 },
  { id: "chuncheon", name: "異섏쿇", latitude: 37.8813, longitude: 127.7298 },
  { id: "cheongju", name: "泥?＜", latitude: 36.6424, longitude: 127.489 },
  { id: "jeonju", name: "?꾩＜", latitude: 35.8242, longitude: 127.148 },
  { id: "changwon", name: "李쎌썝", latitude: 35.2285, longitude: 128.6811 },
  { id: "jeju", name: "?쒖＜", latitude: 33.4996, longitude: 126.5312 },
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
  if (code === 0) return ["?截?, "留묒쓬"];
  if (code <= 3) return ["??, "援щ쫫"];
  if (code <= 48) return ["?뙧截?, "?덇컻"];
  if (code <= 67) return ["?뙢截?, "鍮?];
  if (code <= 77) return ["?뙣截?, "??];
  if (code <= 82) return ["?뙡截?, "?뚮굹湲?];
  if (code <= 86) return ["?뙣截?, "???뚮굹湲?];
  return ["?덌툘", "?뚯슦"];
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
        q: `${query.trim()}, ??쒕?援?,
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
        setSearchMessage("寃??寃곌낵媛 ?놁뒿?덈떎. ?쇑룰뎄 ?대쫫??諛붽퓭蹂댁꽭??");
    } catch {
      setResults([]);
      setSearchMessage("吏??寃?됱뿉 ?ㅽ뙣?덉뒿?덈떎. ?좎떆 ???ㅼ떆 ?쒕룄?섏꽭??");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="location-picker">
      <label>
        吏??寃??        <span className="location-search">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="?? ??궪?? ?뺤옄?? ?댁슫?援?
          />
          <button type="button" onClick={search}>
            {searching ? "寃??以? : "寃??}
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
                  .join(" 쨌 ");
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
                {[result.admin2, result.admin1].filter(Boolean).join(" 쨌 ")}
              </small>
            </button>
          ))}
        </div>
      )}
      {searchMessage && (
        <small className="search-message">{searchMessage}</small>
      )}
      <small className="selected-location">?좏깮 吏??쨌 {selected.name}</small>
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
        else setError("?좎뵪 ?덈낫 ?곗씠?곕? 遺덈윭?????놁뒿?덈떎.");
      }
    };
    load();
    return () => controller.abort();
  }, [location.latitude, location.longitude]);

  if (!weather)
    return <p className="api-state">{error || "?좎뵪 ?덈낫 遺덈윭?ㅻ뒗 以묅?}</p>;
  const [icon, label] = weatherLabel(weather.current.weather_code);
  return (
    <div className="weather-content">
      <div className="weather-main">
        <span className="weather-icon" aria-hidden="true">
          {icon}
        </span>
        <div>
          <strong>{location.name}</strong>
          <small>{label} 쨌 BEST MATCH</small>
        </div>
        <b>{Math.round(weather.current.temperature_2m)}째</b>
      </div>
      <div className="weather-grid">
        <span>
          泥닿컧 <b>{Math.round(weather.current.apparent_temperature)}째</b>
        </span>
        <span>
          理쒓퀬 <b>{Math.round(weather.daily.temperature_2m_max[0])}째</b>
        </span>
        <span>
          理쒖? <b>{Math.round(weather.daily.temperature_2m_min[0])}째</b>
        </span>
        <span>
          媛뺤닔 <b>{weather.daily.precipitation_probability_max[0]}%</b>
        </span>
      </div>
      <small className="api-updated">
        ?낅뜲?댄듃 {weather.current.time.replace("T", " ")}
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
          ??        </button>
        <strong>
          {year}. {String(month.getMonth() + 1).padStart(2, "0")}
        </strong>
        <button
          onClick={() => setMonth(new Date(year, month.getMonth() + 1, 1))}
        >
          ??        </button>
      </div>
      <div className="calendar-grid calendar-weekdays">
        {["??, "??, "??, "??, "紐?, "湲?, "??].map((day) => (
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

function CountdownWidget({ widget }: { widget: Widget }) {
  const target = widget.data.countdownDate
    ? new Date(`${widget.data.countdownDate}T00:00:00`)
    : new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.ceil((target.getTime() - today.getTime()) / 86400000);
  const text =
    days === 0 ? "D-DAY" : days > 0 ? `D-${days}` : `D+${Math.abs(days)}`;
  const fontSize = widget.data.countdownFontSize || 56;
  return (
    <div className="countdown-content">
      <strong style={{ fontSize }}>{text}</strong>
    </div>
  );
}

function TodoListWidget({
  widget,
  todos,
  onSort,
  onToggle,
}: {
  widget: Widget;
  todos: Widget[];
  onSort: (sort: "priority" | "date") => void;
  onToggle: (todo: Widget, done: boolean) => void;
}) {
  const sort = widget.data.todolistSort || "priority";
  const priorityRank: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  const sorted = [...todos].sort((a, b) => {
    if (sort === "priority") {
      const priority =
        (priorityRank[a.data.priority || "MEDIUM"] ?? 1) -
        (priorityRank[b.data.priority || "MEDIUM"] ?? 1);
      if (priority !== 0) return priority;
    }
    return (a.data.due || "9999-12-31").localeCompare(
      b.data.due || "9999-12-31",
    );
  });
  return (
    <div className="todolist-content">
      <div className="todolist-sort" aria-label="TODO ?뺣젹 諛⑹떇">
        <button
          className={sort === "priority" ? "active" : ""}
          onClick={() => onSort("priority")}
        >
          以묒슂?꾩닚
        </button>
        <button
          className={sort === "date" ? "active" : ""}
          onClick={() => onSort("date")}
        >
          ?좎쭨??        </button>
      </div>
      <div className="todolist-items">
        {sorted.length ? (
          sorted.map((todo) => (
            <label className={todo.data.done ? "completed" : ""} key={todo.id}>
              <input
                type="checkbox"
                checked={!!todo.data.done}
                onChange={(event) => onToggle(todo, event.target.checked)}
              />
              <strong>{todo.title}</strong>
              <time>{todo.data.due || "湲고븳 ?놁쓬"}</time>
              <span className={`priority ${todo.data.priority?.toLowerCase()}`}>
                {todo.data.priority || "MEDIUM"}
              </span>
            </label>
          ))
        ) : (
          <p>?깅줉??TODO媛 ?놁뒿?덈떎.</p>
        )}
      </div>
    </div>
  );
}

function CountdownSizePicker({ initial }: { initial: number }) {
  const [fontSize, setFontSize] = useState(initial);
  const resize = (amount: number) =>
    setFontSize((size) => Math.min(120, Math.max(28, size + amount)));
  return (
    <div className="countdown-size-picker">
      <input type="hidden" name="countdownFontSize" value={fontSize} />
      <span>湲???ш린</span>
      <div className="countdown-size-actions">
        <button type="button" onClick={() => resize(-4)} aria-label="湲???묎쾶">
          A??        </button>
        <button type="button" onClick={() => resize(4)} aria-label="湲???ш쾶">
          A竊?        </button>
        <small>{fontSize}px</small>
      </div>
      <div className="countdown-preview" aria-label="移댁슫?몃떎??誘몃━蹂닿린">
        <strong style={{ fontSize }}>D-30</strong>
      </div>
    </div>
  );
}

function BookmarkLinksEditor({ widget }: { widget?: Widget }) {
  const existing = widget?.data.links?.length
    ? widget.data.links
    : widget?.data.url
      ? [{ id: crypto.randomUUID(), label: widget.title || "LINK", url: widget.data.url }]
      : [{ id: crypto.randomUUID(), label: "??留곹겕", url: "https://" }];
  const [links, setLinks] = useState(existing);
  const moveLink = (index: number, offset: number) =>
    setLinks((items) => {
      const target = index + offset;
      if (target < 0 || target >= items.length) return items;
      const next = [...items];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  return (
    <fieldset className="bookmark-links-editor">
      <legend>留곹겕 紐⑸줉</legend>
      {links.map((link, index) => (
        <div className="bookmark-link-row" key={link.id}>
          <input
            name="linkLabel"
            aria-label={`${index + 1}踰?留곹겕 ?대쫫`}
            defaultValue={link.label}
            placeholder="留곹겕 ?대쫫"
            required
          />
          <input
            name="linkUrl"
            aria-label={`${index + 1}踰?URL`}
            type="url"
            defaultValue={link.url}
            placeholder="https://"
            required
          />
          <button
            className="bookmark-order"
            type="button"
            aria-label={`${index + 1}踰?留곹겕 ?꾨줈 ?대룞`}
            disabled={index === 0}
            onClick={() => moveLink(index, -1)}
          >
            ??          </button>
          <button
            className="bookmark-order"
            type="button"
            aria-label={`${index + 1}踰?留곹겕 ?꾨옒濡??대룞`}
            disabled={index === links.length - 1}
            onClick={() => moveLink(index, 1)}
          >
            ??          </button>
          <button
            type="button"
            aria-label={`${index + 1}踰?留곹겕 ??젣`}
            disabled={links.length === 1}
            onClick={() => setLinks((items) => items.filter((item) => item.id !== link.id))}
          >
            횞
          </button>
        </div>
      ))}
      <button
        className="add-bookmark-link"
        type="button"
        onClick={() =>
          setLinks((items) => [
            ...items,
            { id: crypto.randomUUID(), label: "", url: "https://" },
          ])
        }
      >
        留곹겕 異붽?
      </button>
    </fieldset>
  );
}

type CatPose = "sit" | "crouch" | "loaf" | "jump" | "groom" | "wheel";

const CAT_SPRITES: Record<CatPose, string> = {
  sit: "pixel-cat-sit.webp",
  crouch: "pixel-cat-crouch.webp",
  loaf: "pixel-cat-loaf.webp",
  jump: "pixel-cat-jump.webp",
  groom: "pixel-cat-groom.webp",
  wheel: "pixel-cat-wheel.webp",
};

const CAT_PLATFORM_OFFSET = 93;
const CAT_REST_POSES: CatPose[] = [
  "sit",
  "sit",
  "sit",
  "crouch",
  "loaf",
  "groom",
  "wheel",
];

function DashboardCat({
  enabled,
  speed,
}: {
  enabled: boolean;
  speed: number;
}) {
  const catRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef({ x: 230, y: 105 });
  const platformRef = useRef("home");
  const destinationRef = useRef("");
  const movementRef = useRef<Animation | null>(null);
  const movementIdRef = useRef(0);
  const [position, setPosition] = useState(positionRef.current);
  const [pose, setPose] = useState<CatPose>("sit");
  const [facingLeft, setFacingLeft] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let timer = 0;
    let cancelled = false;
    type CatTarget = { x: number; y: number; platformId: string };
    const boundaryY = () => {
      const main = document.querySelector("main")?.getBoundingClientRect();
      const bar = document.querySelector(".canvas-label")?.getBoundingClientRect();
      return main && bar ? bar.top - main.top - CAT_PLATFORM_OFFSET : 147;
    };
    const locate = (element: Element, home = false) => {
      const main = document.querySelector("main")?.getBoundingClientRect();
      const rect = element.getBoundingClientRect();
      if (!main) return positionRef.current;
      return {
        x: Math.max(
          8,
          Math.min(
            main.width - 92,
            rect.left - main.left + (home ? rect.width + 18 : rect.width * 0.45),
          ),
        ),
        y: home
          ? Math.max(48, rect.top - main.top - CAT_PLATFORM_OFFSET)
          : Math.max(
              boundaryY(),
              rect.top - main.top - CAT_PLATFORM_OFFSET,
            ),
      };
    };
    const workspaceBar = (): CatTarget => {
      const bar = document.querySelector(".canvas-label");
      const point = bar ? locate(bar) : { x: 80, y: boundaryY() };
      return { ...point, x: Math.max(80, point.x + 70), platformId: "workspace-bar" };
    };
    const settle = (next: CatTarget, nextPose: CatPose) => {
      positionRef.current = next;
      platformRef.current = next.platformId;
      destinationRef.current = "";
      movementRef.current = null;
      setPosition(next);
      setPose(nextPose);
    };
    const availableWidgets = (excludedId?: string): CatTarget[] =>
      Array.from(document.querySelectorAll<HTMLElement>(".widget .widget-top"))
        .map((element) => {
          const widget = element.closest<HTMLElement>(".widget");
          const id = widget?.dataset.id || "";
          const rect = element.getBoundingClientRect();
          return { element, id, rect };
        })
        .filter(
          ({ id, rect }) =>
            id &&
            id !== excludedId &&
            rect.width > 150 &&
            rect.bottom > 76 &&
            rect.top < innerHeight - 60,
        )
        .map(({ element, id }) => ({ ...locate(element), platformId: id }));
    const travel = async (target: CatTarget) => {
      const element = catRef.current;
      if (!element || cancelled) return;
      const movementId = ++movementIdRef.current;
      const computedTransform = getComputedStyle(element).transform;
      if (movementRef.current && computedTransform !== "none") {
        const matrix = new DOMMatrixReadOnly(computedTransform);
        positionRef.current = { x: matrix.m41, y: matrix.m42 };
        setPosition(positionRef.current);
        element.style.transform = `translate3d(${matrix.m41}px, ${matrix.m42}px, 0)`;
      }
      movementRef.current?.cancel();
      const start = positionRef.current;
      platformRef.current = "airborne";
      destinationRef.current = target.platformId;
      const distance = Math.hypot(target.x - start.x, target.y - start.y);
      setFacingLeft(target.x < start.x);
      setPose("jump");
      const flightSeconds = Math.min(1.45, 0.68 + distance / 700);
      const jumpHeight = Math.min(105, Math.max(42, distance * 0.2));
      const apexY = Math.max(
        boundaryY(),
        Math.min(start.y, target.y) - jumpHeight,
      );
      const rise = Math.max(0, start.y - apexY);
      const fall = Math.max(0, target.y - apexY);
      let gravity: number;
      let initialVelocityY: number;

      if (rise < 0.5) {
        gravity =
          (2 * Math.max(0, target.y - start.y)) /
          (flightSeconds * flightSeconds);
        initialVelocityY = 0;
      } else {
        const riseRoot = Math.sqrt(rise);
        const fallRoot = Math.sqrt(fall);
        const apexTime =
          (flightSeconds * riseRoot) / Math.max(0.001, riseRoot + fallRoot);
        gravity = (2 * rise) / (apexTime * apexTime);
        initialVelocityY = -gravity * apexTime;
      }

      const sampleCount = Math.max(18, Math.round(flightSeconds * 60));
      const keyframes = Array.from({ length: sampleCount + 1 }, (_, index) => {
        const progress = index / sampleCount;
        const elapsed = progress * flightSeconds;
        const x = start.x + (target.x - start.x) * progress;
        const y =
          start.y +
          initialVelocityY * elapsed +
          0.5 * gravity * elapsed * elapsed;
        return {
          transform: `translate3d(${x}px, ${y}px, 0)`,
          offset: progress,
        };
      });
      keyframes[keyframes.length - 1] = {
        transform: `translate3d(${target.x}px, ${target.y}px, 0)`,
        offset: 1,
      };
      const animation = element.animate(keyframes, {
        duration: flightSeconds * 1000,
        easing: "linear",
      });
      movementRef.current = animation;
      try {
        await animation.finished;
      } catch {
        return;
      }
      if (!cancelled && movementId === movementIdRef.current) {
        const nextPose =
          CAT_REST_POSES[Math.floor(Math.random() * CAT_REST_POSES.length)];
        settle(target, nextPose);
      }
    };
    const chooseNext = async () => {
      if (cancelled || document.hidden) return;
      const platforms = availableWidgets(platformRef.current);
      const target =
        platforms.length === 0 || Math.random() < 0.2
          ? workspaceBar()
          : platforms[Math.floor(Math.random() * platforms.length)];
      await travel(target);
    };
    const initial = workspaceBar();
    settle(initial, "sit");
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(async () => {
        await chooseNext();
        if (!cancelled) schedule();
      }, 22000 + Math.random() * 18000);
    };
    const escapeMovingWidget = (event: Event) => {
      const widgetIds = (event as CustomEvent<{ ids: string[] }>).detail.ids;
      if (
        !widgetIds.includes(platformRef.current) &&
        !widgetIds.includes(destinationRef.current)
      )
        return;
      const alternatives = availableWidgets(platformRef.current).filter(
        (target) => !widgetIds.includes(target.platformId),
      );
      void travel(
        alternatives.length
          ? alternatives[Math.floor(Math.random() * alternatives.length)]
          : workspaceBar(),
      );
      schedule();
    };
    const moveToWorkspaceBar = () => {
      void travel(workspaceBar());
      schedule();
    };
    const changeWorkspace = async () => {
      window.clearTimeout(timer);
      await travel(workspaceBar());
      if (cancelled) return;
      timer = window.setTimeout(async () => {
        await chooseNext();
        if (!cancelled) schedule();
      }, 7000);
    };
    const visibility = () => {
      if (document.hidden) {
        catRef.current?.getAnimations().forEach((animation) => animation.pause());
      } else {
        catRef.current?.getAnimations().forEach((animation) => animation.play());
        schedule();
      }
    };
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("dashboard:widget-drag-start", escapeMovingWidget);
    window.addEventListener("dashboard:workspace-change", changeWorkspace);
    window.addEventListener("dashboard:settings-open", moveToWorkspaceBar);
    schedule();
    return () => {
      cancelled = true;
      movementIdRef.current += 1;
      window.clearTimeout(timer);
      movementRef.current?.cancel();
      catRef.current?.getAnimations().forEach((animation) => animation.cancel());
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("dashboard:widget-drag-start", escapeMovingWidget);
      window.removeEventListener("dashboard:workspace-change", changeWorkspace);
      window.removeEventListener("dashboard:settings-open", moveToWorkspaceBar);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div
      ref={catRef}
      className={`dashboard-cat cat-${pose} ${facingLeft ? "facing-left" : ""}`}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        ["--cat-cycle-duration" as string]: `${1 / speed}s`,
      }}
      aria-label="??쒕낫?쒕? ?뚯븘?ㅻ땲??移섏쫰?μ씠"
      title="移섏쫰?μ씠"
    >
      <span
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}assets/${CAT_SPRITES[pose]})`,
        }}
      />
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
    "workspaces" | "widgets" | "sizes" | "theme" | "other" | "data"
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
  useEffect(() => {
    if (!modal) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setModal(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [modal]);

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
            window.dispatchEvent(
              new CustomEvent("dashboard:widget-drag-start", {
                detail: { ids: dragIdsRef.current },
              }),
            );
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
            const bookmarkHeight =
              68 +
              (target.dataset.hasTitle === "true" ? 38 : 0) +
              Number(target.dataset.linkCount || 1) * 44;
            const width = Math.max(isBookmark ? 250 : 240, e.rect.width);
            const height = Math.max(
              isBookmark ? bookmarkHeight : 150,
              e.rect.height,
            );
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
        (type === "todolist"
          ? "TODO LIST"
          : type === "fish"
            ? "?대???
          : type === "calendar"
          ? "?щ젰"
          : type === "timer" || type === "countdown"
            ? ""
            : "???꾩젽"),
    );
    const borderColor = String(form.get("borderColor") || "#303b47");
    const presetId = String(form.get("sizePreset") || "");
    const workspaceId = String(form.get("workspaceId") || "");
    const bookmarkLinks = form
      .getAll("linkUrl")
      .map((url, index) => ({
        id: crypto.randomUUID(),
        label: String(form.getAll("linkLabel")[index] || `LINK ${index + 1}`),
        url: String(url),
      }))
      .filter((link) => link.url && link.url !== "https://");
    const countdownFontSize = Number(
      form.get("countdownFontSize") || modalWidget?.data.countdownFontSize || 56,
    );
    const data =
      type === "timer"
          ? {
              timerMinutes: Number(form.get("timerMinutes") || 25),
              timerRemaining: Number(form.get("timerMinutes") || 25) * 60,
              timerRunning: false,
            }
          : type === "countdown"
            ? {
                countdownDate: String(form.get("countdownDate") || ""),
                countdownFontSize,
              }
            : type === "weather"
              ? {
                  locationName: String(form.get("locationName") || "?쒖슱"),
                  latitude: Number(form.get("latitude") || 37.5665),
                  longitude: Number(form.get("longitude") || 126.978),
                }
              : type === "calendar"
                ? {}
                : type === "todolist"
                  ? {
                      todolistSort:
                        modalWidget?.data.todolistSort || ("priority" as const),
                    }
                : type === "bookmark"
                  ? {
                      links: bookmarkLinks,
                      url: bookmarkLinks[0]?.url,
                    }
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
                  layout: (() => {
                    const base = preset
                      ? { ...w.layout, width: preset.width, height: preset.height }
                      : w.layout;
                    const requiredHeight =
                      type === "bookmark"
                        ? 68 + (title ? 38 : 0) + bookmarkLinks.length * 44
                        : type === "countdown"
                          ? countdownFontSize + (title ? 92 : 62)
                          : 0;
                    const requiredWidth =
                      type === "bookmark"
                        ? 250
                        : type === "countdown"
                          ? Math.ceil(countdownFontSize * 3.2 + 36)
                          : 0;
                    return {
                      ...base,
                      width: Math.max(base.width, requiredWidth),
                      height: Math.max(base.height, requiredHeight),
                    };
                  })(),
                  updatedAt: now(),
                }
              : w,
          ),
        };
      });
    } else {
      setStore((s) => {
        const preset =
          s.settings.sizePresets.find((p) => p.id === presetId) ||
          s.settings.sizePresets[0];
        const contentMinimum =
          type === "calendar"
            ? { width: 320, height: 350 }
            : type === "todolist"
              ? { width: 360, height: 300 }
            : type === "weather"
              ? { width: 330, height: 270 }
              : type === "bookmark"
                ? {
                    width: 250,
                    height: 68 + (title ? 38 : 0) + bookmarkLinks.length * 44,
                  }
                : type === "countdown"
                  ? {
                      width: Math.ceil(countdownFontSize * 3.2 + 36),
                      height: countdownFontSize + (title ? 92 : 62),
                    }
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
                zIndex:
                  Math.max(0, ...s.widgets.map((w) => w.layout.zIndex)) + 1,
              },
            },
          ],
        };
      });
    }
    setModal(null);
  };
  const remove = (id: string) => {
    if (!confirm("???꾩젽????젣?좉퉴??")) return;
    setStore((s) => ({ ...s, widgets: s.widgets.filter((w) => w.id !== id) }));
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
      if (!confirm("?꾩옱 ?곗씠?곕? 諛깆뾽 ?뚯씪 ?댁슜?쇰줈 援먯껜?좉퉴??")) return;
      setStore(parsed);
      setToast("?뚰겕?ㅽ럹?댁뒪瑜?蹂듭썝?덉뒿?덈떎.");
    } catch {
      setToast("?좏슚?섏? ?딆? 諛깆뾽 ?뚯씪?낅땲?? 湲곗〈 ?곗씠?곕뒗 ?좎??⑸땲??");
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
      <section className="stats" aria-label="?붿빟">
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
          <button className="widget-create-trigger">WIDGET竊?/button>
          <div className="widget-menu">
            {(
              [
                "bookmark",
                "note",
                "todo",
                "todolist",
                "weather",
                "calendar",
                "timer",
                "countdown",
              ] as Kind[]
            ).map((type) => (
              <button
                key={type}
                style={{ color: store.settings.widgetColors[type] }}
                onClick={() => setModal({ type })}
              >
                {type === "todolist"
                    ? "TODO LIST"
                    : type.toUpperCase()}
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
              aria-label="?ㅼ젙"
              onClick={() => {
                window.dispatchEvent(new Event("dashboard:settings-open"));
                setSettingsOpen(true);
                setSelected([]);
              }}
            >
              ??            </button>
            {store.workspaces.map((ws) => (
              <button
                key={ws.id}
                className={
                  !settingsOpen && ws.id === store.activeWorkspaceId
                    ? "active"
                    : ""
                }
                onClick={() => {
                  window.dispatchEvent(new Event("dashboard:workspace-change"));
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
                ?뚰겕?ㅽ럹?댁뒪
              </button>
              <button
                className={settingsSection === "widgets" ? "active" : ""}
                onClick={() => setSettingsSection("widgets")}
              >
                ?꾩젽 ?ㅽ???              </button>
              <button
                className={settingsSection === "sizes" ? "active" : ""}
                onClick={() => setSettingsSection("sizes")}
              >
                ?꾩젽 ?ш린
              </button>
              <button
                className={settingsSection === "theme" ? "active" : ""}
                onClick={() => setSettingsSection("theme")}
              >
                ?섏씠吏 ?뚮쭏
              </button>
              <button
                className={settingsSection === "other" ? "active" : ""}
                onClick={() => setSettingsSection("other")}
              >
                湲고?
              </button>
              <button
                className={settingsSection === "data" ? "active" : ""}
                onClick={() => setSettingsSection("data")}
              >
                ?곗씠??愿由?              </button>
            </aside>
            <section>
              {settingsSection === "workspaces" ? (
                <>
                  <div className="settings-heading">
                    <div>
                      <small>SETTINGS</small>
                      <h2>?뚰겕?ㅽ럹?댁뒪 愿由?/h2>
                      <p>
                        ?뚰겕?ㅽ럹?댁뒪瑜?異붽??섍굅???대쫫??諛붽씀怨???젣????                        ?덉뒿?덈떎.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const name = prompt(
                          "???뚰겕?ㅽ럹?댁뒪 ?대쫫",
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
                      竊????뚰겕?ㅽ럹?댁뒪
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
                                "?뚰겕?ㅽ럹?댁뒪 ?대쫫 蹂寃?,
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
                            ?대쫫 蹂寃?                          </button>
                          <button
                            className="danger"
                            disabled={store.workspaces.length === 1}
                            onClick={() => {
                              if (
                                !confirm(
                                  `'${ws.name}' ?뚰겕?ㅽ럹?댁뒪? ?ы븿???꾩젽????젣?좉퉴??`,
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
                            ??젣
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
                      <h2>?꾩젽 ?뚮몢由?/h2>
                      <p>
                        ???꾩젽???곸슜????낅퀎 湲곕낯 ?뚮몢由??됱긽???ㅼ젙?⑸땲??
                      </p>
                    </div>
                  </div>
                  <div className="widget-color-settings">
                    {(
                      [
                        "bookmark",
                        "note",
                        "todo",
                        "todolist",
                        "weather",
                        "calendar",
                        "timer",
                        "countdown",
                      ] as Kind[]
                    ).map((type) => (
                      <label key={type}>
                        <span className={`kind kind-${type}`}>
                          {type === "bookmark"
                            ? "??
                            : type === "note"
                              ? "??
                              : type === "todo"
                                ? "??
                                : type === "todolist"
                                  ? "??
                                : type === "weather"
                                  ? "??
                                  : type === "calendar"
                                    ? "??
                                    : type === "timer"
                                      ? "??
                                      : type === "countdown"
                                        ? "D"
                                        : "??}
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
                          湲곗〈 ?꾩젽?먮룄 ?곸슜
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
                      <h2>?꾩젽 ?ш린 ?꾨━??/h2>
                      <p>?꾩젽 ?앹꽦怨??섏젙 ???좏깮???ш린瑜?愿由ы빀?덈떎.</p>
                    </div>
                    <button
                      onClick={() => {
                        const name = prompt("?꾨━???대쫫", "???ш린");
                        if (!name) return;
                        const width = Number(prompt("?덈퉬(px)", "300"));
                        const height = Number(prompt("?믪씠(px)", "200"));
                        if (
                          !Number.isFinite(width) ||
                          !Number.isFinite(height) ||
                          width < 240 ||
                          height < 150
                        )
                          return setToast("理쒖냼 ?ш린??240횞150?낅땲??");
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
                      竊??꾨━??異붽?
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
                          {preset.width} 횞 {preset.height}
                        </code>
                        <button
                          onClick={() => {
                            const name = prompt("?꾨━???대쫫", preset.name);
                            if (!name) return;
                            const width = Number(
                              prompt("?덈퉬(px)", String(preset.width)),
                            );
                            const height = Number(
                              prompt("?믪씠(px)", String(preset.height)),
                            );
                            if (
                              !Number.isFinite(width) ||
                              !Number.isFinite(height) ||
                              width < 240 ||
                              height < 150
                            )
                              return setToast("理쒖냼 ?ш린??240횞150?낅땲??");
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
                          ?섏젙
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
                          ??젣
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
                      <h2>?섏씠吏 ?뚮쭏</h2>
                      <p>??쒕낫???꾩껜???됱긽 ?뚮쭏瑜??좏깮?⑸땲??</p>
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
                            ? "?ㅽ겕"
                            : theme === "light"
                              ? "?붿씠??
                              : "?뚯뒪??釉붾（"}
                        </strong>
                      </button>
                    ))}
                  </div>
                </>
              ) : settingsSection === "other" ? (
                <>
                  <div className="settings-heading">
                    <div>
                      <small>COMPANION</small>
                      <h2>湲고? ?ㅼ젙</h2>
                      <p>??쒕낫?쒖쓽 遺媛 湲곕뒫???ㅼ젙?⑸땲??</p>
                    </div>
                  </div>
                  <div className="misc-options">
                    <label>
                      <div>
                        <strong>移섏쫰?μ씠</strong>
                        <p>?뚰겕?ㅽ럹?댁뒪? ?꾩젽 ?꾨? ?뚯븘?ㅻ땲??怨좎뼇?댁엯?덈떎.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={store.settings.catEnabled}
                        onChange={(event) =>
                          setStore((state) => ({
                            ...state,
                            settings: {
                              ...state.settings,
                              catEnabled: event.target.checked,
                            },
                          }))
                        }
                      />
                    </label>
                    <label>
                      <div>
                        <strong>怨좎뼇???좊땲硫붿씠???띾룄</strong>
                        <p>紐⑤뱺 ?됰룞???ъ깮 ?띾룄瑜??숈씪??鍮꾩쑉濡?議곗젅?⑸땲??</p>
                      </div>
                      <span className="cat-speed-control">
                        <input
                          type="range"
                          min="0.25"
                          max="1.25"
                          step="0.25"
                          value={store.settings.catAnimationSpeed}
                          onChange={(event) =>
                            setStore((state) => ({
                              ...state,
                              settings: {
                                ...state.settings,
                                catAnimationSpeed: Number(event.target.value),
                              },
                            }))
                          }
                          aria-label="怨좎뼇???좊땲硫붿씠???띾룄"
                        />
                        <output>{store.settings.catAnimationSpeed}x</output>
                      </span>
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <div className="settings-heading">
                    <div>
                      <small>BACKUP</small>
                      <h2>?곗씠??愿由?/h2>
                      <p>
                        ??쒕낫???꾩껜 ?곗씠?곕? ?뚯씪濡??대낫?닿굅???댁쟾 諛깆뾽??                        媛?몄샃?덈떎.
                      </p>
                    </div>
                  </div>
                  <div className="data-actions">
                    <article>
                      <strong>?곗씠???대낫?닿린</strong>
                      <p>?뚰겕?ㅽ럹?댁뒪, ?꾩젽, ?ㅼ젙??JSON ?뚯씪濡???ν빀?덈떎.</p>
                      <button onClick={exportJson}>??EXPORT</button>
                    </article>
                    <article>
                      <strong>?곗씠??媛?몄삤湲?/strong>
                      <p>??ν빐 ??JSON ?뚯씪濡??꾩옱 ??쒕낫?쒕? 蹂듭썝?⑸땲??</p>
                      <button onClick={() => fileRef.current?.click()}>
                        ??IMPORT
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
                data-link-count={w.data.links?.length || (w.data.url ? 1 : 0)}
                data-has-title={Boolean(w.title)}
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
                      aria-label="?섏젙"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => setModal({ type: w.type, widgetId: w.id })}
                    >
                      ??                    </button>
                    <button
                      aria-label="蹂듭젣"
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
                      樹?                    </button>
                    <button
                      aria-label="??젣"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => remove(w.id)}
                    >
                      횞
                    </button>
                  </div>
                </div>
                <div className="widget-body">
                  {w.type === "bookmark" ? (
                    <>
                      {w.title && (
                        <h2
                          className="widget-title"
                          style={{ borderBottomColor: w.style.borderColor }}
                        >
                          {w.title}
                        </h2>
                      )}
                      <div className="bookmark-list">
                        {(w.data.links?.length
                          ? w.data.links
                          : w.data.url
                            ? [{ id: w.id, label: w.title || "LINK", url: w.data.url }]
                            : []
                        ).map((link) => (
                          <a key={link.id} href={link.url} target="_blank" rel="noreferrer">
                            {link.label}
                          </a>
                        ))}
                      </div>
                    </>
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
                          aria-label={`${w.title} ?댁슜`}
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
                      {w.type === "todolist" && (
                        <TodoListWidget
                          widget={w}
                          todos={visibleWidgets.filter(
                            (item) => item.type === "todo",
                          )}
                          onSort={(todolistSort) =>
                            update(w.id, {
                              data: { ...w.data, todolistSort },
                            })
                          }
                          onToggle={(todo, done) =>
                            update(todo.id, {
                              data: { ...todo.data, done },
                            })
                          }
                        />
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
                        <CountdownWidget widget={w} />
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
        <span>SSAFY DASHBOARD 쨌 V1.0.1</span>
      </footer>
      {modal && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <form
            className={`modal ${modal.type === "countdown" ? "modal-countdown" : ""}`}
            onSubmit={addWidget}
          >
            <div>
              <span>
                {modalWidget ? "EDIT" : "NEW"} / {modal.type.toUpperCase()}
              </span>
              <button type="button" onClick={() => setModal(null)}>
                횞
              </button>
            </div>
            <h2>
              {modalWidget
                ? "?꾩젽 ?섏젙"
                : `??${modal.type === "bookmark" ? "遺곷쭏?? : modal.type === "note" ? "硫붾え" : modal.type === "todo" ? "???? : modal.type === "todolist" ? "TODO LIST" : modal.type === "weather" ? "?좎뵪" : modal.type === "calendar" ? "?щ젰" : modal.type === "timer" ? "?숈뒿 ??대㉧" : modal.type === "countdown" ? "移댁슫?몃떎?? : "?꾩젽"}`}
            </h2>
            {modal.type !== "calendar" && (
              <label>
                ?쒕ぉ
                <input
                  name="title"
                  required={
                    modal.type !== "timer" && modal.type !== "countdown"
                  }
                  autoFocus
                  defaultValue={
                    modalWidget?.title ||
                    (modal.type === "todolist" ? "TODO LIST" : "")
                  }
                  placeholder="?쒕ぉ???낅젰?섏꽭??
                />
              </label>
            )}
            <label>
              ?꾩젽 ?ш린
              <select
                name="sizePreset"
                defaultValue={
                  modalWidget ? "" : store.settings.sizePresets[0].id
                }
              >
                {modalWidget && <option value="">蹂寃?????/option>}
                {store.settings.sizePresets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name} 쨌 {preset.width}횞{preset.height}
                  </option>
                ))}
              </select>
            </label>
            {modalWidget && (
              <label>
                ?뚰겕?ㅽ럹?댁뒪
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
              ?뚮몢由??됱긽
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
            {modal.type === "note" && (
              <label>
                ?댁슜
                <textarea
                  name="content"
                  rows={5}
                  defaultValue={modalWidget?.data.body}
                  placeholder="硫붾え瑜??낅젰?섏꽭??
                />
              </label>
            )}
            {modal.type === "bookmark" && <BookmarkLinksEditor widget={modalWidget} />}
            {modal.type === "weather" && (
              <LocationPicker widget={modalWidget} />
            )}
            {modal.type === "timer" && (
              <label>
                ?숈뒿 ?쒓컙(遺?
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
              <>
                <label>
                  紐⑺몴 ?좎쭨
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
                <CountdownSizePicker
                  initial={modalWidget?.data.countdownFontSize || 56}
                />
              </>
            )}
            {modal.type === "todo" && (
              <>
                <label>
                  留덇컧??                  <input
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
                  ?곗꽑?쒖쐞
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
      <DashboardCat
        enabled={store.settings.catEnabled}
        speed={store.settings.catAnimationSpeed}
      />
    </main>
  );
}

