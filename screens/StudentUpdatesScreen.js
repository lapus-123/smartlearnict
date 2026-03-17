import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getRecentMaterials } from "../services/api";
import {
  getSeenIds,
  markMaterialSeen,
  markUpdatesAsSeen,
} from "../utils/notifBadge";

const FILE_ICON = {
  pdf: "📄",
  docx: "📝",
  doc: "📝",
  ppt: "📊",
  pptx: "📊",
  mp4: "🎬",
  mov: "🎬",
  webm: "🎬",
  jpg: "🖼️",
  jpeg: "🖼️",
  png: "🖼️",
};
const FILE_COLOR = {
  pdf: "#E53935",
  docx: "#1976D2",
  doc: "#1976D2",
  ppt: "#E65100",
  pptx: "#E65100",
  mp4: "#7B2FBE",
  mov: "#7B2FBE",
  webm: "#7B2FBE",
  jpg: "#2d9e5f",
  jpeg: "#2d9e5f",
  png: "#2d9e5f",
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

export default function StudentUpdatesScreen({ navigation }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seenIds, setSeenIds] = useState(new Set());

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      Promise.all([getRecentMaterials(), getSeenIds()])
        .then(([r, ids]) => {
          setMaterials(r.data.materials);
          setSeenIds(ids);
        })
        .catch(() => setMaterials([]))
        .finally(() => setLoading(false));
      markUpdatesAsSeen();
    }, []),
  );

  return (
    <LinearGradient
      colors={["#4DD9C0", "#4D8FD9", "#D98F7A"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Updates</Text>
          <Text style={styles.subtitle}>New learning materials from Admin</Text>
        </View>

        {loading && (
          <ActivityIndicator
            color="#fff"
            size="large"
            style={{ marginTop: 40 }}
          />
        )}

        {!loading && materials.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No new materials yet.</Text>
            <Text style={styles.emptyHint}>
              Check back later for updates from your Admin.
            </Text>
          </View>
        )}

        {materials.map((m, i) => (
          <TouchableOpacity
            key={m._id}
            style={styles.card}
            onPress={() => {
              // Mark as seen so NEW badge disappears
              markMaterialSeen(m._id);
              setSeenIds((prev) => new Set([...prev, String(m._id)]));
              navigation.navigate("MaterialViewer", { material: m });
            }}
            activeOpacity={0.85}
          >
            {/* NEW badge — only shown if material hasn't been tapped yet */}
            {!seenIds.has(String(m._id)) && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            )}

            <View style={styles.cardLeft}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: FILE_COLOR[m.fileType] || "#1736F5" },
                ]}
              >
                <Text style={styles.iconText}>
                  {FILE_ICON[m.fileType] || "📎"}
                </Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardSubject}>
                {m.subjectId?.name || "Unknown Subject"}
              </Text>
              {m.uploadedByName && m.uploadedByName !== "Admin" && (
                <Text style={styles.cardUploader}>👤 {m.uploadedByName}</Text>
              )}
              <Text style={styles.cardTitle} numberOfLines={2}>
                {m.title}
              </Text>
              {m.description ? (
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {m.description}
                </Text>
              ) : null}
              <View style={styles.cardMeta}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>
                    {m.fileType?.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.cardTime}>🕐 {timeAgo(m.createdAt)}</Text>
              </View>
              <Text style={styles.cardDateTime}>
                {"📅 " +
                  new Date(m.createdAt).toLocaleDateString("en-PH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                {"   🕑 " +
                  new Date(m.createdAt).toLocaleTimeString("en-PH", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 64, paddingBottom: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: "900", color: "#1a3a5c" },
  subtitle: { fontSize: 13, color: "rgba(26,58,92,0.7)", marginTop: 4 },
  empty: { alignItems: "center", marginTop: 60 },
  emptyIcon: { fontSize: 52, marginBottom: 12 },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a3a5c",
    marginBottom: 6,
  },
  emptyHint: { fontSize: 13, color: "rgba(26,58,92,0.6)", textAlign: "center" },
  card: {
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    gap: 14,
    elevation: 3,
    position: "relative",
    overflow: "hidden",
  },
  newBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#E53935",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  newBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  cardLeft: { justifyContent: "flex-start" },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 24 },
  cardBody: { flex: 1 },
  cardSubject: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1736F5",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1a3a5c",
    marginBottom: 4,
    lineHeight: 20,
  },
  cardDesc: { fontSize: 12, color: "#666", lineHeight: 17, marginBottom: 8 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  typeBadge: {
    backgroundColor: "#EEF0FF",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#1736F5",
    letterSpacing: 0.5,
  },
  cardTime: { fontSize: 11, color: "#999" },
  cardUploader: {
    fontSize: 11,
    color: "#1736F5",
    fontWeight: "700",
    marginBottom: 3,
  },
  cardDateTime: { fontSize: 11, color: "#888", marginTop: 5 },
});
