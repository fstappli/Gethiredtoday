/**
 * Beautiful hand-crafted CSS resume mini-cards.
 * Designed specifically for thumbnail display — real text, real hierarchy,
 * real resume structure. Not scaled-down components.
 */

const T = {
  name: "Alex Morgan",
  title: "Senior Product Designer",
  email: "alex@email.com",
  location: "San Francisco, CA",
  company1: "Linear",
  role1: "Senior Product Designer",
  dates1: "2022–Present",
  bullet1: "Led redesign of core tracker for 300K+ teams",
  bullet2: "Lifted activation rate from 38% to 61%",
  company2: "Notion",
  role2: "Product Designer",
  dates2: "2019–2022",
  bullet3: "Mobile app design across 10 releases",
  school: "Stanford University",
  degree: "B.A. Design",
  skills: ["Figma", "Prototyping", "Design Systems", "User Research", "A/B Testing"],
};

/* ── Shared micro primitives ──────────────────────────────────────────────── */

const Row = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", ...style }}>
    {children}
  </div>
);

const Label = ({ text, color = "#475569", size = 5.5, weight = 600, tracking = "0.14em" }: {
  text: string; color?: string; size?: number; weight?: number; tracking?: string;
}) => (
  <div style={{ fontSize: size, fontWeight: weight, letterSpacing: tracking, textTransform: "uppercase", color, lineHeight: 1 }}>
    {text}
  </div>
);

const Rule = ({ color, opacity = 0.25 }: { color: string; opacity?: number }) => (
  <div style={{ height: 1, backgroundColor: color, opacity, margin: "3px 0" }} />
);

const Chip = ({ label, accent }: { label: string; accent: string }) => (
  <span style={{
    fontSize: 4.8, fontWeight: 500, padding: "1.5px 5px", borderRadius: 99,
    backgroundColor: accent + "18", color: accent, border: `1px solid ${accent}28`,
    whiteSpace: "nowrap", display: "inline-block",
  }}>
    {label}
  </span>
);

const JobEntry = ({ role, company, dates, bullets, accent, dense = false }: {
  role: string; company: string; dates: string; bullets?: string[];
  accent: string; dense?: boolean;
}) => (
  <div style={{ marginBottom: dense ? 4 : 6 }}>
    <Row>
      <span style={{ fontSize: 6.5, fontWeight: 700, color: "#0b1220", letterSpacing: "-0.01em" }}>{role}</span>
      <span style={{ fontSize: 4.6, color: "#94a3b8", fontStyle: "italic", flexShrink: 0 }}>{dates}</span>
    </Row>
    <div style={{ fontSize: 5.6, color: accent, fontWeight: 500, marginTop: 1.5 }}>{company}</div>
    {bullets?.map((b, i) => (
      <div key={i} style={{ display: "flex", gap: 3, marginTop: 2.5 }}>
        <span style={{ fontSize: 5, color: accent, fontWeight: 700, flexShrink: 0, marginTop: 0.5 }}>•</span>
        <span style={{ fontSize: 4.8, color: "#334155", lineHeight: 1.35 }}>{b}</span>
      </div>
    ))}
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════
   1. CLASSIC — clean single-column, accent name/rule
══════════════════════════════════════════════════════════════════════════ */
export function ClassicMiniResume({ accent = "#4AB7A6" }: { accent?: string }) {
  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#fff", padding: "11px 13px 9px", display: "flex", flexDirection: "column", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 3 }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: "#0b1220", letterSpacing: "-0.02em", lineHeight: 1 }}>{T.name}</div>
        <div style={{ fontSize: 7, color: accent, fontWeight: 600, marginTop: 3 }}>{T.title}</div>
        <div style={{ fontSize: 4.8, color: "#94a3b8", marginTop: 3.5, fontWeight: 500 }}>{T.email} · {T.location}</div>
      </div>
      <div style={{ height: 2, backgroundColor: accent, borderRadius: 1, marginBottom: 6 }} />

      {/* Summary */}
      <div style={{ marginBottom: 5 }}>
        <Label text="Summary" color={accent} />
        <Rule color={accent} />
        <div style={{ fontSize: 5, color: "#475569", lineHeight: 1.42, marginTop: 2.5 }}>
          Senior product designer with 8+ years shipping consumer and SaaS products. Led design for high-growth teams from Series A through IPO.
        </div>
      </div>

      {/* Experience */}
      <div style={{ flex: 1, marginBottom: 5 }}>
        <Label text="Experience" color={accent} />
        <Rule color={accent} />
        <div style={{ marginTop: 4 }}>
          <JobEntry role={T.role1} company={T.company1} dates={T.dates1} bullets={[T.bullet1, T.bullet2]} accent={accent} />
          <JobEntry role={T.role2} company={T.company2} dates={T.dates2} bullets={[T.bullet3]} accent={accent} dense />
        </div>
      </div>

      {/* Skills */}
      <div>
        <Label text="Skills" color={accent} />
        <Rule color={accent} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 3.5 }}>
          {T.skills.map((s) => <Chip key={s} label={s} accent={accent} />)}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   2. SIDEBAR — dark left column, white right
══════════════════════════════════════════════════════════════════════════ */
export function SidebarMiniResume({ accent = "#334155" }: { accent?: string }) {
  const dark = accent;
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", fontFamily: "system-ui, sans-serif" }}>
      {/* Left sidebar */}
      <div style={{ width: "35%", backgroundColor: dark, padding: "13px 7px 10px", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Avatar */}
        <div style={{
          width: 36, height: 36, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.18)",
          border: "1.5px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center",
          justifyContent: "center", margin: "0 auto 7px", fontSize: 11, fontWeight: 700, color: "#fff",
        }}>
          AM
        </div>
        <div style={{ fontSize: 8, fontWeight: 700, color: "#fff", textAlign: "center", letterSpacing: "-0.01em", marginBottom: 2 }}>{T.name}</div>
        <div style={{ fontSize: 5.2, color: "rgba(255,255,255,0.78)", textAlign: "center", marginBottom: 8 }}>{T.title}</div>
        <div style={{ height: 1, backgroundColor: "rgba(255,255,255,0.2)", marginBottom: 7 }} />
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 4.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.85)", marginBottom: 4 }}>Contact</div>
          <div style={{ fontSize: 4.8, color: "rgba(255,255,255,0.9)", lineHeight: 1.5 }}>{T.email}</div>
          <div style={{ fontSize: 4.8, color: "rgba(255,255,255,0.9)" }}>{T.location}</div>
        </div>
        <div style={{ height: 1, backgroundColor: "rgba(255,255,255,0.2)", marginBottom: 7 }} />
        <div>
          <div style={{ fontSize: 4.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.85)", marginBottom: 4 }}>Skills</div>
          {T.skills.slice(0, 5).map((s) => (
            <div key={s} style={{ fontSize: 5, color: "rgba(255,255,255,0.92)", marginBottom: 2.5 }}>{s}</div>
          ))}
        </div>
      </div>

      {/* Right main */}
      <div style={{ flex: 1, padding: "12px 11px 9px", display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: 6 }}>
          <Label text="Profile" color={dark} />
          <Rule color={dark} />
          <div style={{ fontSize: 5, color: "#475569", lineHeight: 1.42, marginTop: 2.5 }}>
            Senior product designer with 8+ years shipping consumer and SaaS products through IPO.
          </div>
        </div>
        <div style={{ flex: 1, marginBottom: 5 }}>
          <Label text="Experience" color={dark} />
          <Rule color={dark} />
          <div style={{ marginTop: 4 }}>
            <JobEntry role={T.role1} company={T.company1} dates={T.dates1} bullets={[T.bullet1]} accent={dark} />
            <JobEntry role={T.role2} company={T.company2} dates={T.dates2} bullets={[T.bullet3]} accent={dark} dense />
          </div>
        </div>
        <div>
          <Label text="Education" color={dark} />
          <Rule color={dark} />
          <div style={{ marginTop: 3.5 }}>
            <div style={{ fontSize: 6, fontWeight: 700, color: "#0b1220" }}>{T.degree}</div>
            <div style={{ fontSize: 5, color: "#475569", marginTop: 1.5 }}>{T.school}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   3. EXECUTIVE — bold full-width gradient header
══════════════════════════════════════════════════════════════════════════ */
function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  const n = parseInt(clean, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `${r},${g},${b}`;
}

export function ExecutiveMiniResume({ accent = "#1d4ed8" }: { accent?: string }) {
  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#fff", display: "flex", flexDirection: "column", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${accent} 0%, rgba(${hexToRgb(accent)},0.8) 100%)`,
        padding: "13px 14px 11px",
      }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", letterSpacing: "-0.025em", lineHeight: 1 }}>{T.name}</div>
        <div style={{ fontSize: 7, color: "rgba(255,255,255,0.88)", fontWeight: 500, marginTop: 3.5 }}>{T.title}</div>
        <div style={{ fontSize: 4.6, color: "rgba(255,255,255,0.7)", marginTop: 4, fontWeight: 500 }}>{T.email} · {T.location}</div>
      </div>

      <div style={{ flex: 1, padding: "9px 13px 9px", display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: 5 }}>
          <Label text="Executive Summary" color={accent} />
          <Rule color={accent} />
          <div style={{ fontSize: 5, color: "#475569", lineHeight: 1.42, marginTop: 2.5 }}>
            Senior product designer with 8+ years shipping consumer and SaaS products. Expert at scaling design teams from Series A through IPO.
          </div>
        </div>

        <div style={{ flex: 1, marginBottom: 5 }}>
          <Label text="Experience" color={accent} />
          <Rule color={accent} />
          <div style={{ marginTop: 4 }}>
            <JobEntry role={T.role1} company={T.company1} dates={T.dates1} bullets={[T.bullet1, T.bullet2]} accent={accent} />
            <JobEntry role={T.role2} company={T.company2} dates={T.dates2} bullets={[T.bullet3]} accent={accent} dense />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Label text="Education" color={accent} />
            <Rule color={accent} />
            <div style={{ marginTop: 3 }}>
              <div style={{ fontSize: 6, fontWeight: 700, color: "#0b1220" }}>{T.degree}</div>
              <div style={{ fontSize: 5, color: accent, marginTop: 1.5 }}>{T.school}</div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Label text="Core Skills" color={accent} />
            <Rule color={accent} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 3.5 }}>
              {T.skills.slice(0, 4).map((s) => <Chip key={s} label={s} accent={accent} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   4. CREATIVE — gradient side column, border-left experience
══════════════════════════════════════════════════════════════════════════ */
export function CreativeMiniResume({ accent = "#7c3aed" }: { accent?: string }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", fontFamily: "system-ui, sans-serif" }}>
      {/* Left creative column */}
      <div style={{
        width: "34%", flexShrink: 0, padding: "13px 7px 10px",
        background: `linear-gradient(180deg, ${accent} 0%, rgba(${hexToRgb(accent)},0.82) 100%)`,
        display: "flex", flexDirection: "column",
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: "50%", margin: "0 auto 7px",
          backgroundColor: "rgba(255,255,255,0.22)", border: "2px solid rgba(255,255,255,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 800, color: "#fff",
        }}>
          AM
        </div>
        <div style={{ fontSize: 8.5, fontWeight: 800, color: "#fff", textAlign: "center", letterSpacing: "-0.01em", marginBottom: 2 }}>{T.name}</div>
        <div style={{ fontSize: 5.2, color: "rgba(255,255,255,0.8)", textAlign: "center", marginBottom: 9 }}>{T.title}</div>
        <div style={{ height: 1, backgroundColor: "rgba(255,255,255,0.25)", marginBottom: 7 }} />
        <div style={{ marginBottom: 7 }}>
          <div style={{ fontSize: 4.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.9)", marginBottom: 3.5 }}>About</div>
          <div style={{ fontSize: 4.6, color: "rgba(255,255,255,0.85)", lineHeight: 1.4 }}>
            8+ years shipping SaaS products from seed to IPO.
          </div>
        </div>
        <div style={{ height: 1, backgroundColor: "rgba(255,255,255,0.25)", marginBottom: 7 }} />
        <div>
          <div style={{ fontSize: 4.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.9)", marginBottom: 3.5 }}>Expertise</div>
          {T.skills.slice(0, 5).map((s) => (
            <div key={s} style={{ fontSize: 5, color: "rgba(255,255,255,0.94)", marginBottom: 2.5 }}>{s}</div>
          ))}
        </div>
      </div>

      {/* Right main */}
      <div style={{ flex: 1, padding: "12px 11px 9px" }}>
        <div style={{ marginBottom: 6 }}>
          <Label text="Experience" color={accent} />
          <Rule color={accent} />
          <div style={{ marginTop: 4 }}>
            {[
              { role: T.role1, company: T.company1, dates: T.dates1, bullet: T.bullet1, bullet2: T.bullet2 },
              { role: T.role2, company: T.company2, dates: T.dates2, bullet: T.bullet3, bullet2: "" },
            ].map((job, i) => (
              <div key={i} style={{ marginBottom: 6, paddingLeft: 5, borderLeft: `2px solid ${accent}` }}>
                <Row>
                  <span style={{ fontSize: 6.5, fontWeight: 700, color: "#0b1220" }}>{job.role}</span>
                  <span style={{ fontSize: 4.6, color: "#94a3b8", fontStyle: "italic", flexShrink: 0 }}>{job.dates}</span>
                </Row>
                <div style={{ fontSize: 5.5, color: accent, fontWeight: 500, marginTop: 1.5 }}>{job.company}</div>
                <div style={{ display: "flex", gap: 3, marginTop: 2.5 }}>
                  <span style={{ fontSize: 5, color: accent, fontWeight: 700 }}>•</span>
                  <span style={{ fontSize: 4.8, color: "#334155", lineHeight: 1.35 }}>{job.bullet}</span>
                </div>
                {job.bullet2 && (
                  <div style={{ display: "flex", gap: 3, marginTop: 1.5 }}>
                    <span style={{ fontSize: 5, color: accent, fontWeight: 700 }}>•</span>
                    <span style={{ fontSize: 4.8, color: "#334155", lineHeight: 1.35 }}>{job.bullet2}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div>
          <Label text="Education" color={accent} />
          <Rule color={accent} />
          <div style={{ paddingLeft: 5, borderLeft: `2px solid ${accent}`, marginTop: 4 }}>
            <div style={{ fontSize: 6.2, fontWeight: 700, color: "#0b1220" }}>{T.degree}</div>
            <div style={{ fontSize: 5, color: accent, marginTop: 1.5 }}>{T.school}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   5. MINIMAL — centered header, clean typographic
══════════════════════════════════════════════════════════════════════════ */
export function MinimalMiniResume({ accent = "#1d4ed8" }: { accent?: string }) {
  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#fff", padding: "14px 15px 10px", fontFamily: "system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Centered header */}
      <div style={{ textAlign: "center", marginBottom: 5 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#0b1220", letterSpacing: "-0.025em" }}>{T.name}</div>
        <div style={{ fontSize: 6.5, color: "#475569", fontWeight: 500, marginTop: 3, letterSpacing: "0.02em" }}>{T.title}</div>
        <div style={{ fontSize: 4.8, color: "#94a3b8", marginTop: 4, fontWeight: 500 }}>{T.email} · {T.location}</div>
      </div>
      <div style={{ width: "45%", height: 1, backgroundColor: accent, margin: "0 auto 7px" }} />

      <div style={{ marginBottom: 5 }}>
        <div style={{ fontSize: 5, color: "#475569", lineHeight: 1.42 }}>
          Senior product designer with 8+ years shipping consumer and SaaS products. Led design from Series A through IPO.
        </div>
      </div>

      <div style={{ height: 1, backgroundColor: "#e2e8f0", marginBottom: 6 }} />

      <div style={{ flex: 1, marginBottom: 5 }}>
        <Label text="Experience" color={accent} />
        <Rule color={accent} />
        <div style={{ marginTop: 4 }}>
          <JobEntry role={T.role1} company={T.company1} dates={T.dates1} bullets={[T.bullet1]} accent={accent} />
          <JobEntry role={T.role2} company={T.company2} dates={T.dates2} bullets={[T.bullet3]} accent={accent} dense />
        </div>
      </div>

      <div style={{ height: 1, backgroundColor: "#e2e8f0", marginBottom: 5 }} />

      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Label text="Education" color={accent} size={5} />
          <div style={{ fontSize: 6, fontWeight: 700, color: "#0b1220", marginTop: 3 }}>{T.degree}</div>
          <div style={{ fontSize: 5, color: "#475569", marginTop: 1.5 }}>{T.school}</div>
        </div>
        <div style={{ width: 1, backgroundColor: "#e2e8f0" }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Label text="Skills" color={accent} size={5} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 3 }}>
            {T.skills.slice(0, 5).map((s) => (
              <span key={s} style={{ fontSize: 4.8, color: "#475569", border: "1px solid #e2e8f0", borderRadius: 99, padding: "1.5px 4.5px" }}>{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   6. TIMELINE — vertical timeline experience
══════════════════════════════════════════════════════════════════════════ */
export function TimelineMiniResume({ accent = "#0d9488" }: { accent?: string }) {
  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#fff", padding: "12px 13px 10px", fontFamily: "system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 5 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#0b1220", letterSpacing: "-0.02em" }}>{T.name}</div>
          <div style={{ fontSize: 6.8, color: accent, fontWeight: 600, marginTop: 3 }}>{T.title}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 4.6, color: "#475569" }}>{T.email}</div>
          <div style={{ fontSize: 4.6, color: "#475569" }}>{T.location}</div>
        </div>
      </div>
      <div style={{ height: 1, backgroundColor: "#e2e8f0", marginBottom: 6 }} />

      <div style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 5, color: "#475569", lineHeight: 1.42 }}>
          Senior product designer with 8+ years shipping SaaS products from seed to IPO.
        </div>
      </div>

      <div style={{ flex: 1, marginBottom: 5 }}>
        <Label text="Experience" color={accent} />
        <Rule color={accent} />
        <div style={{ position: "relative", paddingLeft: 10, marginTop: 5 }}>
          {/* Vertical timeline line */}
          <div style={{ position: "absolute", left: 2.5, top: 0, bottom: 0, width: 1.5, backgroundColor: accent, opacity: 0.35, borderRadius: 1 }} />
          {[
            { role: T.role1, company: T.company1, dates: T.dates1, bullet: T.bullet1 },
            { role: T.role2, company: T.company2, dates: T.dates2, bullet: T.bullet3 },
          ].map((job, i) => (
            <div key={i} style={{ position: "relative", marginBottom: 7 }}>
              {/* Timeline dot */}
              <div style={{ position: "absolute", left: -10, top: 2, width: 5, height: 5, borderRadius: "50%", backgroundColor: accent, boxShadow: `0 0 0 1.5px #fff` }} />
              <Row>
                <span style={{ fontSize: 6.5, fontWeight: 700, color: "#0b1220" }}>{job.role}</span>
                <span style={{ fontSize: 4.6, color: "#94a3b8", fontStyle: "italic", flexShrink: 0 }}>{job.dates}</span>
              </Row>
              <div style={{ fontSize: 5.6, color: accent, fontWeight: 500, marginTop: 1.5 }}>{job.company}</div>
              <div style={{ display: "flex", gap: 3, marginTop: 2.5 }}>
                <span style={{ fontSize: 5, color: accent, fontWeight: 700 }}>—</span>
                <span style={{ fontSize: 4.8, color: "#334155", lineHeight: 1.35 }}>{job.bullet}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label text="Skills" color={accent} />
        <Rule color={accent} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 3.5 }}>
          {T.skills.map((s) => (
            <span key={s} style={{ fontSize: 4.8, color: "#475569", border: "1px solid #e2e8f0", borderRadius: 99, padding: "1.5px 4.5px" }}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Router — matches layout to mini card ─────────────────────────────────── */
export function MiniResume({ layout, accent }: { layout: string; accent: string }) {
  switch (layout) {
    case "sidebar":     return <SidebarMiniResume accent={accent} />;
    case "executive":   return <ExecutiveMiniResume accent={accent} />;
    case "creative":    return <CreativeMiniResume accent={accent} />;
    case "minimal":     return <MinimalMiniResume accent={accent} />;
    case "timeline":    return <TimelineMiniResume accent={accent} />;
    case "bold-header": return <ExecutiveMiniResume accent={accent} />;
    case "split-right": return <SidebarMiniResume accent={accent} />;
    case "mono":        return <MinimalMiniResume accent={accent} />;
    case "photo-card":  return <ExecutiveMiniResume accent={accent} />;
    case "compact":     return <MinimalMiniResume accent={accent} />;
    case "serif":       return <MinimalMiniResume accent={accent} />;
    case "split-accent":return <CreativeMiniResume accent={accent} />;
    default:            return <ClassicMiniResume accent={accent} />;
  }
}
