import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BellIcon, getSubjectIcon, SearchIcon } from "../components/Icons";
import { useAuth } from "../contexts/AuthContext";
import { getRecentMaterials, getSubjects } from "../services/api";
import { hasUnseenUpdates } from "../utils/notifBadge";
import { getLastMaterial } from "../utils/resumeTracker";

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
  programming: "💻",
  web: "🌐",
  database: "🗄️",
  network: "🔗",
  design: "🎨",
  graphics: "🖼️",
  math: "📐",
  science: "🔬",
  video: "🎬",
  animation: "🎬",
};
const getIcon = (name) => {
  const n = name.toLowerCase();
  for (const k of Object.keys(SUBJECT_ICONS))
    if (n.includes(k)) return SUBJECT_ICONS[k];
  return SUBJECT_ICONS.default;
};

export default function InstructorHomeScreen({ navigation }) {
  const { currentUser } = useAuth();
  const [coreSubjects, setCoreSubjects] = useState([]);
  const [specSubjects, setSpecSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastMaterial, setLastMaterial] = useState(null);
  const [hasBadge, setHasBadge] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      Promise.all([
        getSubjects({ type: "core" }),
        getSubjects({ type: "specialization" }),
      ])
        .then(([c, s]) => {
          setCoreSubjects(c.data.subjects);
          setSpecSubjects(s.data.subjects);
        })
        .catch(() => {
          setCoreSubjects([]);
          setSpecSubjects([]);
        })
        .finally(() => setLoading(false));

      getRecentMaterials()
        .then((r) => hasUnseenUpdates(r.data.materials))
        .then(setHasBadge)
        .catch(() => {});
      const uid = currentUser?.id || currentUser?._id;
      if (uid) getLastMaterial(uid).then(setLastMaterial);
    }, [currentUser?.id]),
  );

  const handleResume = () => {
    if (!lastMaterial) {
      Alert.alert(
        "No Recent Activity",
        "You have not opened any material yet.",
      );
      return;
    }
    navigation.navigate("MaterialViewer", { material: lastMaterial });
  };

  const firstName =
    currentUser?.fullName?.split(" ")[0]?.toUpperCase() || "INSTRUCTOR";

  return (
    <LinearGradient
      colors={["#4DD9C0", "#4D8FD9", "#D98F7A"]}
      style={s.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.portalLabel}>INSTRUCTOR PORTAL</Text>
            <Text style={s.greeting}>Hello, {firstName} 👋</Text>
          </View>
          <View style={s.headerIcons}>
            <TouchableOpacity
              style={s.iconBtn}
              onPress={() => navigation.navigate("Courses")}
            >
              <SearchIcon size={18} color="#1a3a5c" />
            </TouchableOpacity>
            <TouchableOpacity
              style={s.iconBtn}
              onPress={() => navigation.navigate("Updates")}
            >
              <BellIcon size={18} color="#1a3a5c" />
              {hasBadge && <View style={s.iconBadge} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Resume card */}
        <View style={s.progressCard}>
          <View style={s.progressTop}>
            <Text style={s.progressIcon}>⭐</Text>
            <Text style={s.progressLabel}>CONTINUE LEARNING</Text>
          </View>
          <Text style={s.progressTitle}>Pick up where you left off</Text>
          {lastMaterial && (
            <View style={s.lastRow}>
              <Text style={s.lastIcon}>📖</Text>
              <Text style={s.lastName} numberOfLines={1}>
                {lastMaterial.title}
              </Text>
            </View>
          )}
          <TouchableOpacity style={s.resumeBtn} onPress={handleResume}>
            <Text style={s.resumeTxt}>RESUME LEARNING →</Text>
          </TouchableOpacity>
        </View>

        {/* Core Subjects */}
        <View style={s.sectionHeader}>
          <View style={s.sectionLeft}>
            <Text style={s.sectionIcon}>📚</Text>
            <View>
              <Text style={s.sectionTitle}>CORE SUBJECTS</Text>
              <Text style={s.sectionSub}>Major Modules</Text>
            </View>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color="#fff" style={{ marginBottom: 20 }} />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            contentContainerStyle={s.horizContent}
            style={s.horizScroll}
          >
            {coreSubjects.map((sub, i) => (
              <TouchableOpacity
                key={sub._id}
                style={s.coreCard}
                onPress={() =>
                  navigation.navigate("SubjectMaterials", { subject: sub })
                }
                activeOpacity={0.85}
              >
                <View
                  style={[
                    s.coreIconBox,
                    { backgroundColor: ICON_COLORS[i % ICON_COLORS.length] },
                  ]}
                >
                  {getSubjectIcon(sub.name, 26, "#fff")}
                </View>
                <Text style={s.coreLabel}>MAJOR SUBJECT</Text>
                <Text style={s.coreName}>{sub.name}</Text>
              </TouchableOpacity>
            ))}
            {coreSubjects.length === 0 && (
              <Text style={s.emptyHoriz}>No core subjects yet.</Text>
            )}
          </ScrollView>
        )}

        {/* When no specializations — show core as vertical list */}
        {!loading && specSubjects.length === 0 && coreSubjects.length > 0 && (
          <View style={s.specList}>
            {coreSubjects.map((sub, i) => (
              <TouchableOpacity
                key={sub._id + "_v"}
                style={s.specRow}
                onPress={() =>
                  navigation.navigate("SubjectMaterials", { subject: sub })
                }
                activeOpacity={0.85}
              >
                <View
                  style={[
                    s.specIcon,
                    { backgroundColor: ICON_COLORS[i % ICON_COLORS.length] },
                  ]}
                >
                  <Text style={s.specIconText}>{getIcon(sub.name)}</Text>
                </View>
                <View style={s.specInfo}>
                  <Text style={s.specName}>{sub.name}</Text>
                  <Text style={s.specLabel}>MAJOR SUBJECT</Text>
                </View>
                <Text style={s.specArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Specialization */}
        {!loading && specSubjects.length > 0 && (
          <>
            <View style={[s.sectionHeader, { marginTop: 8 }]}>
              <View style={s.sectionLeft}>
                <Text style={s.sectionIcon}>👥</Text>
                <View>
                  <Text style={s.sectionTitle}>SUPPORTING COURSES</Text>
                  <Text style={s.sectionSub}>Specialized Modules</Text>
                </View>
              </View>
            </View>
            <View style={s.specList}>
              {specSubjects.map((sub, i) => (
                <TouchableOpacity
                  key={sub._id}
                  style={s.specRow}
                  onPress={() =>
                    navigation.navigate("SubjectMaterials", { subject: sub })
                  }
                  activeOpacity={0.85}
                >
                  <View
                    style={[
                      s.specIcon,
                      {
                        backgroundColor:
                          ICON_COLORS[(i + 4) % ICON_COLORS.length],
                      },
                    ]}
                  >
                    <Text style={s.specIconText}>{getIcon(sub.name)}</Text>
                  </View>
                  <View style={s.specInfo}>
                    <Text style={s.specName}>{sub.name}</Text>
                    <Text style={s.specLabel}>SPECIALIZATION</Text>
                  </View>
                  <Text style={s.specArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  portalLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1a3a5c",
    letterSpacing: 0.5,
  },
  headerIcons: { flexDirection: "row", gap: 10 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnText: { fontSize: 18 },
  iconBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E53935",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.8)",
  },
  progressCard: {
    backgroundColor: "#1a3f7a",
    borderRadius: 20,
    padding: 22,
    marginBottom: 28,
  },
  progressTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 6,
  },
  progressIcon: { fontSize: 14, color: "#FFC709" },
  progressLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#fff",
    lineHeight: 24,
    marginBottom: 12,
  },
  lastRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  lastIcon: { fontSize: 18 },
  lastName: {
    flex: 1,
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: "600",
  },
  resumeBtn: {
    alignSelf: "flex-start",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  resumeTxt: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  sectionIcon: { fontSize: 18, color: "#1a3a5c" },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#1a3a5c",
    letterSpacing: 0.5,
  },
  sectionSub: { fontSize: 11, color: "rgba(26,58,92,0.7)", marginTop: 1 },
  horizScroll: { marginBottom: 20 },
  horizContent: { paddingRight: 20, paddingBottom: 4 },
  coreCard: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 18,
    padding: 18,
    marginRight: 12,
    width: 160,
    minHeight: 140,
  },
  coreIconBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  coreIconText: { fontSize: 26 },
  coreLabel: {
    fontSize: 10,
    color: "#888",
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  coreName: { fontSize: 15, fontWeight: "800", color: "#1a3a5c" },
  emptyHoriz: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    paddingVertical: 20,
  },
  specList: { gap: 10, marginBottom: 10 },
  specRow: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  specIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  specIconText: { fontSize: 22 },
  specInfo: { flex: 1 },
  specName: { fontSize: 15, fontWeight: "700", color: "#1a3a5c" },
  specLabel: {
    fontSize: 10,
    color: "#888",
    fontWeight: "700",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  specArrow: { fontSize: 22, color: "#aaa", fontWeight: "300" },
});
