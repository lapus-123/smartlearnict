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
  createCollege,
  deleteCollege,
  getColleges,
  updateCollege,
} from "../services/api";

function TabBar({ active, onChange }) {
  return (
    <View style={s.tabBar}>
      {[
        { key: "add", label: "Add Department" },
        { key: "list", label: "Department List" },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[s.tab, active === tab.key && s.tabActive]}
          onPress={() => onChange(tab.key)}
        >
          <Text style={[s.tabText, active === tab.key && s.tabTextActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function CollegeManagerScreen({ navigation }) {
  const [tab, setTab] = useState("add");
  const [departments, setDepartments] = useState([]);
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

  const show = (title, message, type) =>
    setPopup({ visible: true, title, message, type });

  const load = async () => {
    setFetching(true);
    try {
      const res = await getColleges();
      setDepartments(res.data.colleges || []);
    } catch {
      setDepartments([]);
    } finally {
      setFetching(false);
    }
  };

  const handleCreate = async () => {
    const cleanName = name.trim();
    if (!cleanName) {
      return show("Missing", "Enter a department name.", "error");
    }

    setLoading(true);
    try {
      await createCollege({ name: cleanName });
      setName("");
      await load();
      show("Created", `"${cleanName}" added successfully.`, "success");
      setTab("list");
    } catch (err) {
      show("Error", err.response?.data?.message || "Failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (id) => {
    const cleanName = editName.trim();
    if (!cleanName) return show("Missing", "Name cannot be empty.", "error");

    setSavingId(id);
    try {
      await updateCollege(id, { name: cleanName });
      setEditingId(null);
      await load();
      show("Updated", "Department renamed.", "success");
    } catch (err) {
      show("Error", err.response?.data?.message || "Failed.", "error");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = (department) => {
    Alert.alert(
      "Delete Department",
      `Delete "${department.name}"?\n\nThis will also delete all linked courses.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCollege(department._id);
              await load();
              show("Deleted", `"${department.name}" deleted.`, "success");
            } catch (err) {
              show(
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

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <Text style={s.backText}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={s.title}>Manage Departments</Text>
      </View>

      <TabBar active={tab} onChange={setTab} />

      {tab === "add" ? (
        <ScrollView
          contentContainerStyle={s.body}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.card}>
            <Text style={s.cardTitle}>New Department</Text>
            <Input
              label="Department Name"
              placeholder="e.g. Information Technology Department"
              value={name}
              onChangeText={setName}
            />
            <Button
              title="Add Department"
              onPress={handleCreate}
              loading={loading}
            />
          </View>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={s.body}>
          {fetching ? (
            <ActivityIndicator color={COLORS.blue} style={{ marginTop: 20 }} />
          ) : departments.length === 0 ? (
            <Text style={s.empty}>No departments yet.</Text>
          ) : (
            departments.map((department) => (
              <View key={department._id} style={s.row}>
                {editingId === department._id ? (
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
                      onPress={() => handleSave(department._id)}
                      disabled={savingId === department._id}
                    >
                      <Text style={s.saveBtnText}>
                        {savingId === department._id ? "..." : "Save"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={s.cancelBtn}
                      onPress={() => setEditingId(null)}
                    >
                      <Text style={s.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={s.viewRow}>
                    <Text style={s.rowText}>{department.name}</Text>
                    <View style={s.rowActions}>
                      <TouchableOpacity
                        style={s.editBtn}
                        onPress={() => {
                          setEditingId(department._id);
                          setEditName(department.name);
                        }}
                      >
                        <Text style={s.editBtnText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={s.deleteBtn}
                        onPress={() => handleDelete(department)}
                      >
                        <Text style={s.deleteBtnText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
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
  back: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { color: "#fff", fontSize: 22, fontWeight: "900" },
  title: { color: "#fff", fontSize: 18, fontWeight: "800" },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E4FF",
  },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center" },
  tabActive: { borderBottomWidth: 3, borderBottomColor: COLORS.blue },
  tabText: { fontSize: 13, fontWeight: "600", color: "#8E99AA" },
  tabTextActive: { color: COLORS.blue, fontWeight: "800" },
  body: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
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
  row: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
  },
  viewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  rowText: { fontSize: 14, fontWeight: "700", color: "#1a3a5c", flex: 1 },
  rowActions: { flexDirection: "row", gap: 8 },
  editBtn: {
    backgroundColor: "#EEF0FF",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  editBtnText: { color: COLORS.blue, fontWeight: "800", fontSize: 13 },
  deleteBtn: {
    backgroundColor: "#FFE5E5",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  deleteBtnText: { color: "#E53935", fontWeight: "800", fontSize: 13 },
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
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  saveBtnText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  cancelBtn: {
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cancelBtnText: { color: "#6B7280", fontWeight: "800", fontSize: 13 },
  empty: { color: "#8E99AA", textAlign: "center", marginTop: 40, fontSize: 14 },
});
