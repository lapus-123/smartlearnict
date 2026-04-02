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
import { hasUnseenUpdates, markUpdatesAsSeen } from "../utils/notifBadge";
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

export default function StudentHomeScreen({ navigation }) {
  const { currentUser } = useAuth();
  const [coreSubjects, setCoreSubjects] = useState([]);
  const [specSubjects, setSpecSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastMaterial, setLastMaterial] = useState(null);
  const [hasBadge, setHasBadge] = useState(false);

  // Re-fetch on focus so new subjects and resume state are always fresh
  useFocusEffect(
    useCallback(() => {
      setLoading(true);

      // Fetch core and specialization subjects separately — ensures correct filtering
      Promise.all([
        getSubjects({ type: "core" }),
        getSubjects({ type: "specialization" }),
      ])
        .then(([core, spec]) => {
          setCoreSubjects(core.data.subjects);
          setSpecSubjects(spec.data.subjects);
        })
        .catch(() => {
          setCoreSubjects([]);
          setSpecSubjects([]);
        })
        .finally(() => setLoading(false));

      // Load last accessed material for Resume Learning
      // Check for unseen updates badge
      getRecentMaterials()
        .then((r) => hasUnseenUpdates(r.data.materials))
        .then(setHasBadge)
        .catch(() => {});

      const userId = currentUser?.id || currentUser?._id;
      if (userId) {
        getLastMaterial(userId).then(setLastMaterial);
      }
    }, [currentUser?.id]), // FIX: was currentUser?._id — wrong field, caused stale closure
  );

  const handleResumeLearning = () => {
    if (!lastMaterial) {
      Alert.alert(
        "No Recent Activity",
        "You have not opened any learning material yet. Browse a subject to get started.",
      );
      return;
    }
    navigation.navigate("MaterialViewer", { material: lastMaterial });
  };

  const firstName =
    currentUser?.fullName?.split(" ")[0]?.toUpperCase() || "STUDENT";

  return (
    <LinearGradient
      colors={["#4DD9C0", "#4D8FD9", "#D98F7A"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.portalLabel}>ICT Academic Portal</Text>
            <Text style={styles.greeting}>HELLO, {firstName}! 👋</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate("Courses")}
            >
              <SearchIcon size={18} color="#1a3a5c" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => {
                setHasBadge(false);
                markUpdatesAsSeen();
                navigation.navigate("Updates");
              }}
            >
              <BellIcon size={18} color="#1a3a5c" />
              {hasBadge && <View style={styles.iconBadge} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <Text style={styles.progressIcon}>⚡</Text>
            <Text style={styles.progressLabel}>Academic Progress</Text>
          </View>
          {lastMaterial ? (
            <>
              <Text style={styles.progressTitle}>
                CONTINUE WHERE YOU LEFT OFF IN YOUR MAJORS.
              </Text>
              <View style={styles.lastMaterialRow}>
                <Text style={styles.lastMaterialIcon}>
                  {lastMaterial.fileType === "pdf"
                    ? "📄"
                    : lastMaterial.fileType === "mp4"
                      ? "🎬"
                      : "📝"}
                </Text>
                <Text style={styles.lastMaterialName} numberOfLines={1}>
                  {lastMaterial.title}
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.progressTitle}>
              START YOUR LEARNING JOURNEY TODAY.
            </Text>
          )}
          <TouchableOpacity
            style={styles.resumeBtn}
            onPress={handleResumeLearning}
          >
            <Text style={styles.resumeBtnText}>
              {lastMaterial ? "RESUME LEARNING" : "START LEARNING"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Core ICT Majors */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionLeft}>
            <Text style={styles.sectionIcon}>◈</Text>
            <View>
              <Text style={styles.sectionTitle}>CORE ICT MAJORS</Text>
              <Text style={styles.sectionSub}>Primary Curriculum</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Courses", {
                screen: "StudentCoursesList",
                params: { filter: "core" },
              })
            }
          >
            <Text style={styles.viewAll}>VIEW ALL</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color="#fff" style={{ marginBottom: 20 }} />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled={true}
            contentContainerStyle={styles.horizontalContent}
            style={styles.horizontalScroll}
          >
            {coreSubjects.map((s, i) => (
              <TouchableOpacity
                key={s._id}
                style={styles.coreCard}
                onPress={() =>
                  navigation.navigate("SubjectMaterials", { subject: s })
                }
                activeOpacity={0.85}
              >
                <View
                  style={[
                    styles.coreIconBox,
                    { backgroundColor: ICON_COLORS[i % ICON_COLORS.length] },
                  ]}
                >
                  {getSubjectIcon(s.name, 26, "#fff")}
                </View>
                <Text style={styles.coreCardLabel}>MAJOR SUBJECT</Text>
                <Text style={styles.coreCardName}>{s.name}</Text>
              </TouchableOpacity>
            ))}
            {coreSubjects.length === 0 && (
              <Text style={styles.emptyHoriz}>No core subjects added yet.</Text>
            )}
          </ScrollView>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
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
  lastMaterialRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  lastMaterialIcon: { fontSize: 18 },
  lastMaterialName: {
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
  resumeBtnText: {
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
  viewAll: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1a3a5c",
    letterSpacing: 0.5,
  },
  horizontalScroll: { marginBottom: 20 },
  horizontalContent: { paddingRight: 20, paddingBottom: 4 },
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
  coreCardLabel: {
    fontSize: 10,
    color: "#888",
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  coreCardName: { fontSize: 15, fontWeight: "800", color: "#1a3a5c" },
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
