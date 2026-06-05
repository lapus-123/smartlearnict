import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../components/Button";
import Dropdown from "../components/Dropdown";
import Input from "../components/Input";
import PopupModal from "../components/PopupModal";
import { COLORS } from "../config";
import {
  createSection,
  deleteSection,
  getColleges,
  getSections,
} from "../services/api";

function TabBar({ active, onChange }) {
  return (
    <View style={s.tabBar}>
      {[
        { key: "add", label: "Add Section" },
        { key: "list", label: "Section List" },
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

export default function SectionManagerScreen({ navigation }) {
  const [tab, setTab] = useState("add");
  const [departments, setDepartments] = useState([]);
  const [allPrograms, setAllPrograms] = useState([]);
  const [name, setName] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [filterDepartmentId, setFilterDepartmentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [popup, setPopup] = useState({
    visible: false,
    title: "",
    message: "",
    type: "success",
  });

  const show = (title, message, type) =>
    setPopup({ visible: true, title, message, type });

  const loadPrograms = async () => {
    setFetching(true);
    try {
      const res = await getColleges();
      const departmentsList = res.data.colleges || [];
      setDepartments(
        departmentsList.map((item) => ({ label: item.name, value: item._id })),
      );

      const programGroups = await Promise.all(
        departmentsList.map((department) =>
          getSections(department._id).then((sectionRes) =>
            (sectionRes.data.sections || []).map((program) => ({
              ...program,
              departmentName: department.name,
              departmentId: department._id,
            })),
          ),
        ),
      );
      setAllPrograms(programGroups.flat());
    } catch {
      setAllPrograms([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  const handleCreate = async () => {
    const cleanName = name.trim();
    if (!cleanName || !selectedDepartmentId) {
      return show(
        "Missing",
        "Select a department and enter a section name.",
        "error",
      );
    }

    setLoading(true);
    try {
      await createSection({ name: cleanName, collegeId: selectedDepartmentId });
      setName("");
      show("Created", `"${cleanName}" added.`, "success");
      await loadPrograms();
      setTab("list");
    } catch (err) {
      show("Error", err.response?.data?.message || "Failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, programName) => {
    try {
      await deleteSection(id);
      show("Deleted", `"${programName}" removed.`, "success");
      await loadPrograms();
    } catch {
      show("Error", "Failed to delete.", "error");
    }
  };

  const departmentFilterOptions = [
    { label: "All Departments", value: "" },
    ...departments,
  ];
  const filtered = filterDepartmentId
    ? allPrograms.filter((program) => program.departmentId === filterDepartmentId)
    : allPrograms;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <Text style={s.backText}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={s.title}>Manage Section</Text>
      </View>

      <TabBar active={tab} onChange={setTab} />

      {tab === "add" ? (
        <ScrollView
          contentContainerStyle={s.body}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.card}>
            <Text style={s.cardTitle}>New Section</Text>
            <Text style={s.cardSub}>
              Assign sections to the correct department.
            </Text>
            <Dropdown
              label="Department"
              placeholder="Choose a department"
              options={departments}
              value={selectedDepartmentId}
              onChange={setSelectedDepartmentId}
            />
            <Input
              label="Section Name"
              placeholder="e.g. BSIT 1A"
              value={name}
              onChangeText={setName}
              autoCapitalize="characters"
            />
            <Button
              title="Add Section"
              onPress={handleCreate}
              loading={loading}
            />
          </View>
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={s.filterWrap}>
            <Dropdown
              label="Department Filter"
              placeholder="All Departments"
              options={departmentFilterOptions}
              value={filterDepartmentId}
              onChange={setFilterDepartmentId}
            />
          </View>

          {fetching ? (
            <ActivityIndicator color={COLORS.blue} style={{ marginTop: 20 }} />
          ) : (
            <ScrollView contentContainerStyle={s.body}>
              <Text style={s.countLabel}>
                {filtered.length} section{filtered.length !== 1 ? "s" : ""}
              </Text>
              {filtered.length === 0 ? (
                <Text style={s.empty}>No sections found.</Text>
              ) : (
                filtered.map((program) => (
                  <View key={program._id} style={s.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.rowName}>{program.name}</Text>
                      <Text style={s.rowMeta}>{program.departmentName}</Text>
                      <Text style={s.statusText}>Active</Text>
                    </View>
                    <TouchableOpacity
                      style={s.deleteBtn}
                      onPress={() => handleDelete(program._id, program.name)}
                    >
                      <Text style={s.deleteBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          )}
        </View>
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
    backgroundColor: "#5B2FBE",
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
  title: { color: "#fff", fontSize: 17, fontWeight: "800", flex: 1 },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E4FF",
  },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center" },
  tabActive: { borderBottomWidth: 3, borderBottomColor: "#5B2FBE" },
  tabText: { fontSize: 13, fontWeight: "600", color: "#8E99AA" },
  tabTextActive: { color: "#5B2FBE", fontWeight: "800" },
  body: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 18,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1a3a5c",
    marginBottom: 4,
  },
  cardSub: { fontSize: 12, color: "#6B7280", marginBottom: 16 },
  filterWrap: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E4FF",
  },
  countLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6B7280",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  row: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    elevation: 1,
    gap: 10,
  },
  rowName: { fontSize: 14, fontWeight: "800", color: "#1a3a5c" },
  rowMeta: { fontSize: 12, color: "#6B7280", marginTop: 3 },
  statusText: {
    alignSelf: "flex-start",
    marginTop: 8,
    borderRadius: 999,
    backgroundColor: "#E5F8EF",
    color: "#1F7A4D",
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: "900",
  },
  deleteBtn: {
    backgroundColor: "#FFE5E5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deleteBtnText: { color: "#E53935", fontWeight: "800", fontSize: 13 },
  empty: { color: "#8E99AA", textAlign: "center", marginTop: 30, fontSize: 14 },
});
