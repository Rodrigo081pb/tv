import { useState, useEffect, useRef, useCallback } from "react";

const bus = {
  listeners: {},
  emit(event, data) {
    (this.listeners[event] || []).forEach((fn) => fn(data));
  },
  on(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  },
  off(event, fn) {
    this.listeners[event] = (this.listeners[event] || []).filter((f) => f !== fn);
  },
};

const TRACKS = [
  { id: 1, title: "Synthwave Drive",   genre: "Electronic", dur: 245, color: "#ff6b35" },
  { id: 2, title: "Ocean Depths",      genre: "Ambient",    dur: 312, color: "#00b4d8" },
  { id: 3, title: "Neon Jungle",       genre: "Lo-fi",      dur: 198, color: "#a8dadc" },
  { id: 4, title: "Midnight Protocol", genre: "Cyberpunk",  dur: 267, color: "#c77dff" },
  { id: 5, title: "Solar Drift",       genre: "Chillout",   dur: 289, color: "#ffd60a" },
];

const WAVE = Array.from({ length: 36 }, (_, i) =>
  0.3 + 0.7 * Math.abs(Math.sin(i * 0.45 + 1.2))
);

function fmt(s) {
  var m = Math.floor(s / 60);
  var sec = Math.floor(s % 60);
  return m + ":" + (sec < 10 ? "0" : "") + sec;
}

function TVScreen({ st, evlog, online }) {
  var tr = TRACKS[st.idx];
  var pct = (st.prog / tr.dur) * 100;
  var [ui, setUi] = useState(true);
  var tmr = useRef(null);

  useEffect(function () {
    setUi(true);
    clearTimeout(tmr.current);
    if (st.on) {
      tmr.current = setTimeout(function () { setUi(false); }, 3500);
    }
    return function () { clearTimeout(tmr.current); };
  }, [st.on, st.idx, st.vol, st.muted]);

  var dotStyle = {
    width: 8, height: 8, borderRadius: "50%",
    backgroundColor: online ? tr.color : "#555",
    boxShadow: online ? ("0 0 8px " + tr.color) : "none",
    display: "inline-block",
  };

  var albumStyle = {
    width: 144, height: 144, borderRadius: "50%",
    border: "4px solid " + tr.color,
    background: "radial-gradient(circle, rgba(255,255,255,0.05), black)",
    boxShadow: st.on ? ("0 0 40px " + tr.color + "66") : "none",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 48,
    animation: st.on ? "tvSpin 12s linear infinite" : "none",
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", background: "#0a0015", fontFamily: "monospace" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.08, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.6) 2px,rgba(0,0,0,0.6) 4px)", zIndex: 10 }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 0", position: "relative", zIndex: 20 }}>
        <span style={{ color: tr.color, fontSize: 11, letterSpacing: 3, opacity: 0.6 }}>◉ TV CAST</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={dotStyle} />
          <span style={{ color: online ? tr.color : "#555", fontSize: 11, letterSpacing: 2 }}>
            {online ? "AO VIVO" : "OFFLINE"}
          </span>
        </div>
      </div>

      <div style={{ position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)", zIndex: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{ width: 4, height: 80, borderRadius: 4, background: "rgba(255,255,255,0.1)", overflow: "hidden", display: "flex", flexDirection: "column-reverse" }}>
          <div style={{ width: "100%", height: (st.muted ? 0 : st.vol) + "%", backgroundColor: tr.color, borderRadius: 4, transition: "height 0.3s" }} />
        </div>
        <span style={{ color: tr.color, fontSize: 11, fontWeight: "bold" }}>{st.muted ? "M" : st.vol}</span>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, position: "relative" }}>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "conic-gradient(" + tr.color + ", transparent, " + tr.color + ")", filter: "blur(24px)", opacity: st.on ? 0.4 : 0.07, animation: st.on ? "tvSpin 8s linear infinite" : "none" }} />
          <div style={albumStyle}>🎵</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 2, padding: "0 40px", height: 40, marginBottom: 8, zIndex: 10, position: "relative" }}>
        {WAVE.map(function (b, i) {
          return (
            <div key={i} style={{ width: 4, borderRadius: 2, transition: "height 0.2s", transitionDelay: (i * 8) + "ms", height: st.on ? Math.round(b * 36 + 4) + "px" : "3px", backgroundColor: tr.color, opacity: 0.4 + b * 0.6 }} />
          );
        })}
      </div>

      <div style={{ padding: "0 32px 24px", zIndex: 20, position: "relative", opacity: (ui || !st.on) ? 1 : 0, transition: "opacity 0.7s" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
          <div>
            <div style={{ color: "white", fontSize: 22, fontWeight: "bold" }}>{tr.title}</div>
            <div style={{ color: tr.color, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginTop: 2 }}>{tr.genre}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{fmt(st.prog)} / {fmt(tr.dur)}</div>
            <div style={{ color: tr.color, fontSize: 11, marginTop: 4 }}>{st.idx + 1} / {TRACKS.length}</div>
          </div>
        </div>
        <div style={{ width: "100%", height: 3, background: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: pct + "%", backgroundColor: tr.color, boxShadow: "0 0 8px " + tr.color, borderRadius: 2, transition: "width 0.5s" }} />
        </div>
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 10, display: "flex", gap: 8 }}>
          <span>{st.on ? "▶ PLAYING" : "⏸ PAUSADO"}</span>
          <span>•</span><span>Tempo Real</span>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 20, left: 20, zIndex: 30, display: "flex", flexDirection: "column", gap: 4 }}>
        {evlog.slice(-3).map(function (l, i) {
          return (
            <div key={i} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, backgroundColor: tr.color + "18", color: tr.color, borderLeft: "2px solid " + tr.color }}>{l}</div>
          );
        })}
      </div>

      <style>{".tvSpin { animation: tvSpin 12s linear infinite; } @keyframes tvSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }"}</style>
    </div>
  );
}

function Remote({ st, send, online }) {
  var tr = TRACKS[st.idx];
  var ac = tr.color;

  function Btn(props) {
    var bg = props.hi ? (ac + "28") : "rgba(255,255,255,0.05)";
    var border = "1px solid " + (props.hi ? (ac + "66") : "rgba(255,255,255,0.08)");
    var col = props.hi ? ac : "white";
    return (
      <button
        onClick={function () { send(props.action); }}
        style={{ backgroundColor: bg, border: border, color: col, fontFamily: "monospace", height: props.large ? 60 : 44, borderRadius: 10, fontSize: props.large ? 22 : 15, cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", userSelect: "none", boxShadow: props.hi ? ("0 0 12px " + ac + "44") : "none" }}
      >
        {props.label}
      </button>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", overflowY: "auto", background: "#09090f", fontFamily: "monospace" }}>
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ color: "white", fontSize: 13, fontWeight: "bold", letterSpacing: 2 }}>CONTROLE REMOTO</div>
            <div style={{ color: ac, fontSize: 11, marginTop: 2, letterSpacing: 2 }}>controle.seusite.com</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: online ? ac : "#444" }} />
            <span style={{ color: online ? ac : "#444", fontSize: 11 }}>{online ? "CONECTADO" : "OFF"}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 8, borderRadius: 12, backgroundColor: ac + "12", border: "1px solid " + ac + "28" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "radial-gradient(" + ac + "44, transparent)", border: "1px solid " + ac + "44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, animation: st.on ? "tvSpin 4s linear infinite" : "none" }}>🎵</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "white", fontSize: 12, fontWeight: "bold", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tr.title}</div>
            <div style={{ color: ac, fontSize: 11, marginTop: 2 }}>{tr.genre}</div>
          </div>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, flexShrink: 0 }}>{st.idx + 1}/{TRACKS.length}</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 20, overflowY: "auto" }}>
        <div>
          <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Reprodução</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <Btn label="⏮" action="PREV" />
            <Btn label={st.on ? "⏸" : "▶"} action="TOGGLE" large hi />
            <Btn label="⏭" action="NEXT" />
          </div>
          <div style={{ marginTop: 8 }}><Btn label="⏹ Stop" action="STOP" /></div>
        </div>

        <div>
          <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Volume</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <Btn label="🔉 −10" action="VD" />
            <Btn label={st.muted ? "🔇 Mudo" : ("🔊 " + st.vol)} action="MUTE" hi={st.muted} />
            <Btn label="🔊 +10" action="VU" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11 }}>0</span>
            <input
              type="range" min={0} max={100}
              value={st.muted ? 0 : st.vol}
              onChange={function (e) { send("VS:" + e.target.value); }}
              style={{ flex: 1, height: 4, borderRadius: 2, cursor: "pointer", accentColor: ac }}
            />
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11 }}>100</span>
          </div>
        </div>

        <div>
          <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Playlist</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {TRACKS.map(function (t, i) {
              return (
                <button key={t.id} onClick={function () { send("TR:" + i); }}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: 8, borderRadius: 12, textAlign: "left", width: "100%", backgroundColor: i === st.idx ? (t.color + "18") : "rgba(255,255,255,0.03)", border: "1px solid " + (i === st.idx ? (t.color + "44") : "rgba(255,255,255,0.05)"), cursor: "pointer", transition: "all 0.15s", fontFamily: "monospace" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: t.color + "22", color: t.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>
                    {i === st.idx && st.on ? "▶" : i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "white", fontSize: 12, fontWeight: "bold", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
                    <div style={{ color: t.color, fontSize: 11, marginTop: 2 }}>{t.genre}</div>
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, flexShrink: 0 }}>{fmt(t.dur)}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ padding: "0 20px 20px", flexShrink: 0 }}>
        <div style={{ color: "rgba(255,255,255,0.1)", fontSize: 11, textAlign: "center", letterSpacing: 2 }}>EventDriven • Tempo Real</div>
      </div>
    </div>
  );
}

function LogPanel({ evlog }) {
  var ref = useRef(null);
  useEffect(function () {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [evlog]);
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#050508", fontFamily: "monospace" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#4ade80" }} />
        <span style={{ color: "#4ade80", fontSize: 11, letterSpacing: 3, textTransform: "uppercase" }}>Realtime Log</span>
      </div>
      <div ref={ref} style={{ flex: 1, overflowY: "auto", padding: "8px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        {evlog.length === 0 && <div style={{ color: "rgba(255,255,255,0.15)", fontSize: 12, textAlign: "center", marginTop: 24 }}>Aguardando eventos...</div>}
        {evlog.map(function (l, i) {
          return <div key={i} style={{ fontSize: 11, color: "#4ade80", borderLeft: "2px solid #166534", paddingLeft: 8, opacity: 0.85 }}>{l}</div>;
        })}
      </div>
    </div>
  );
}

var INIT = { on: false, idx: 0, prog: 0, vol: 70, muted: false };

export default function App() {
  var [st, setSt] = useState(INIT);
  var [evlog, setEvlog] = useState([]);
  var [online, setOnline] = useState(false);
  var [tab, setTab] = useState("split");
  var tick = useRef(null);

  function ts() { return new Date().toLocaleTimeString("pt-BR"); }

  var log = useCallback(function (msg) {
    setEvlog(function (p) { return [...p.slice(-80), "[" + ts() + "] " + msg]; });
  }, []);

  useEffect(function () {
    log("Servidor iniciado na porta 3000");
    var a = setTimeout(function () {
      log("TV conectada — id: tv_" + Math.random().toString(36).slice(2, 7));
      var b = setTimeout(function () {
        log("Controle conectado — id: mob_" + Math.random().toString(36).slice(2, 7));
        setOnline(true);
        log("2 dispositivos online. Sistema pronto!");
      }, 600);
      return function () { clearTimeout(b); };
    }, 400);
    return function () { clearTimeout(a); };
  }, []);

  useEffect(function () {
    clearInterval(tick.current);
    if (st.on) {
      tick.current = setInterval(function () {
        setSt(function (p) {
          var nx = p.prog + 1;
          if (nx >= TRACKS[p.idx].dur) {
            var ni = (p.idx + 1) % TRACKS.length;
            setEvlog(function (l) { return [...l.slice(-80), "[" + ts() + "] Auto-next: " + TRACKS[ni].title]; });
            return Object.assign({}, p, { idx: ni, prog: 0 });
          }
          return Object.assign({}, p, { prog: nx });
        });
      }, 500);
    }
    return function () { clearInterval(tick.current); };
  }, [st.on]);

  useEffect(function () {
    function h(d) {
      log("acao-tv: " + JSON.stringify(d));
      setSt(function (p) {
        if (d.type === "TOGGLE") { var on = !p.on; log(on ? "TV: Play" : "TV: Pause"); return Object.assign({}, p, { on: on }); }
        if (d.type === "STOP") { log("TV: Stop"); return Object.assign({}, p, { on: false, prog: 0 }); }
        if (d.type === "NEXT") { var i = (p.idx + 1) % TRACKS.length; log("TV: " + TRACKS[i].title); return Object.assign({}, p, { idx: i, prog: 0, on: true }); }
        if (d.type === "PREV") { var i2 = (p.idx - 1 + TRACKS.length) % TRACKS.length; log("TV: " + TRACKS[i2].title); return Object.assign({}, p, { idx: i2, prog: 0, on: true }); }
        if (d.type === "VU") { return Object.assign({}, p, { vol: Math.min(100, p.vol + 10), muted: false }); }
        if (d.type === "VD") { return Object.assign({}, p, { vol: Math.max(0, p.vol - 10) }); }
        if (d.type === "MUTE") { log(p.muted ? "Unmute" : "Mute"); return Object.assign({}, p, { muted: !p.muted }); }
        if (d.type === "VS") { return Object.assign({}, p, { vol: Number(d.v), muted: false }); }
        if (d.type === "TR") { log("Faixa: " + TRACKS[d.i].title); return Object.assign({}, p, { idx: d.i, prog: 0, on: true }); }
        return p;
      });
    }
    bus.on("tv", h);
    return function () { bus.off("tv", h); };
  }, [log]);

  var send = useCallback(function (action) {
    var parts = action.split(":");
    var type = parts[0];
    var val = parts[1];
    var payload;
    if (type === "TR") { payload = { type: "TR", i: Number(val) }; }
    else if (type === "VS") { payload = { type: "VS", v: val }; }
    else { payload = { type: type }; }
    log("emit controle: " + JSON.stringify(payload));
    bus.emit("tv", payload);
  }, [log]);

  var ac = TRACKS[st.idx].color;
  var TABS = [
    { id: "split", label: "⊞ Split" },
    { id: "tv", label: "📺 TV" },
    { id: "remote", label: "📱 Controle" },
    { id: "log", label: "⚡ Log" },
  ];

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column", background: "black", fontFamily: "monospace" }}>
      <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#060608", flexShrink: 0 }}>
        {TABS.map(function (t) {
          return (
            <button key={t.id} onClick={function () { setTab(t.id); }}
              style={{ color: tab === t.id ? ac : "rgba(255,255,255,0.25)", borderBottom: "2px solid " + (tab === t.id ? ac : "transparent"), background: "none", border: "none", borderBottom: "2px solid " + (tab === t.id ? ac : "transparent"), cursor: "pointer", fontFamily: "monospace", padding: "10px 16px", fontSize: 12, letterSpacing: 1 }}>
              {t.label}
            </button>
          );
        })}
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, paddingRight: 16 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: online ? "#4ade80" : "#333" }} />
          <span style={{ color: online ? "rgba(74,222,128,0.5)" : "#333", fontSize: 11 }}>{online ? "2 online" : "offline"}</span>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "hidden" }}>
        {tab === "split" && (
          <div style={{ width: "100%", height: "100%", display: "flex" }}>
            <div style={{ flex: 1, minWidth: 0 }}><TVScreen st={st} evlog={evlog} online={online} /></div>
            <div style={{ width: 1, background: "rgba(255,255,255,0.05)", flexShrink: 0 }} />
            <div style={{ width: 280, flexShrink: 0, overflowY: "auto" }}><Remote st={st} send={send} online={online} /></div>
          </div>
        )}
        {tab === "tv" && <TVScreen st={st} evlog={evlog} online={online} />}
        {tab === "remote" && <Remote st={st} send={send} online={online} />}
        {tab === "log" && <LogPanel evlog={evlog} />}
      </div>

      <style>{"@keyframes tvSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }"}</style>
    </div>
  );
}
