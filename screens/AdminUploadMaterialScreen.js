import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../components/Button";
import Dropdown from "../components/Dropdown";
import {
  FileIcon,
  getFileIcon,
  SearchIcon
} from "../components/Icons";
import Input from "../components/Input";
import PopupModal from "../components/PopupModal";
import {
  deleteMaterial,
  getMaterials,
  getSubjects,
  uploadMaterial,
} from "../services/api";

const MIME_MAP = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  mp4: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};
const getMime = (name, fallback) =>
  MIME_MAP[name?.split(".").pop()?.toLowerCase()] ||
  fallback ||
  "application/octet-stream";
const getExt = (name) => name?.split(".").pop()?.toLowerCase() || "";
const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
const formatSize = (bytes) =>
  bytes > 1048576
    ? (bytes / 1048576).toFixed(1) + " MB"
    : (bytes / 1024).toFixed(0) + " KB";

function TabBar({ active, onChange }) {
  return (
    <View style={s.tabBar}>
      {[
        { key: "upload", label: "📤  Upload" },
        { key: "list", label: "📋  Materials" },
      ].map((t) => (
        <TouchableOpacity
          key={t.key}
          style={[s.tab, active === t.key && s.tabActive]}
          onPress={() => onChange(t.key)}
        >
          <Text style={[s.tabText, active === t.key && s.tabTextActive]}>
            {t.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function AdminUploadMaterialScreen({ navigation }) {
  const [tab, setTab] = useState("upload");
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [schoolYear, setSchoolYear] = useState("");
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [files, setFiles] = useState([]); // [{uri, name, size, mimeType}]
  const [uploading, setUploading] = useState(false);
  const [popup, setPopup] = useState({
    visible: false,
    title: "",
    message: "",
    type: "success",
  });

  const [materials, setMaterials] = useState([]);
  const [loadingMats, setLoadingMats] = useState(false);
  const [filterSub, setFilterSub] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [matSearch, setMatSearch] = useState("");

  useEffect(() => {
    getSubjects()
      .then((r) =>
        setSubjects(
          r.data.subjects.map((s) => ({ label: s.name, value: s._id })),
        ),
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (tab === "list") loadMaterials();
  }, [tab]);

  const loadMaterials = async () => {
    setLoadingMats(true);
    try {
      const r = await getMaterials();
      setMaterials(r.data.materials);
    } catch {
      setMaterials([]);
    }
    setLoadingMats(false);
  };

  const pickFiles = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: true,
      });
      if (res.canceled || !res.assets?.length) return;
      const newFiles = res.assets.map((a) => ({
        uri: a.uri,
        name: a.name,
        size: a.size,
        mimeType: a.mimeType,
      }));
      setFiles((prev) => {
        const combined = [...prev, ...newFiles];
        // remove duplicates by name
        return combined.filter(
          (f, i, arr) => arr.findIndex((x) => x.name === f.name) === i,
        );
      });
    } catch {
      Alert.alert("Error", "Could not pick files.");
    }
  };

  const removeFile = (index) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  const handleUpload = async () => {
    if (!subjectId)
      return setPopup({
        visible: true,
        title: "Missing",
        message: "Please select a subject.",
        type: "error",
      });
    if (!schoolYear.trim())
      return setPopup({
        visible: true,
        title: "Missing",
        message: "Please enter school year.",
        type: "error",
      });
    if (!title.trim())
      return setPopup({
        visible: true,
        title: "Missing",
        message: "Please enter a title.",
        type: "error",
      });
    if (!files.length)
      return setPopup({
        visible: true,
        title: "Missing",
        message: "Please select at least one file.",
        type: "error",
      });

    const formData = new FormData();
    formData.append("subjectId", subjectId);
    formData.append("schoolYear", schoolYear.trim());
    formData.append("description", description.trim());
    formData.append("title", title.trim());
    files.forEach((f) => {
      formData.append("files", {
        uri: f.uri,
        name: f.name,
        type: getMime(f.name, f.mimeType),
      });
    });

    setUploading(true);
    try {
      const r = await uploadMaterial(formData);
      setPopup({
        visible: true,
        title: "✅ Uploaded!",
        message: `${r.data.materials?.length || 1} file(s) uploaded successfully.`,
        type: "success",
      });
      setFiles([]);
      setSchoolYear("");
      setDescription("");
      setSubjectId("");
      setTitle("");
    } catch (e) {
      setPopup({
        visible: true,
        title: "Upload Failed",
        message: e.response?.data?.message || "Upload failed.",
        type: "error",
      });
    }
    setUploading(false);
  };

  const handleDelete = (item) => {
    Alert.alert("Delete", 'Delete "' + item.title + '"?', [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeleting(item._id);
          try {
            await deleteMaterial(item._id);
            loadMaterials();
          } catch {
            Alert.alert("Error", "Could not delete.");
          }
          setDeleting(null);
        },
      },
    ]);
  };

  const subjectOptions = [{ label: "All Subjects", value: "" }, ...subjects];
  const filteredMats = materials.filter((m) => {
    const matchSub = !filterSub || m.subjectId?._id === filterSub;
    const matchSearch =
      !matSearch.trim() ||
      m.title.toLowerCase().includes(matSearch.trim().toLowerCase());
    return matchSub && matchSearch;
  });

  return (
    <LinearGradient
      colors={["#4DD9C0", "#4D8FD9", "#D98F7A"]}
      style={s.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="dark-content" />
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={s.screenTitle}>Upload Materials</Text>
          <Text style={s.screenSub}>Admin · Multiple files supported</Text>
        </View>
      </View>

      <TabBar active={tab} onChange={setTab} />

      {/* ── UPLOAD TAB ── */}
      {tab === "upload" && (
        <ScrollView
          contentContainerStyle={s.formScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.card}>
            <Dropdown
              label="Subject"
              placeholder="Select Subject"
              options={subjects}
              value={subjectId}
              onChange={setSubjectId}
            />
            <Input
              label="School Year"
              placeholder="e.g. 2024-2025"
              value={schoolYear}
              onChangeText={setSchoolYear}
            />
            <Input
              label="Title"
              placeholder="e.g. Module 1: Introduction"
              value={title}
              onChangeText={setTitle}
            />
            <Input
              label="Description (optional)"
              placeholder="Brief description for all files"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={2}
            />

            {/* File picker button */}
            <TouchableOpacity
              style={s.pickerBtn}
              onPress={pickFiles}
              activeOpacity={0.8}
            >
              <FileIcon size={28} color="#1a3a5c" />
              <View style={{ flex: 1 }}>
                <Text style={s.pickerLabel}>Add Files</Text>
                <Text style={s.pickerSub}>
                  PDF, DOCX, PPT, MP4, images · tap to add more
                </Text>
              </View>
              <View style={s.pickerBadge}>
                <Text style={s.pickerBadgeTxt}>{files.length || "+"}</Text>
              </View>
            </TouchableOpacity>

            {/* File list with individual titles */}
            {files.length > 0 && (
              <View style={s.fileList}>
                <Text style={s.fileListHeader}>
                  {files.length} file{files.length !== 1 ? "s" : ""} selected —
                  set a title for each
                </Text>
                {files.map((f, i) => (
                  <View key={i} style={s.fileItem}>
                    <View style={s.fileItemTop}>
                      {getFileIcon(getExt(f.name), 26)}
                      <View style={{ flex: 1 }}>
                        <Text style={s.fileItemName} numberOfLines={1}>
                          {f.name}
                        </Text>
                        {f.size ? (
                          <Text style={s.fileItemSize}>
                            {formatSize(f.size)}
                          </Text>
                        ) : null}
                      </View>
                      <TouchableOpacity
                        onPress={() => removeFile(i)}
                        style={s.removeBtn}
                      >
                        <Text style={s.removeIcon}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <Button
              title={
                uploading
                  ? `Uploading ${files.length} file(s)...`
                  : `Upload ${files.length || ""} Material${files.length !== 1 ? "s" : ""}`
              }
              onPress={handleUpload}
              loading={uploading}
              style={{ marginTop: 8 }}
            />
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* ── MATERIALS LIST TAB ── */}
      {tab === "list" && (
        <View style={s.listContainer}>
          {/* Search bar */}
          <View style={s.searchBar}>
            <SearchIcon size={16} color="#aaa" />
            <TextInput
              style={s.searchInput}
              placeholder="Search materials..."
              placeholderTextColor="#aaa"
              value={matSearch}
              onChangeText={setMatSearch}
            />
            {matSearch.length > 0 && (
              <TouchableOpacity onPress={() => setMatSearch("")}>
                <Text style={s.searchClear}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Subject filter tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.filterBar}
            contentContainerStyle={s.filterContent}
          >
            {subjectOptions.map((o) => (
              <TouchableOpacity
                key={o.value}
                style={[
                  s.filterTab,
                  filterSub === o.value && s.filterTabActive,
                ]}
                onPress={() => setFilterSub(o.value)}
              >
                <Text
                  style={[
                    s.filterTabText,
                    filterSub === o.value && s.filterTabTextActive,
                  ]}
                >
                  {o.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {loadingMats ? (
            <ActivityIndicator
              color="#fff"
              size="large"
              style={{ marginTop: 40 }}
            />
          ) : (
            <ScrollView
              contentContainerStyle={s.matList}
              showsVerticalScrollIndicator={false}
            >
              {filteredMats.length === 0 ? (
                <View style={s.empty}>
                  <Text style={s.emptyIcon}>📭</Text>
                  <Text style={s.emptyText}>No materials found</Text>
                </View>
              ) : (
                filteredMats.map((item) => (
                  <View key={item._id} style={s.matCard}>
                    <View style={s.matHeader}>
                      {getFileIcon(item.fileType, 30)}
                      <View style={{ flex: 1 }}>
                        <Text style={s.matTitle} numberOfLines={2}>
                          {item.title}
                        </Text>
                        <Text style={s.matSubject}>
                          {item.subjectId?.name || "—"}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDelete(item)}
                        disabled={deleting === item._id}
                        style={s.deleteBtn}
                      >
                        {deleting === item._id ? (
                          <ActivityIndicator color="#E53935" size="small" />
                        ) : (
                          <Text style={s.deleteIcon}>🗑️</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                    {item.description ? (
                      <Text style={s.matDesc} numberOfLines={2}>
                        {item.description}
                      </Text>
                    ) : null}
                    <View style={s.matMeta}>
                      <Text style={s.matMetaTxt}>📅 {item.schoolYear}</Text>
                      <Text style={s.matMetaTxt}>
                        🗓 {formatDate(item.createdAt)}
                      </Text>
                      <View style={s.matTypeBadge}>
                        <Text style={s.matTypeTxt}>
                          {item.fileType?.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
              <View style={{ height: 40 }} />
            </ScrollView>
          )}
        </View>
      )}

      <PopupModal
        visible={popup.visible}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        onClose={() => {
          setPopup({ ...popup, visible: false });
          if (popup.type === "success") setTab("list");
        }}
      />
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  back: { padding: 4 },
  backText: { fontSize: 22, fontWeight: "700", color: "#1a3a5c" },
  screenTitle: { fontSize: 22, fontWeight: "900", color: "#1a3a5c" },
  screenSub: { fontSize: 12, color: "rgba(26,58,92,0.7)", marginTop: 2 },
  tabBar: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 12,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 9 },
  tabActive: { backgroundColor: "#fff", elevation: 2 },
  tabText: { fontSize: 13, fontWeight: "600", color: "rgba(26,58,92,0.6)" },
  tabTextActive: { color: "#1a3a5c", fontWeight: "800" },

  formScroll: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 20,
    padding: 20,
    elevation: 3,
  },

  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4FF",
    borderRadius: 14,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1.5,
    borderColor: "#C8D0F0",
    borderStyle: "dashed",
    gap: 12,
  },
  pickerIcon: { fontSize: 28 },
  pickerLabel: { fontSize: 14, fontWeight: "800", color: "#1a3a5c" },
  pickerSub: { fontSize: 11, color: "#888", marginTop: 2 },
  pickerBadge: {
    backgroundColor: "#1a3f7a",
    borderRadius: 16,
    minWidth: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  pickerBadgeTxt: { color: "#fff", fontWeight: "900", fontSize: 14 },

  fileList: {
    backgroundColor: "#F8FAFF",
    borderRadius: 14,
    padding: 12,
    gap: 12,
    marginBottom: 12,
  },
  fileListHeader: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1a3a5c",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  fileItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    elevation: 1,
  },
  fileItemTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  fileItemIcon: { fontSize: 26 },
  fileItemName: { fontSize: 13, fontWeight: "700", color: "#1a3a5c" },
  fileItemSize: { fontSize: 11, color: "#999", marginTop: 2 },
  removeBtn: { padding: 4 },
  removeIcon: { fontSize: 14, color: "#E53935", fontWeight: "800" },
  titleInputWrap: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 8,
  },
  titleInputLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: "#1a3a5c",
    letterSpacing: 1,
    marginBottom: 4,
  },
  titleInput: {
    fontSize: 14,
    color: "#1a3a5c",
    borderWidth: 1.5,
    borderColor: "#E0E4F0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F8FAFF",
  },

  listContainer: { flex: 1 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 10,
    elevation: 2,
  },
  searchIcon: { fontSize: 15 },
  searchInput: { flex: 1, fontSize: 14, color: "#1a3a5c" },
  searchClear: { fontSize: 13, color: "#aaa", padding: 4 },
  filterBar: { maxHeight: 46, marginBottom: 8 },
  filterContent: { paddingHorizontal: 20, gap: 8, alignItems: "center" },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  filterTabActive: { backgroundColor: "#1a3f7a" },
  filterTabText: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(26,58,92,0.8)",
  },
  filterTabTextActive: { color: "#fff", fontWeight: "800" },
  matList: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 40 },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: "rgba(26,58,92,0.7)", fontSize: 16, fontWeight: "600" },
  matCard: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  matHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 8,
  },
  matFileIcon: { fontSize: 30 },
  matTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1a3a5c",
    lineHeight: 20,
  },
  matSubject: { fontSize: 12, color: "#666", marginTop: 2, fontWeight: "600" },
  deleteBtn: { padding: 4 },
  deleteIcon: { fontSize: 20 },
  matDesc: { fontSize: 13, color: "#555", lineHeight: 19, marginBottom: 8 },
  matMeta: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },
  matMetaTxt: { fontSize: 12, color: "#888" },
  matTypeBadge: {
    backgroundColor: "#EEF0FF",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  matTypeTxt: { fontSize: 10, fontWeight: "800", color: "#1736F5" },
});
