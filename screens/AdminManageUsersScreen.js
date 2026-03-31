import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../components/Button";
import Dropdown from "../components/Dropdown";
import { DeleteIcon, EditIcon, SearchIcon } from "../components/Icons";
import Input from "../components/Input";
import PopupModal from "../components/PopupModal";
import { COLORS } from "../config";
import {
  deleteUser,
  getAdminInstructors,
  getAdminStudents,
  getColleges,
  getSections,
} from "../services/api";

export default function AdminManageUsersScreen({ navigation }) {
  const [tab, setTab] = useState("instructor");
  const [colleges, setColleges] = useState([]);
  const [courses, setCourses] = useState([]);
  const [collegeId, setCollegeId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [schoolYear, setSchoolYear] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [nameSearch, setNameSearch] = useState("");
  const [popup, setPopup] = useState({
    visible: false,
    title: "",
    message: "",
    type: "success",
  });
  const listRef = useRef(null);

  useEffect(() => {
    getColleges()
      .then((r) =>
        setColleges(
          r.data.colleges.map((c) => ({ label: c.name, value: c._id })),
        ),
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    setCollegeId("");
    setCourseId("");
    setUsers([]);
    setSearched(false);
  }, [tab]);

  useEffect(() => {
    if (!collegeId) {
      setCourses([]);
      setCourseId("");
      return;
    }
    getSections(collegeId)
      .then((r) =>
        setCourses(
          r.data.sections.map((s) => ({ label: s.name, value: s._id })),
        ),
      )
      .catch(() => setCourses([]));
    setCourseId("");
  }, [collegeId]);

  const handleSearch = async () => {
    Keyboard.dismiss();
    if (!collegeId)
      return setPopup({
        visible: true,
        title: "Missing",
        message: "Please select a College.",
        type: "error",
      });
    if (tab === "student" && !courseId)
      return setPopup({
        visible: true,
        title: "Missing",
        message: "Please select a Course.",
        type: "error",
      });

    setLoading(true);
    setUsers([]);
    try {
      let res;
      if (tab === "instructor") {
        res = await getAdminInstructors({ collegeId });
        setUsers(res.data.instructors);
        if (!res.data.instructors?.length)
          setPopup({
            visible: true,
            title: "No Results",
            message: "No instructors found for that college.",
            type: "error",
          });
      } else {
        res = await getAdminStudents({ collegeId, courseId, schoolYear });
        setUsers(res.data.students);
        if (!res.data.students?.length)
          setPopup({
            visible: true,
            title: "No Results",
            message: "No students found for those filters.",
            type: "error",
          });
      }
      setSearched(true);
      setTimeout(
        () => listRef.current?.scrollToOffset({ offset: 0, animated: true }),
        100,
      );
    } catch {
      setPopup({
        visible: true,
        title: "Error",
        message: "Search failed. Please check your connection.",
        type: "error",
      });
    }
    setLoading(false);
  };

  const handleDelete = (user) => {
    Alert.alert(
      "Delete User",
      `Permanently delete "${user.fullName}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await deleteUser(user._id);
              setUsers((prev) => prev.filter((u) => u._id !== user._id));
              setPopup({
                visible: true,
                title: "Deleted",
                message: res.data.message,
                type: "success",
              });
            } catch {
              setPopup({
                visible: true,
                title: "Error",
                message: "Failed to delete user.",
                type: "error",
              });
            }
          },
        },
      ],
    );
  };

  const displayUsers = nameSearch.trim()
    ? users.filter((u) => {
        const q = nameSearch.trim().toLowerCase();
        return (
          u.fullName?.toLowerCase().includes(q) ||
          u.username?.toLowerCase().includes(q) ||
          u.studentId?.toLowerCase().includes(q) ||
          u.instructorId?.toLowerCase().includes(q)
        );
      })
    : users;

  const FilterHeader = () => (
    <View style={s.filterWrap}>
      {/* Header */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Manage Users</Text>
          <Text style={s.subtitle}>Search, edit or delete accounts</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={s.tabRow}>
        {["instructor", "student"].map((t) => (
          <TouchableOpacity
            key={t}
            style={[s.tab, tab === t && s.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>
              {t === "instructor" ? "📚 Instructors" : "🎓 Students"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filters */}
      <View style={s.filterCard}>
        <Dropdown
          label="College"
          placeholder="Select College"
          options={colleges}
          value={collegeId}
          onChange={setCollegeId}
        />
        {tab === "student" && (
          <>
            <Dropdown
              label="Course"
              placeholder={
                !collegeId ? "Select a college first" : "Select Course"
              }
              options={courses}
              value={courseId}
              onChange={setCourseId}
              disabled={!collegeId}
            />
            <Input
              label="School Year"
              placeholder="e.g. 2024-2025 (optional)"
              value={schoolYear}
              onChangeText={setSchoolYear}
            />
          </>
        )}
        <Button
          title={loading ? "Searching..." : "Search"}
          onPress={handleSearch}
          loading={loading}
        />
      </View>

      {searched && !loading && (
        <View style={s.resultsHeader}>
          <Text style={s.resultsCount}>
            {displayUsers.length} of {users.length}{" "}
            {tab === "instructor" ? "instructor" : "student"}
            {users.length !== 1 ? "s" : ""}
          </Text>
        </View>
      )}

      {searched && !loading && users.length > 0 && (
        <View style={s.searchBar}>
          <SearchIcon size={15} color="#aaa" />
          <TextInput
            style={s.searchInput}
            placeholder="Search by name, username or ID..."
            placeholderTextColor="#aaa"
            value={nameSearch}
            onChangeText={setNameSearch}
            returnKeyType="search"
          />
          {nameSearch.length > 0 && (
            <TouchableOpacity onPress={() => setNameSearch("")}>
              <Text style={s.searchClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  const renderUser = ({ item: u, index }) => (
    <View style={[s.userCard, index === 0 && { marginTop: 4 }]}>
      {/* Avatar + name */}
      <View style={s.userTop}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>
            {u.fullName?.charAt(0)?.toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.userName}>{u.fullName}</Text>
          <Text style={s.userRole}>
            {u.role === "student" ? "🎓 Student" : "📚 Instructor"}
          </Text>
        </View>
        {u.status === "pending" && (
          <View style={s.pendingChip}>
            <Text style={s.pendingChipText}>Pending</Text>
          </View>
        )}
      </View>

      {/* Details */}
      <View style={s.detailsBox}>
        <DetailRow icon="👤" label="Username" value={u.username} />
        {u.role === "student" && (
          <>
            <DetailRow icon="🎓" label="Student ID" value={u.studentId} />
            <DetailRow icon="📋" label="Course" value={u.courseId?.name} />
            <DetailRow icon="🏷" label="Section" value={u.section} />
          </>
        )}
        {u.role === "instructor" && (
          <DetailRow icon="🪪" label="Instructor ID" value={u.instructorId} />
        )}
        <DetailRow icon="🏫" label="College" value={u.collegeId?.name} />
        <DetailRow icon="📅" label="School Year" value={u.schoolYear} />
      </View>

      {/* Actions */}
      <View style={s.actions}>
        <TouchableOpacity
          style={s.editBtn}
          onPress={() => navigation.navigate("AdminEditUser", { user: u })}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <EditIcon size={16} color="#1736F5" />
            <Text style={s.editTxt}>Edit</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={s.deleteBtn} onPress={() => handleDelete(u)}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <DeleteIcon size={16} color="#E53935" />
            <Text style={s.deleteTxt}>Delete</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={["#4DD9C0", "#4D8FD9", "#D98F7A"]}
      style={s.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <FlatList
        ref={listRef}
        data={loading ? [] : displayUsers}
        keyExtractor={(u) => u._id}
        renderItem={renderUser}
        ListHeaderComponent={<FilterHeader />}
        ListEmptyComponent={
          !loading && searched ? (
            <View style={s.empty}>
              <Text style={s.emptyIcon}>{nameSearch ? "🔍" : "📭"}</Text>
              <Text style={s.emptyText}>
                {nameSearch
                  ? 'No match for "' + nameSearch + '"'
                  : "No users found"}
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading ? (
            <ActivityIndicator
              color="#fff"
              size="large"
              style={{ marginTop: 20 }}
            />
          ) : (
            <View style={{ height: 40 }} />
          )
        }
        contentContainerStyle={s.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />

      <PopupModal
        visible={popup.visible}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup({ ...popup, visible: false })}
      />
    </LinearGradient>
  );
}

const DetailRow = ({ icon, label, value }) =>
  value ? (
    <View style={s.detailRow}>
      <Text style={s.detailIcon}>{icon}</Text>
      <Text style={s.detailLabel}>{label}</Text>
      <Text style={s.detailValue}>{value}</Text>
    </View>
  ) : null;

const s = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: 40 },
  filterWrap: { paddingHorizontal: 20, paddingTop: 56 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
  },
  back: { padding: 4 },
  backText: { fontSize: 22, fontWeight: "700", color: "#1a3a5c" },
  title: { fontSize: 22, fontWeight: "900", color: "#1a3a5c" },
  subtitle: { fontSize: 12, color: "rgba(26,58,92,0.7)", marginTop: 2 },
  tabRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
  },
  tabActive: { backgroundColor: "#1a3f7a" },
  tabText: { fontWeight: "700", color: "rgba(26,58,92,0.7)", fontSize: 13 },
  tabTextActive: { color: "#fff" },
  filterCard: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 18,
    padding: 18,
    elevation: 3,
    marginBottom: 16,
  },
  resultsHeader: { marginBottom: 8 },
  resultsCount: { fontSize: 13, fontWeight: "700", color: "#1a3a5c" },

  // User card
  userCard: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    elevation: 3,
  },
  userTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#1a3f7a",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "900" },
  userName: { fontSize: 16, fontWeight: "800", color: "#1a3a5c" },
  userRole: { fontSize: 12, color: "#666", marginTop: 2 },
  pendingChip: {
    backgroundColor: "#FFF3CD",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pendingChipText: { fontSize: 10, fontWeight: "800", color: "#E07B00" },
  detailsBox: {
    backgroundColor: "#F4F6FF",
    borderRadius: 12,
    padding: 12,
    gap: 6,
    marginBottom: 14,
  },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  detailIcon: { fontSize: 13, width: 20 },
  detailLabel: { fontSize: 12, color: "#888", width: 90 },
  detailValue: { fontSize: 12, fontWeight: "700", color: "#1a3a5c", flex: 1 },
  actions: { flexDirection: "row", gap: 10 },
  editBtn: {
    flex: 1,
    backgroundColor: "#EEF0FF",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  editTxt: { color: COLORS.blue, fontWeight: "800", fontSize: 13 },
  deleteBtn: {
    flex: 1,
    backgroundColor: "#FFE5E5",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  deleteTxt: { color: "#E53935", fontWeight: "800", fontSize: 13 },
  empty: { alignItems: "center", paddingTop: 40 },
  emptyIcon: { fontSize: 44, marginBottom: 10 },
  emptyText: { color: "#1a3a5c", fontSize: 15, fontWeight: "700" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    gap: 8,
    marginBottom: 12,
    elevation: 2,
  },
  searchIcon: { fontSize: 15 },
  searchInput: { flex: 1, fontSize: 14, color: "#1a3a5c" },
  searchClear: { fontSize: 13, color: "#aaa", padding: 4 },
});
