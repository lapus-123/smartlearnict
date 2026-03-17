import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../config";
import { getMaterials } from "../services/api";

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

export default function SubjectMaterialsScreen({ route, navigation }) {
  const { subject } = route.params;
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState("");
  const [years, setYears] = useState([]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      getMaterials({ subjectId: subject._id })
        .then((r) => {
          const mats = r.data.materials;
          setMaterials(mats);
          const uniqueYears = [...new Set(mats.map((m) => m.schoolYear))]
            .sort()
            .reverse();
          setYears(uniqueYears);
        })
        .catch(() => setMaterials([]))
        .finally(() => setLoading(false));
    }, [subject._id]),
  );

  const filtered = yearFilter
    ? materials.filter((m) => m.schoolYear === yearFilter)
    : materials;

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{subject.name}</Text>
      <Text style={styles.subtitle}>
        {materials.length} material{materials.length !== 1 ? "s" : ""}
      </Text>

      {/* Year filter chips */}
      {years.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chips}
        >
          <TouchableOpacity
            style={[styles.chip, !yearFilter && styles.chipActive]}
            onPress={() => setYearFilter("")}
          >
            <Text
              style={[styles.chipText, !yearFilter && styles.chipTextActive]}
            >
              All
            </Text>
          </TouchableOpacity>
          {years.map((y) => (
            <TouchableOpacity
              key={y}
              style={[styles.chip, yearFilter === y && styles.chipActive]}
              onPress={() => setYearFilter(y)}
            >
              <Text
                style={[
                  styles.chipText,
                  yearFilter === y && styles.chipTextActive,
                ]}
              >
                {y}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {loading && (
        <ActivityIndicator color={COLORS.blue} style={{ marginTop: 40 }} />
      )}

      {filtered.map((m) => (
        <TouchableOpacity
          key={m._id}
          style={styles.card}
          onPress={() => navigation.navigate("MaterialViewer", { material: m })}
          activeOpacity={0.85}
        >
          <View
            style={[
              styles.iconBox,
              { backgroundColor: FILE_COLOR[m.fileType] || COLORS.blue },
            ]}
          >
            <Text style={styles.iconText}>{FILE_ICON[m.fileType] || "📎"}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{m.title}</Text>
            {m.uploadedByName && m.uploadedByName !== "Admin" && (
              <Text style={styles.cardUploader}>👤 {m.uploadedByName}</Text>
            )}
            {m.description ? (
              <Text style={styles.cardDesc} numberOfLines={2}>
                {m.description}
              </Text>
            ) : null}
            <View style={styles.cardMeta}>
              <Text style={styles.metaBadge}>{m.fileType?.toUpperCase()}</Text>
              <Text style={styles.metaYear}>{m.schoolYear}</Text>
            </View>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}

      {!loading && filtered.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No materials yet.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6FF",
    padding: 20,
    paddingTop: 56,
  },
  back: { marginBottom: 16 },
  backText: { color: COLORS.blue, fontWeight: "600", fontSize: 15 },
  title: { fontSize: 26, fontWeight: "800", color: "#1a1a1a", marginBottom: 4 },
  subtitle: { fontSize: 13, color: COLORS.gray, marginBottom: 16 },
  chips: { marginBottom: 16 },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: COLORS.lightGray,
    marginRight: 8,
  },
  chipActive: { backgroundColor: COLORS.blue },
  chipText: { fontSize: 12, fontWeight: "600", color: COLORS.gray },
  chipTextActive: { color: COLORS.white },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  iconText: { fontSize: 24 },
  cardInfo: { flex: 1 },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 3,
  },
  cardDesc: { fontSize: 12, color: COLORS.gray, marginBottom: 6 },
  cardMeta: { flexDirection: "row", gap: 8, alignItems: "center" },
  metaBadge: {
    backgroundColor: "#EEF0FF",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.blue,
  },
  metaYear: { fontSize: 11, color: COLORS.gray },
  cardUploader: {
    fontSize: 11,
    color: COLORS.blue,
    fontWeight: "700",
    marginBottom: 4,
  },
  arrow: { fontSize: 22, color: COLORS.gray, marginLeft: 8 },
  empty: { alignItems: "center", marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: COLORS.gray },
});
