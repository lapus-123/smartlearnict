import Svg, { Circle, Path, Rect } from "react-native-svg";

const D = { size: 24, color: "#1a3a5c", sw: 2 };

// ── Tab Bar Icons ─────────────────────────────────────────────────────────────
export const HomeIcon = ({ size = D.size, color = D.color, sw = D.sw }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H15v-5h-6v5H4a1 1 0 01-1-1V9.5z"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export const CoursesIcon = ({ size = D.size, color = D.color, sw = D.sw }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export const UpdatesIcon = ({ size = D.size, color = D.color, sw = D.sw }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export const ProfileIcon = ({ size = D.size, color = D.color, sw = D.sw }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={sw} />
    <Path
      d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
    />
  </Svg>
);
export const UploadIcon = ({ size = D.size, color = D.color, sw = D.sw }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── File Type Icons ───────────────────────────────────────────────────────────
export const PdfIcon = ({ size = D.size, color = "#E53935", sw = D.sw }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export const DocIcon = ({ size = D.size, color = "#1976D2", sw = D.sw }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 12h6m-6 4h6M9 8h6M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export const PptIcon = ({ size = D.size, color = "#E65100", sw = D.sw }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x={3}
      y={3}
      width={18}
      height={14}
      rx={2}
      stroke={color}
      strokeWidth={sw}
    />
    <Path
      d="M8 21h8M12 17v4"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
    />
  </Svg>
);
export const VideoIcon = ({ size = D.size, color = "#7B2FBE", sw = D.sw }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export const ImageIcon = ({ size = D.size, color = "#2d9e5f", sw = D.sw }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21zM16.5 9.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export const FileIcon = ({ size = D.size, color = "#555", sw = D.sw }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15.172 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8.828a2 2 0 00-.586-1.414l-2.828-2.828A2 2 0 0015.172 3z"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 3v5a1 1 0 001 1h5"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
    />
  </Svg>
);

// ── Subject-aware Icons ───────────────────────────────────────────────────────
export const ProgrammingIcon = ({
  size = D.size,
  color = "#fff",
  sw = D.sw,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 9l-3 3 3 3m8-6l3 3-3 3M14 5l-4 14"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export const AudioMusicIcon = ({
  size = D.size,
  color = "#fff",
  sw = D.sw,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export const AnimationVideoIcon = ({
  size = D.size,
  color = "#fff",
  sw = D.sw,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export const NetworkIcon = ({ size = D.size, color = "#fff", sw = D.sw }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={5} r={2} stroke={color} strokeWidth={sw} />
    <Circle cx={5} cy={19} r={2} stroke={color} strokeWidth={sw} />
    <Circle cx={19} cy={19} r={2} stroke={color} strokeWidth={sw} />
    <Path
      d="M12 7v4m0 0l-5 5m5-5l5 5"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
    />
  </Svg>
);
export const DatabaseIcon = ({ size = D.size, color = "#fff", sw = D.sw }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 7c0 2.21-3.582 4-8 4S4 9.21 4 7m16 0c0-2.21-3.582-4-8-4S4 4.79 4 7m16 0v5c0 2.21-3.582 4-8 4s-8-1.79-8-4V7m16 10v2c0 2.21-3.582 4-8 4s-8-1.79-8-4v-2"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export const DesignGraphicsIcon = ({
  size = D.size,
  color = "#fff",
  sw = D.sw,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export const MathIcon = ({ size = D.size, color = "#fff", sw = D.sw }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.773 4.773zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export const WebIcon = ({ size = D.size, color = "#fff", sw = D.sw }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={sw} />
    <Path
      d="M12 3c-4 5-4 13 0 18M12 3c4 5 4 13 0 18M3 12h18"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
    />
  </Svg>
);
export const ScienceIcon = ({ size = D.size, color = "#fff", sw = D.sw }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15a2.25 2.25 0 010 3.182M19.8 15l-7.8 7.8M5 14.5a2.25 2.25 0 000 3.182m0 0L12.8 4M5 17.682L12.8 4"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export const DefaultSubjectIcon = ({
  size = D.size,
  color = "#fff",
  sw = D.sw,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── Action Icons ──────────────────────────────────────────────────────────────
export const SearchIcon = ({ size = D.size, color = D.color, sw = D.sw }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export const BellIcon = ({ size = D.size, color = D.color, sw = D.sw }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export const DeleteIcon = ({ size = D.size, color = "#E53935", sw = D.sw }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export const EditIcon = ({ size = D.size, color = D.color, sw = D.sw }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export const ChevronRight = ({ size = D.size, color = "#aaa", sw = D.sw }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8.25 4.5l7.5 7.5-7.5 7.5"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export const ChevronLeft = ({ size = D.size, color = "#fff", sw = D.sw }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15.75 19.5L8.25 12l7.5-7.5"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export const LogoutIcon = ({ size = D.size, color = "#E53935", sw = D.sw }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export const HistoryIcon = ({ size = D.size, color = D.color, sw = D.sw }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export const PlayIcon = ({ size = D.size, color = "#fff", sw = D.sw }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.972l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653z"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export const FolderIcon = ({ size = D.size, color = D.color, sw = D.sw }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v8.25A2.25 2.25 0 004.5 16.5h15a2.25 2.25 0 002.25-2.25V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export const ApproveIcon = ({
  size = D.size,
  color = "#2EAB6F",
  sw = D.sw,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export const PinIcon = ({ size = D.size, color = "#1736F5", sw = D.sw }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── Smart Subject Icon — matches subject name to correct SVG ─────────────────
export const getSubjectIcon = (name, size = 26, color = "#fff") => {
  const n = (name || "").toLowerCase();
  if (n.includes("audio") || n.includes("music") || n.includes("sound"))
    return <AudioMusicIcon size={size} color={color} />;
  if (
    n.includes("video") ||
    n.includes("animation") ||
    n.includes("film") ||
    n.includes("cinema") ||
    n.includes("motion")
  )
    return <AnimationVideoIcon size={size} color={color} />;
  if (
    n.includes("program") ||
    n.includes("coding") ||
    n.includes("software") ||
    n.includes("develop") ||
    n.includes("java") ||
    n.includes("python") ||
    n.includes("c++")
  )
    return <ProgrammingIcon size={size} color={color} />;
  if (
    n.includes("network") ||
    n.includes("internet") ||
    n.includes("tcp") ||
    n.includes("server") ||
    n.includes("infra")
  )
    return <NetworkIcon size={size} color={color} />;
  if (n.includes("database") || n.includes("sql") || n.includes("data"))
    return <DatabaseIcon size={size} color={color} />;
  if (
    n.includes("design") ||
    n.includes("graphic") ||
    n.includes("art") ||
    n.includes("visual") ||
    n.includes("ui") ||
    n.includes("ux")
  )
    return <DesignGraphicsIcon size={size} color={color} />;
  if (
    n.includes("math") ||
    n.includes("calcul") ||
    n.includes("algebra") ||
    n.includes("statistic")
  )
    return <MathIcon size={size} color={color} />;
  if (
    n.includes("web") ||
    n.includes("html") ||
    n.includes("css") ||
    n.includes("react") ||
    n.includes("frontend")
  )
    return <WebIcon size={size} color={color} />;
  if (
    n.includes("science") ||
    n.includes("physics") ||
    n.includes("chem") ||
    n.includes("bio") ||
    n.includes("research")
  )
    return <ScienceIcon size={size} color={color} />;
  return <DefaultSubjectIcon size={size} color={color} />;
};

// ── File icon helpers ─────────────────────────────────────────────────────────
export const getFileIcon = (fileType, size = 28) => {
  const ft = (fileType || "").toLowerCase();
  if (ft === "pdf") return <PdfIcon size={size} />;
  if (ft === "doc" || ft === "docx") return <DocIcon size={size} />;
  if (ft === "ppt" || ft === "pptx") return <PptIcon size={size} />;
  if (ft === "mp4" || ft === "mov" || ft === "webm")
    return <VideoIcon size={size} />;
  if (ft === "jpg" || ft === "jpeg" || ft === "png")
    return <ImageIcon size={size} />;
  return <FileIcon size={size} />;
};

export const getFileColor = (fileType) => {
  const ft = (fileType || "").toLowerCase();
  if (ft === "pdf") return "#E53935";
  if (ft === "doc" || ft === "docx") return "#1976D2";
  if (ft === "ppt" || ft === "pptx") return "#E65100";
  if (ft === "mp4" || ft === "mov" || ft === "webm") return "#7B2FBE";
  if (ft === "jpg" || ft === "jpeg" || ft === "png") return "#2d9e5f";
  return "#555";
};
