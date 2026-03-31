import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../components/Button";
import Input from "../components/Input";
import PopupModal from "../components/PopupModal";
import { COLORS } from "../config";
import {
  createSubject,
  deleteSubject,
  getSubjects,
  updateSubject,
} from "../services/api";

const TYPE_OPTIONS = [
  { label: "Core Major", value: "core" },
  { label: "Specialization", value: "specialization" },
];

function TabBar({ active, onChange }) {
  return (
    <View style={s.tabBar}>
      {[
        { key: "add", label: "Add Subject" },
        { key: "list", label: "Subject List" },
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

export default function AdminSubjectManagerScreen({ navigation }) {
  const [tab, setTab] = useState("add");
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("core");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("core");
  const [savingId, setSavingId] = useState(null);
  const [popup, setPopup] = useState({
    visible: false,
    title: "",
    message: "",
    type: "success",
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setFetching(true);
    try {
      const r = await getSubjects();
      setSubjects(r.data.subjects);
    } catch {
      setSubjects([]);
    }
    setFetching(false);
  };

  const handleCreate = async () => {
    if (!name.trim())
      return showPopup("Missing", "Enter a subject name.", "error");
    setLoading(true);
    try {
      await createSubject({ name, type });
      setName("");
      load();
      showPopup("Created", `"${name}" added successfully.`, "success");
      setTab("list");
    } catch (err) {
      showPopup("Error", err.response?.data?.message || "Failed.", "error");
    }
    setLoading(false);
  };

  const handleSave = async (id) => {
    if (!editName.trim())
      return showPopup("Missing", "Name cannot be empty.", "error");
    setSavingId(id);
    try {
      await updateSubject(id, { name: editName.trim(), type: editType });
      setEditingId(null);
      load();
      showPopup("Updated", "Subject updated.", "success");
    } catch (err) {
      showPopup("Error", err.response?.data?.message || "Failed.", "error");
    }
    setSavingId(null);
  };

  const handleDelete = (sub) => {
    Alert.alert(
      "Delete Subject",
      `Delete "${sub.name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSubject(sub._id);
              load();
              showPopup(
                "Deleted",
                `"${sub.name}" has been deleted.`,
                "success",
              );
            } catch (err) {
              showPopup(
                "Error",
                err.response?.data?.message || "Failed to delete.",
                "error",
              );
            }
          },
        },
      ],
    );
  };

  const showPopup = (title, message, type) =>
    setPopup({ visible: true, title, message, type });

  const core = subjects.filter((s) => s.type === "core");
  const spec = subjects.filter((s) => s.type === "specialization");

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Manage Subjects</Text>
      </View>

      <TabBar active={tab} onChange={setTab} />

      {tab === "add" ? (
        <ScrollView
          contentContainerStyle={s.body}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.card}>
            <Text style={s.cardTitle}>New Subject</Text>
            <Input
              label="Subject Name"
              placeholder="e.g. Programming 1"
              value={name}
              onChangeText={setName}
            />
            <Text style={s.typeLabel}>Type</Text>
            <View style={s.typeRow}>
              {TYPE_OPTIONS.map((o) => (
                <TouchableOpacity
                  key={o.value}
                  style={[s.typeBtn, type === o.value && s.typeBtnActive]}
                  onPress={() => setType(o.value)}
                >
                  <Text
                    style={[
                      s.typeBtnText,
                      type === o.value && s.typeBtnTextActive,
                    ]}
                  >
                    {o.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button
              title="Add Subject"
              onPress={handleCreate}
              loading={loading}
            />
          </View>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={s.body}>
          {fetching ? (
            <ActivityIndicator color={COLORS.blue} style={{ marginTop: 20 }} />
          ) : subjects.length === 0 ? (
            <Text style={s.empty}>No subjects yet.</Text>
          ) : (
            <>
              {core.length > 0 && (
                <Text style={s.sectionLabel}>Core Majors ({core.length})</Text>
              )}
              {core.map((sub) => (
                <SubjectRow
                  key={sub._id}
                  s={sub}
                  editingId={editingId}
                  editName={editName}
                  editType={editType}
                  savingId={savingId}
                  setEditingId={setEditingId}
                  setEditName={setEditName}
                  setEditType={setEditType}
                  handleSave={handleSave}
                  handleDelete={handleDelete}
                />
              ))}
              {spec.length > 0 && (
                <Text style={[s.sectionLabel, { marginTop: 14 }]}>
                  Specializations ({spec.length})
                </Text>
              )}
              {spec.map((sub) => (
                <SubjectRow
                  key={sub._id}
                  s={sub}
                  editingId={editingId}
                  editName={editName}
                  editType={editType}
                  savingId={savingId}
                  setEditingId={setEditingId}
                  setEditName={setEditName}
                  setEditType={setEditType}
                  handleSave={handleSave}
                  handleDelete={handleDelete}
                />
              ))}
            </>
          )}
        </ScrollView>
      )}

      <PopupModal
        visible={popup.visible}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup({ ...popup, visible: false })}
      />
    </View>
  );
}

function SubjectRow({
  s,
  editingId,
  editName,
  editType,
  savingId,
  setEditingId,
  setEditName,
  setEditType,
  handleSave,
  handleDelete,
}) {
  if (editingId === s._id) {
    return (
      <View style={s2.row}>
        <TextInput
          style={s2.editInput}
          value={editName}
          onChangeText={setEditName}
          autoFocus
          selectTextOnFocus
        />
        <View style={s2.typeRow}>
          {TYPE_OPTIONS.map((o) => (
            <TouchableOpacity
              key={o.value}
              style={[s2.typeBtn, editType === o.value && s2.typeBtnActive]}
              onPress={() => setEditType(o.value)}
            >
              <Text
                style={[
                  s2.typeBtnText,
                  editType === o.value && s2.typeBtnTextActive,
                ]}
              >
                {o.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={s2.editActions}>
          <TouchableOpacity
            style={s2.saveBtn}
            onPress={() => handleSave(s._id)}
            disabled={savingId === s._id}
          >
            <Text style={s2.saveBtnText}>
              {savingId === s._id ? "..." : "✓ Save"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s2.cancelBtn}
            onPress={() => setEditingId(null)}
          >
            <Text style={s2.cancelBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  return (
    <View style={s2.row}>
      <View style={s2.rowMain}>
        <View style={s2.rowLeft}>
          <Text style={s2.rowName}>{s.name}</Text>
          <Text style={s2.rowMeta}>
            Added {new Date(s.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            style={s2.editBtn}
            onPress={() => {
              setEditingId(s._id);
              setEditName(s.name);
              setEditType(s.type);
            }}
          >
            <Text style={s2.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s2.deleteBtn}
            onPress={() => handleDelete(s)}
          >
            <Text style={s2.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6FF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.blue,
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  back: { padding: 4 },
  backText: { color: "#fff", fontSize: 22, fontWeight: "700" },
  title: { color: "#fff", fontSize: 18, fontWeight: "800" },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E4FF",
  },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center" },
  tabActive: { borderBottomWidth: 3, borderBottomColor: COLORS.blue },
  tabText: { fontSize: 13, fontWeight: "600", color: "#aaa" },
  tabTextActive: { color: COLORS.blue, fontWeight: "800" },
  body: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1a3a5c",
    marginBottom: 14,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  typeRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#F0F2FF",
    alignItems: "center",
  },
  typeBtnActive: { backgroundColor: COLORS.blue },
  typeBtnText: { fontSize: 12, fontWeight: "700", color: "#888" },
  typeBtnTextActive: { color: "#fff" },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.blue,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  empty: { color: "#aaa", textAlign: "center", marginTop: 40, fontSize: 14 },
});

const s2 = StyleSheet.create({
  row: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
  },
  rowMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLeft: { flex: 1 },
  rowName: { fontSize: 14, fontWeight: "700", color: "#1a3a5c" },
  rowMeta: { fontSize: 11, color: "#aaa", marginTop: 2 },
  editBtn: {
    backgroundColor: "#EEF0FF",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  editBtnText: { color: COLORS.blue, fontWeight: "700", fontSize: 13 },
  deleteBtn: {
    backgroundColor: "#FFE5E5",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  deleteBtnText: { color: "#E53935", fontWeight: "700", fontSize: 13 },
  editInput: {
    borderWidth: 1.5,
    borderColor: COLORS.blue,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: "#1a1a1a",
    backgroundColor: "#F9FAFE",
    marginBottom: 10,
  },
  typeRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  typeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F0F2FF",
    alignItems: "center",
  },
  typeBtnActive: { backgroundColor: COLORS.blue },
  typeBtnText: { fontSize: 11, fontWeight: "700", color: "#888" },
  typeBtnTextActive: { color: "#fff" },
  editActions: { flexDirection: "row", gap: 8 },
  saveBtn: {
    flex: 1,
    backgroundColor: COLORS.blue,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "700" },
  cancelBtn: {
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
  },
  cancelBtnText: { color: "#888", fontWeight: "700" },
});
