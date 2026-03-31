import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getFileColor,
  getFileIcon,
  SearchIcon
} from "../components/Icons";
import { getMaterials, getSubjects } from "../services/api";

const ICON_COLORS = [
  "#F4631E",
  "#3B9EE8",
  "#2EAB6F",
  "#7B54E8",
  "#E84040",
  "#E87B20",
  "#3B7BE8",
  "#2EAB9E",
];
const SUBJECT_ICONS = {
  default: "📖",
  animation: "🎬",
  video: "🎬",
  audio: "🎧",
  programming: "💻",
  web: "🌐",
  database: "🗄️",
  network: "🔗",
  design: "🎨",
  graphics: "🖼️",
  math: "📐",
  science: "🔬",
};
const getIcon = (name) => {
  const n = name.toLowerCase();
  for (const k of Object.keys(SUBJECT_ICONS))
    if (n.includes(k)) return SUBJECT_ICONS[k];
  return SUBJECT_ICONS.default;
};

const TYPE_FILTERS = [
  { label: "ALL", value: "all" },
  { label: "CORE MAJORS", value: "core" },
  { label: "SPECIALIZATION", value: "specialization" },
];

export default function StudentCoursesScreen({ route, navigation }) {
  const initialFilter =
    route.params?.filter || route.params?.params?.filter || "all";
  const [subjects, setSubjects] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(initialFilter);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("subjects"); // 'subjects' | 'materials'
  const [subjectFilter, setSubjectFilter] = useState(""); // filter materials by subject

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      Promise.all([getSubjects(), getMaterials()])
        .then(([sr, mr]) => {
          setSubjects(sr.data.subjects);
          setMaterials(mr.data.materials);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, []),
  );

  const trimSearch = search.trim().toLowerCase();

  // Subject results
  const filteredSubjects = subjects.filter((s) => {
    const matchType = filter === "all" || s.type === filter;
    const matchSearch =
      !trimSearch || s.name.toLowerCase().includes(trimSearch);
    return matchType && matchSearch;
  });

  // Material results
  const filteredMaterials = materials.filter((m) => {
    const matchSubject =
      !subjectFilter ||
      m.subjectId?._id === subjectFilter ||
      m.subjectId === subjectFilter;
    const matchSearch =
      !trimSearch || m.title.toLowerCase().includes(trimSearch);
    return matchSubject && matchSearch;
  });

  const isSearching = trimSearch.length > 0;

  // Subject filter chips for material mode
  const subjectChips = [
    { label: "All Subjects", value: "" },
    ...subjects.map((s) => ({ label: s.name, value: s._id })),
  ];

  const renderSubject = ({ item: s, index }) => (
    <TouchableOpacity
      style={st.row}
      onPress={() => navigation.navigate("SubjectMaterials", { subject: s })}
      activeOpacity={0.85}
    >
      <View
        style={[
          st.rowIcon,
          { backgroundColor: ICON_COLORS[index % ICON_COLORS.length] },
        ]}
      >
        <Text style={st.rowIconText}>{getIcon(s.name)}</Text>
      </View>
      <View style={st.rowInfo}>
        <Text style={st.rowBadge}>
          {s.type === "core" ? "ICT MAJOR" : "SPECIALIZATION"}
        </Text>
        <Text style={st.rowName}>{s.name}</Text>
      </View>
      <Text style={st.rowArrow}>›</Text>
    </TouchableOpacity>
  );

  const renderMaterial = ({ item: m }) => (
    <TouchableOpacity
      style={st.matRow}
      onPress={() => navigation.navigate("MaterialViewer", { material: m })}
      activeOpacity={0.85}
    >
      <View
        style={[
          st.matIconBox,
          { backgroundColor: getFileColor(m.fileType) + "18" },
        ]}
      >
        {getFileIcon(m.fileType, 24)}
      </View>
      <View style={st.matInfo}>
        <Text style={st.matSubject}>{m.subjectId?.name || "—"}</Text>
        <Text style={st.matTitle} numberOfLines={2}>
          {m.title}
        </Text>
        <Text style={st.matMeta}>
          {m.schoolYear} · {m.fileType?.toUpperCase()}
        </Text>
      </View>
      <Text style={st.rowArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={["#4DD9C0", "#4D8FD9", "#D98F7A"]}
      style={st.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="dark-content" />

      <View style={st.topBar}>
        <Text style={st.title}>SEARCH</Text>

        {/* Search box */}
        <View style={st.searchBox}>
          <SearchIcon size={18} color="#aaa" />
          <TextInput
            style={st.searchInput}
            placeholder="Search subjects or materials..."
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text style={st.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Mode toggle — subjects / materials */}
        <View style={st.modeRow}>
          <TouchableOpacity
            style={[st.modeBtn, mode === "subjects" && st.modeBtnActive]}
            onPress={() => setMode("subjects")}
          >
            <Text style={[st.modeTxt, mode === "subjects" && st.modeTxtActive]}>
              📚 Subjects
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[st.modeBtn, mode === "materials" && st.modeBtnActive]}
            onPress={() => setMode("materials")}
          >
            <Text
              style={[st.modeTxt, mode === "materials" && st.modeTxtActive]}
            >
              📄 Materials
            </Text>
          </TouchableOpacity>
        </View>

        {/* Subject type filter — only in subjects mode */}
        {mode === "subjects" && (
          <FlatList
            horizontal
            data={TYPE_FILTERS}
            keyExtractor={(f) => f.value}
            showsHorizontalScrollIndicator={false}
            style={st.pills}
            contentContainerStyle={{ gap: 8 }}
            renderItem={({ item: f }) => (
              <TouchableOpacity
                style={[st.pill, filter === f.value && st.pillActive]}
                onPress={() => setFilter(f.value)}
              >
                <Text
                  style={[st.pillText, filter === f.value && st.pillTextActive]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Subject filter chips — only in materials mode */}
        {mode === "materials" && (
          <FlatList
            horizontal
            data={subjectChips}
            keyExtractor={(c) => c.value}
            showsHorizontalScrollIndicator={false}
            style={st.pills}
            contentContainerStyle={{ gap: 8 }}
            renderItem={({ item: c }) => (
              <TouchableOpacity
                style={[st.pill, subjectFilter === c.value && st.pillActive]}
                onPress={() => setSubjectFilter(c.value)}
              >
                <Text
                  style={[
                    st.pillText,
                    subjectFilter === c.value && st.pillTextActive,
                  ]}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {loading ? (
        <ActivityIndicator
          color="#fff"
          size="large"
          style={{ marginTop: 40 }}
        />
      ) : mode === "subjects" ? (
        <FlatList
          data={filteredSubjects}
          keyExtractor={(s) => s._id}
          renderItem={renderSubject}
          contentContainerStyle={st.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState />}
        />
      ) : (
        <FlatList
          data={filteredMaterials}
          keyExtractor={(m) => m._id}
          renderItem={renderMaterial}
          contentContainerStyle={st.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState msg="No materials found." />}
        />
      )}
    </LinearGradient>
  );
}

const EmptyState = ({ msg = "No subjects found." }) => (
  <View style={st.empty}>
    <Text style={st.emptyIcon}>📭</Text>
    <Text style={st.emptyText}>{msg}</Text>
  </View>
);

const st = StyleSheet.create({
  container: { flex: 1 },
  topBar: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 8 },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#1a3a5c",
    letterSpacing: 0.5,
    marginBottom: 14,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 50,
    gap: 8,
    marginBottom: 12,
    elevation: 2,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15, color: "#1a3a5c" },
  clearBtn: { fontSize: 14, color: "#aaa", padding: 4 },

  modeRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
  },
  modeBtnActive: { backgroundColor: "#1a3f7a" },
  modeTxt: { fontSize: 13, fontWeight: "700", color: "rgba(26,58,92,0.7)" },
  modeTxtActive: { color: "#fff", fontWeight: "800" },

  pills: { marginBottom: 10 },
  pill: {
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.6)",
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 7,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  pillActive: { backgroundColor: "#1a3a5c", borderColor: "#1a3a5c" },
  pillText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1a3a5c",
    letterSpacing: 0.4,
  },
  pillTextActive: { color: "#fff" },

  list: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },

  // Subject row
  row: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  rowIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  rowIconText: { fontSize: 26 },
  rowInfo: { flex: 1 },
  rowBadge: {
    fontSize: 10,
    fontWeight: "700",
    color: "#888",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  rowName: { fontSize: 16, fontWeight: "800", color: "#1a3a5c" },
  rowArrow: { fontSize: 26, color: "#aaa" },

  // Material row
  matRow: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  matIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  matIcon: { fontSize: 24 },
  matInfo: { flex: 1 },
  matSubject: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1736F5",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  matTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a3a5c",
    marginBottom: 3,
  },
  matMeta: { fontSize: 11, color: "#999" },

  empty: { alignItems: "center", paddingVertical: 50 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { color: "rgba(26,58,92,0.6)", fontSize: 15, fontWeight: "600" },
});
