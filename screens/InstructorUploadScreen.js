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
  TouchableOpacity,
  View
} from "react-native";
import Button from "../components/Button";
import Dropdown from "../components/Dropdown";
import {
  FileIcon,
  getFileIcon
} from "../components/Icons";
import Input from "../components/Input";
import PopupModal from "../components/PopupModal";
import {
  deleteMaterial,
  getMyMaterials,
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
const getMime = (filename, fallback) =>
  MIME_MAP[filename?.split(".").pop()?.toLowerCase()] ||
  fallback ||
  "application/octet-stream";

function TabBar({ active, onChange }) {
  return (
    <View style={s.tabBar}>
      {[
        { key: "upload", label: "📤  Upload" },
        { key: "mine", label: "📋  My Materials" },
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

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export default function InstructorUploadScreen({ navigation }) {
  const [tab, setTab] = useState("upload");
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [schoolYear, setSchoolYear] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [files, setFiles] = useState([]);
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
    if (tab === "mine") loadMine();
  }, [tab]);

  const loadMine = async () => {
    setLoadingMats(true);
    try {
      const r = await getMyMaterials();
      setMaterials(r.data.materials);
    } catch {
      setMaterials([]);
    }
    setLoadingMats(false);
  };

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: true,
      });
      if (res.canceled || !res.assets?.length) return;
      const newFiles = res.assets.map((a) => ({
        ...a,
        title: title.trim() || a.name.replace(/\.[^/.]+$/, ""),
      }));
      setFiles((prev) =>
        [...prev, ...newFiles].filter(
          (f, i, arr) => arr.findIndex((x) => x.name === f.name) === i,
        ),
      );
    } catch {
      Alert.alert("Error", "Could not pick file.");
    }
  };
  const removeFile = (i) =>
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  const updateTitle = (i, v) =>
    setFiles((prev) =>
      prev.map((f, idx) => (idx === i ? { ...f, title: v } : f)),
    );

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
    if (!files.length)
      return setPopup({
        visible: true,
        title: "Missing",
        message: "Please select at least one file.",
        type: "error",
      });
    const emptyIdx = files.findIndex((f) => !f.title.trim());
    if (emptyIdx !== -1)
      return setPopup({
        visible: true,
        title: "Missing",
        message: `Please enter a title for file ${emptyIdx + 1}.`,
        type: "error",
      });

    const form = new FormData();
    form.append("subjectId", subjectId);
    form.append("schoolYear", schoolYear.trim());
    form.append("description", desc.trim());
    form.append("title", title.trim());
    files.forEach((f) =>
      form.append("files", {
        uri: f.uri,
        name: f.name,
        type: getMime(f.name, f.mimeType),
      }),
    );

    setUploading(true);
    try {
      await uploadMaterial(form);
      setPopup({
        visible: true,
        title: "Uploaded!",
        message: `${files.length} file(s) uploaded successfully.`,
        type: "success",
      });
      setSubjectId("");
      setSchoolYear("");
      setTitle("");
      setDesc("");
      setFiles([]);
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
            loadMine();
          } catch {
            Alert.alert("Error", "Could not delete.");
          }
          setDeleting(null);
        },
      },
    ]);
  };

  const subjectOptions = [{ label: "All Subjects", value: "" }, ...subjects];
  const filtered = filterSub
    ? materials.filter(
        (m) => m.subjectId?._id === filterSub || m.subjectId === filterSub,
      )
    : materials;

  return (
    <LinearGradient
      colors={["#4DD9C0", "#4D8FD9", "#D98F7A"]}
      style={s.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="dark-content" />
      <View style={s.topBar}>
        <Text style={s.screenTitle}>Learning Materials</Text>
        <Text style={s.screenSub}>Upload & manage your materials</Text>
      </View>

      <TabBar active={tab} onChange={setTab} />

      {tab === "upload" ? (
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
              placeholder="Material title"
              value={title}
              onChangeText={setTitle}
            />
            <Input
              label="Description"
              placeholder="Brief description (optional)"
              value={desc}
              onChangeText={setDesc}
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity style={s.filePicker} onPress={pickFile}>
              <FileIcon size={28} color="#1a3a5c" />
              <View style={{ flex: 1 }}>
                <Text style={s.filePickerLabel}>Add Files</Text>
                <Text style={s.filePickerName}>
                  PDF, DOCX, PPT, MP4, images...
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: "#1a3f7a",
                  borderRadius: 14,
                  minWidth: 28,
                  height: 28,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 6,
                }}
              >
                <Text
                  style={{ color: "#fff", fontWeight: "900", fontSize: 13 }}
                >
                  {files.length || "+"}
                </Text>
              </View>
            </TouchableOpacity>
            {files.length > 0 && (
              <View
                style={{
                  backgroundColor: "#F8FAFF",
                  borderRadius: 12,
                  padding: 10,
                  marginBottom: 8,
                  gap: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "800",
                    color: "#1a3a5c",
                    letterSpacing: 0.5,
                  }}
                >
                  {files.length} FILE{files.length !== 1 ? "S" : ""} SELECTED
                </Text>
                {files.map((f, i) => (
                  <View
                    key={i}
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 10,
                      padding: 10,
                      elevation: 1,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      {getFileIcon(f.name?.split(".").pop()?.toLowerCase(), 22)}
                      <Text
                        style={{
                          flex: 1,
                          fontSize: 12,
                          fontWeight: "700",
                          color: "#1a3a5c",
                        }}
                        numberOfLines={1}
                      >
                        {f.name}
                      </Text>
                      <TouchableOpacity onPress={() => removeFile(i)}>
                        <Text
                          style={{
                            color: "#E53935",
                            fontWeight: "800",
                            fontSize: 13,
                          }}
                        >
                          ✕
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
            <Button
              title={uploading ? "Uploading..." : "Upload Material"}
              onPress={handleUpload}
              loading={uploading}
            />
          </View>
        </ScrollView>
      ) : (
        <View style={s.listContainer}>
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
              {filtered.length === 0 ? (
                <View style={s.empty}>
                  <Text style={s.emptyIcon}>📭</Text>
                  <Text style={s.emptyText}>No materials uploaded yet</Text>
                </View>
              ) : (
                filtered.map((item) => (
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
                      <Text style={s.matMetaText}>📅 {item.schoolYear}</Text>
                      <Text style={s.matMetaText}>
                        🗓 {formatDate(item.createdAt)}
                      </Text>
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
          if (popup.type === "success" && tab === "upload") setTab("mine");
        }}
      />
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  topBar: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12 },
  screenTitle: { fontSize: 24, fontWeight: "900", color: "#1a3a5c" },
  screenSub: { fontSize: 13, color: "rgba(26,58,92,0.7)", marginTop: 2 },
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
  filePicker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F6FF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1.5,
    borderColor: "#dde2f0",
    borderStyle: "dashed",
  },
  filePickerIcon: { fontSize: 28 },
  filePickerLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666",
    marginBottom: 2,
  },
  filePickerName: { fontSize: 13, fontWeight: "600", color: "#1a3a5c" },
  filePickerArrow: { fontSize: 20, color: "#aaa" },
  listContainer: { flex: 1 },
  filterBar: { maxHeight: 50, marginBottom: 4 },
  filterContent: { paddingHorizontal: 20, gap: 8, alignItems: "center" },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  filterTabActive: { backgroundColor: "#fff" },
  filterTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(26,58,92,0.7)",
  },
  filterTabTextActive: { color: "#1a3a5c", fontWeight: "800" },
  matList: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
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
  matFileIcon: { fontSize: 32 },
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
  matMeta: { flexDirection: "row", gap: 16, flexWrap: "wrap" },
  matMetaText: { fontSize: 12, color: "#888", fontWeight: "500" },
});
