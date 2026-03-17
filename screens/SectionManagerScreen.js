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
        { key: "add", label: "➕  Add Course" },
        { key: "list", label: "📋  Course List" },
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

export default function SectionManagerScreen({ navigation }) {
  const [tab, setTab] = useState("add");
  const [colleges, setColleges] = useState([]);
  const [allCourses, setAllCourses] = useState([]); // for list tab (all colleges)
  const [name, setName] = useState("");
  const [selectedCollegeId, setSelectedCollegeId] = useState("");
  const [filterCollegeId, setFilterCollegeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [popup, setPopup] = useState({
    visible: false,
    title: "",
    message: "",
    type: "success",
  });

  useEffect(() => {
    getColleges()
      .then((r) => {
        const cols = r.data.colleges;
        setColleges(cols.map((c) => ({ label: c.name, value: c._id })));
        // Load all courses from all colleges for list tab
        Promise.all(
          cols.map((c) =>
            getSections(c._id).then((res) =>
              res.data.sections.map((sec) => ({
                ...sec,
                collegeName: c.name,
                collegeId: c._id,
              })),
            ),
          ),
        )
          .then((all) => setAllCourses(all.flat()))
          .catch(() => {});
      })
      .catch(() => {});
  }, []);

  const reloadAllCourses = () => {
    setFetching(true);
    getColleges()
      .then((r) => {
        Promise.all(
          r.data.colleges.map((c) =>
            getSections(c._id).then((res) =>
              res.data.sections.map((sec) => ({
                ...sec,
                collegeName: c.name,
                collegeId: c._id,
              })),
            ),
          ),
        )
          .then((all) => {
            setAllCourses(all.flat());
            setFetching(false);
          })
          .catch(() => setFetching(false));
      })
      .catch(() => setFetching(false));
  };

  const handleCreate = async () => {
    if (!name.trim() || !selectedCollegeId)
      return show(
        "Missing",
        "Select a college and enter a course name.",
        "error",
      );
    setLoading(true);
    try {
      await createSection({ name, collegeId: selectedCollegeId });
      setName("");
      show("Created", `"${name}" added.`, "success");
      reloadAllCourses();
      setTab("list");
    } catch (err) {
      show("Error", err.response?.data?.message || "Failed.", "error");
    }
    setLoading(false);
  };

  const handleDelete = async (id, courseName) => {
    try {
      await deleteSection(id);
      show("Deleted", `"${courseName}" removed.`, "success");
      reloadAllCourses();
    } catch {
      show("Error", "Failed to delete.", "error");
    }
  };

  const show = (title, message, type) =>
    setPopup({ visible: true, title, message, type });

  const allCollegeOptions = [{ label: "All Colleges", value: "" }, ...colleges];
  const filtered = filterCollegeId
    ? allCourses.filter((c) => c.collegeId === filterCollegeId)
    : allCourses;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Manage Courses</Text>
      </View>

      <TabBar active={tab} onChange={setTab} />

      {tab === "add" ? (
        <ScrollView
          contentContainerStyle={s.body}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.card}>
            <Text style={s.cardTitle}>New Course</Text>
            <Text style={s.cardSub}>
              Create course programs under each college (e.g. BSIT, BSCS)
            </Text>
            <Dropdown
              label="Select College"
              placeholder="Choose a college"
              options={colleges}
              value={selectedCollegeId}
              onChange={setSelectedCollegeId}
            />
            <Input
              label="Course Name"
              placeholder="e.g. BSIT"
              value={name}
              onChangeText={setName}
              autoCapitalize="characters"
            />
            <Button
              title="Add Course"
              onPress={handleCreate}
              loading={loading}
            />
          </View>
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          {/* College filter — tab bar style */}
          <View style={s.filterTabBar}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.filterTabContent}
            >
              {allCollegeOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    s.filterTab,
                    filterCollegeId === opt.value && s.filterTabActive,
                  ]}
                  onPress={() => setFilterCollegeId(opt.value)}
                >
                  <Text
                    style={[
                      s.filterTabText,
                      filterCollegeId === opt.value && s.filterTabTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {fetching ? (
            <ActivityIndicator color={COLORS.blue} style={{ marginTop: 20 }} />
          ) : (
            <ScrollView contentContainerStyle={s.body}>
              <Text style={s.countLabel}>
                {filtered.length} course{filtered.length !== 1 ? "s" : ""}
              </Text>
              {filtered.length === 0 ? (
                <Text style={s.empty}>No courses found.</Text>
              ) : (
                filtered.map((c) => (
                  <View key={c._id} style={s.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.rowName}>{c.name}</Text>
                      <Text style={s.rowMeta}>🏫 {c.collegeName}</Text>
                    </View>
                    <TouchableOpacity
                      style={s.deleteBtn}
                      onPress={() => handleDelete(c._id, c.name)}
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
    backgroundColor: "#7B2FBE",
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
  tabActive: { borderBottomWidth: 3, borderBottomColor: "#7B2FBE" },
  tabText: { fontSize: 13, fontWeight: "600", color: "#aaa" },
  tabTextActive: { color: "#7B2FBE", fontWeight: "800" },
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
    marginBottom: 4,
  },
  cardSub: { fontSize: 12, color: "#aaa", marginBottom: 16 },
  filterTabBar: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E4FF",
  },
  filterTabContent: { paddingHorizontal: 4 },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  filterTabActive: { borderBottomColor: "#7B2FBE" },
  filterTabText: { fontSize: 13, fontWeight: "600", color: "#aaa" },
  filterTabTextActive: { color: "#7B2FBE", fontWeight: "800" },
  countLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#aaa",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  row: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    elevation: 1,
    gap: 10,
  },
  rowName: { fontSize: 14, fontWeight: "700", color: "#1a3a5c" },
  rowMeta: { fontSize: 12, color: "#aaa", marginTop: 2 },
  deleteBtn: {
    backgroundColor: "#FFE5E5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteBtnText: { color: "#E53935", fontWeight: "700", fontSize: 13 },
  empty: { color: "#aaa", textAlign: "center", marginTop: 30, fontSize: 14 },
});
