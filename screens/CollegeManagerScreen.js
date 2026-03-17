import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { createCollege, getColleges, updateCollege } from "../services/api";

function TabBar({ active, onChange }) {
  return (
    <View style={s.tabBar}>
      {[
        { key: "add", label: "➕  Add College" },
        { key: "list", label: "📋  College List" },
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

export default function CollegeManagerScreen({ navigation }) {
  const [tab, setTab] = useState("add");
  const [colleges, setColleges] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
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
      const r = await getColleges();
      setColleges(r.data.colleges);
    } catch {
      setColleges([]);
    }
    setFetching(false);
  };

  const handleCreate = async () => {
    if (!name.trim()) return show("Missing", "Enter a college name.", "error");
    setLoading(true);
    try {
      await createCollege({ name });
      setName("");
      load();
      show("Created", `"${name}" added successfully.`, "success");
      setTab("list");
    } catch (err) {
      show("Error", err.response?.data?.message || "Failed.", "error");
    }
    setLoading(false);
  };

  const handleSave = async (id) => {
    if (!editName.trim())
      return show("Missing", "Name cannot be empty.", "error");
    setSavingId(id);
    try {
      await updateCollege(id, { name: editName.trim() });
      setEditingId(null);
      load();
      show("Updated", "College renamed.", "success");
    } catch (err) {
      show("Error", err.response?.data?.message || "Failed.", "error");
    }
    setSavingId(null);
  };

  const show = (title, message, type) =>
    setPopup({ visible: true, title, message, type });

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Manage Colleges</Text>
      </View>

      <TabBar active={tab} onChange={setTab} />

      {tab === "add" ? (
        <ScrollView
          contentContainerStyle={s.body}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.card}>
            <Text style={s.cardTitle}>New College</Text>
            <Input
              label="College Name"
              placeholder="e.g. College of Computing Informatics"
              value={name}
              onChangeText={setName}
            />
            <Button
              title="Add College"
              onPress={handleCreate}
              loading={loading}
            />
          </View>
          <View style={s.notice}>
            <Text style={s.noticeText}>
              ℹ️ Colleges cannot be deleted to preserve data integrity. You can
              rename them.
            </Text>
          </View>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={s.body}>
          {fetching ? (
            <ActivityIndicator color={COLORS.blue} style={{ marginTop: 20 }} />
          ) : colleges.length === 0 ? (
            <Text style={s.empty}>No colleges yet.</Text>
          ) : (
            colleges.map((c) => (
              <View key={c._id} style={s.row}>
                {editingId === c._id ? (
                  <View style={s.editRow}>
                    <TextInput
                      style={s.editInput}
                      value={editName}
                      onChangeText={setEditName}
                      autoFocus
                      selectTextOnFocus
                    />
                    <TouchableOpacity
                      style={s.saveBtn}
                      onPress={() => handleSave(c._id)}
                      disabled={savingId === c._id}
                    >
                      <Text style={s.saveBtnText}>
                        {savingId === c._id ? "..." : "✓"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={s.cancelBtn}
                      onPress={() => setEditingId(null)}
                    >
                      <Text style={s.cancelBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={s.viewRow}>
                    <Text style={s.rowText}>🏫 {c.name}</Text>
                    <TouchableOpacity
                      style={s.editBtn}
                      onPress={() => {
                        setEditingId(c._id);
                        setEditName(c.name);
                      }}
                    >
                      <Text style={s.editBtnText}>Rename</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
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
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1a3a5c",
    marginBottom: 14,
  },
  notice: { backgroundColor: "#EEF0FF", borderRadius: 10, padding: 12 },
  noticeText: { fontSize: 12, color: COLORS.blue, lineHeight: 18 },
  row: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
  },
  viewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowText: { fontSize: 14, fontWeight: "600", color: "#1a3a5c", flex: 1 },
  editBtn: {
    backgroundColor: "#EEF0FF",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  editBtnText: { color: COLORS.blue, fontWeight: "700", fontSize: 13 },
  editRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  editInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.blue,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: "#1a1a1a",
    backgroundColor: "#F9FAFE",
  },
  saveBtn: {
    backgroundColor: COLORS.blue,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  cancelBtn: {
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cancelBtnText: { color: "#888", fontWeight: "700", fontSize: 13 },
  empty: { color: "#aaa", textAlign: "center", marginTop: 40, fontSize: 14 },
});
