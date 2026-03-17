import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getReadingHistory } from "../services/api";

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

const formatDate = (d) => {
  const date = new Date(d);
  return (
    date.toLocaleDateString("en-PH", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }) +
    " – " +
    date.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })
  );
};

export default function ReadingHistoryScreen({ navigation }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      getReadingHistory()
        .then((r) => setRecords(r.data.records))
        .catch(() => setRecords([]))
        .finally(() => setLoading(false));
    }, []),
  );

  const handlePress = (item) => {
    // materialId is now populated — use it as the material object
    const material = item.materialId;
    if (!material?._id) return;
    navigation.navigate("MaterialViewer", { material });
  };

  return (
    <LinearGradient
      colors={["#4DD9C0", "#4D8FD9", "#D98F7A"]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.back}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Reading Log</Text>
      </View>

      {loading ? (
        <ActivityIndicator
          color="#fff"
          size="large"
          style={{ marginTop: 40 }}
        />
      ) : records.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyText}>No reading history yet.</Text>
          <Text style={styles.emptyHint}>
            Open a learning material to start tracking.
          </Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(r) => r._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const material = item.materialId; // populated object
            const ft = material?.fileType?.toLowerCase();
            const canOpen = !!material?._id;

            return (
              <TouchableOpacity
                style={[styles.card, !canOpen && styles.cardDeleted]}
                onPress={() => handlePress(item)}
                activeOpacity={canOpen ? 0.75 : 1}
                disabled={!canOpen}
              >
                <View style={styles.cardLeft}>
                  <Text style={[styles.fileIcon, !canOpen && styles.fadedText]}>
                    {FILE_ICON[ft] || "📖"}
                  </Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={[styles.subject, !canOpen && styles.fadedText]}>
                    {item.subjectName ||
                      material?.subjectId?.name ||
                      "Unknown Subject"}
                  </Text>
                  <Text
                    style={[styles.materialTitle, !canOpen && styles.fadedText]}
                    numberOfLines={2}
                  >
                    {item.materialTitle || material?.title}
                  </Text>
                  {!canOpen && (
                    <View style={styles.deletedBadge}>
                      <Text style={styles.deletedBadgeText}>
                        🗑 Material removed
                      </Text>
                    </View>
                  )}
                  <Text style={[styles.date, !canOpen && styles.fadedText]}>
                    🕐 {formatDate(item.lastOpenedAt)}
                  </Text>
                  {canOpen && (
                    <View style={styles.progRow}>
                      {item.isVideo ? (
                        <View
                          style={[
                            styles.watchBadge,
                            item.watched && styles.watchBadgeOn,
                          ]}
                        >
                          <Text
                            style={[
                              styles.watchBadgeText,
                              item.watched && styles.watchBadgeTextOn,
                            ]}
                          >
                            {item.watched
                              ? "✓  Watched"
                              : "👁  Not watched yet"}
                          </Text>
                        </View>
                      ) : (
                        <>
                          <View style={styles.progTrack}>
                            <View
                              style={[
                                styles.progFill,
                                {
                                  width: `${item.progress}%`,
                                  backgroundColor:
                                    item.progress >= 100
                                      ? "#2EAB6F"
                                      : "#1736F5",
                                },
                              ]}
                            />
                          </View>
                          <Text
                            style={[
                              styles.progPct,
                              {
                                color:
                                  item.progress >= 100 ? "#2EAB6F" : "#1736F5",
                              },
                            ]}
                          >
                            {item.progress}%{item.progress >= 100 ? " ✓" : ""}
                          </Text>
                        </>
                      )}
                    </View>
                  )}
                </View>
                {canOpen ? (
                  <Text style={styles.arrow}>›</Text>
                ) : (
                  <View style={styles.reminderBtn}>
                    <Text style={styles.reminderIcon}>📌</Text>
                    <Text style={styles.reminderTxt}>History</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  back: { padding: 4 },
  backText: { fontSize: 22, fontWeight: "700", color: "#1a3a5c" },
  title: { fontSize: 24, fontWeight: "900", color: "#1a3a5c" },
  empty: { alignItems: "center", marginTop: 60, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 52, marginBottom: 12 },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a3a5c",
    marginBottom: 6,
  },
  emptyHint: { fontSize: 13, color: "rgba(26,58,92,0.6)", textAlign: "center" },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    elevation: 2,
  },
  cardDisabled: { opacity: 0.6 },
  cardLeft: { justifyContent: "flex-start", paddingTop: 2 },
  fileIcon: { fontSize: 28 },
  cardBody: { flex: 1 },
  subject: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1736F5",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  materialTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a3a5c",
    marginBottom: 4,
  },
  date: { fontSize: 11, color: "#888", marginBottom: 8 },
  progRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  progTrack: {
    flex: 1,
    height: 5,
    backgroundColor: "#E0E4FF",
    borderRadius: 3,
    overflow: "hidden",
  },
  progFill: { height: "100%", borderRadius: 3 },
  progPct: {
    fontSize: 11,
    fontWeight: "800",
    minWidth: 38,
    textAlign: "right",
  },
  watchBadge: {
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  watchBadgeOn: { backgroundColor: "#E8F5E9" },
  watchBadgeText: { fontSize: 11, fontWeight: "700", color: "#999" },
  watchBadgeTextOn: { color: "#2EAB6F" },
  arrow: { fontSize: 24, color: "#aaa", fontWeight: "300" },
  cardDeleted: {
    opacity: 0.75,
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderStyle: "dashed",
  },
  fadedText: { color: "#aaa" },
  deletedBadge: {
    backgroundColor: "#FFF0F0",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  deletedBadgeText: { fontSize: 10, color: "#E53935", fontWeight: "700" },
  reminderBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F4FF",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 3,
  },
  reminderIcon: { fontSize: 16 },
  reminderTxt: {
    fontSize: 9,
    color: "#1736F5",
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
