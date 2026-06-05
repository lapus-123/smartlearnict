import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import Dropdown from "../components/Dropdown";
import { DeleteIcon, EditIcon, SearchIcon } from "../components/Icons";
import PopupModal from "../components/PopupModal";
import { COLORS } from "../config";
import {
  deleteUser,
  getAdminInstructors,
  getAdminStudents,
  getAdminUsers,
  getColleges,
} from "../services/api";

const roleOptions = [
  { label: "All Roles", value: "" },
  { label: "Students", value: "student" },
  { label: "Instructors", value: "instructor" },
];

const statusOptions = [
  { label: "All Statuses", value: "" },
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Inactive", value: "inactive" },
  { label: "Suspended", value: "suspended" },
];

const sortOptions = [
  { label: "Newest Created", value: "createdAt" },
  { label: "Full Name", value: "fullName" },
  { label: "Username", value: "username" },
  { label: "Role", value: "role" },
  { label: "Status", value: "status" },
];

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

const getUserId = (user) =>
  user.studentId || user.instructorId || user.username || user._id;

const getDepartmentId = (user) => user.collegeId?._id || user.collegeId || "";

const buildSummary = (items) => ({
  totalStudents: items.filter((user) => user.role === "student").length,
  totalInstructors: items.filter((user) => user.role === "instructor").length,
  activeUsers: items.filter((user) => (user.status || "active") === "active")
    .length,
});

const filterAndPageUsers = ({
  allUsers,
  search,
  role,
  status,
  departmentId,
  sort,
  page,
  limit,
}) => {
  const q = search.trim().toLowerCase();
  const filtered = allUsers.filter((user) => {
    const searchable = [
      user.fullName,
      user.username,
      user.email,
      user.studentId,
      user.instructorId,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = !q || searchable.includes(q);
    const matchesRole = !role || user.role === role;
    const matchesStatus = !status || (user.status || "active") === status;
    const matchesDepartment =
      !departmentId || getDepartmentId(user) === departmentId;

    return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
  });

  filtered.sort((a, b) => {
    if (sort === "createdAt") {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
    const left = String(a[sort] || "").toLowerCase();
    const right = String(b[sort] || "").toLowerCase();
    return left.localeCompare(right);
  });

  const start = (page - 1) * limit;
  return {
    users: filtered.slice(start, start + limit),
    total: filtered.length,
    pages: Math.max(Math.ceil(filtered.length / limit), 1),
  };
};

export default function AdminManageUsersScreen({ navigation }) {
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({
    totalStudents: 0,
    totalInstructors: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({
    visible: false,
    title: "",
    message: "",
    type: "success",
  });

  const departmentOptions = useMemo(
    () => [{ label: "All Departments", value: "" }, ...departments],
    [departments],
  );

  const loadUsers = useCallback(async (nextPage = 1) => {
    setLoading(true);
    try {
      const limit = 12;
      const res = await getAdminUsers({
        q: search.trim(),
        role,
        status,
        departmentId,
        sort,
        page: nextPage,
        limit,
      });
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
      setPage(res.data.page || nextPage);
      setPages(res.data.pages || 1);
      setSummary(
        res.data.summary || {
          totalStudents: 0,
          totalInstructors: 0,
          activeUsers: 0,
        },
      );
    } catch (primaryErr) {
      try {
        const [studentsRes, instructorsRes] = await Promise.all([
          getAdminStudents({}),
          getAdminInstructors({}),
        ]);
        const allUsers = [
          ...(studentsRes.data.students || []),
          ...(instructorsRes.data.instructors || []),
        ];
        const limit = 12;
        const result = filterAndPageUsers({
          allUsers,
          search,
          role,
          status,
          departmentId,
          sort,
          page: nextPage,
          limit,
        });

        setUsers(result.users);
        setTotal(result.total);
        setPage(nextPage);
        setPages(result.pages);
        setSummary(buildSummary(allUsers));
      } catch (fallbackErr) {
        const message =
          fallbackErr.response?.data?.message ||
          primaryErr.response?.data?.message ||
          "Unable to load users. Please check your connection.";
        setPopup({
          visible: true,
          title: "Search Failed",
          message,
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [departmentId, role, search, sort, status]);

  useEffect(() => {
    getColleges()
      .then((res) =>
        setDepartments(
          (res.data.colleges || []).map((item) => ({
            label: item.name,
            value: item._id,
          })),
        ),
      )
      .catch(() => setDepartments([]));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadUsers(1), 350);
    return () => clearTimeout(timer);
  }, [loadUsers]);

  useFocusEffect(
    useCallback(() => {
      loadUsers(1);
    }, [loadUsers]),
  );

  const clearFilters = () => {
    setSearch("");
    setRole("");
    setDepartmentId("");
    setStatus("");
    setSort("createdAt");
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
              setPopup({
                visible: true,
                title: "Deleted",
                message: res.data.message,
                type: "success",
              });
              loadUsers(page);
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

  return (
    <LinearGradient
      colors={["#4DD9C0", "#4D8FD9", "#D98F7A"]}
      style={s.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={s.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
            <Text style={s.backText}>{"<"}</Text>
          </TouchableOpacity>
          <View style={s.titleWrap}>
            <Text style={s.title}>Manage Users</Text>
            <Text style={s.subtitle}>Search and maintain account records</Text>
          </View>
        </View>

        <View style={s.summaryRow}>
          <SummaryCard label="Students" value={summary.totalStudents} />
          <SummaryCard label="Instructors" value={summary.totalInstructors} />
          <SummaryCard label="Active Users" value={summary.activeUsers} />
        </View>

        <View style={s.panel}>
          <View style={s.searchBar}>
            <SearchIcon size={18} color="#6B7280" />
            <TextInput
              style={s.searchInput}
              placeholder="Search username, name, email, or ID"
              placeholderTextColor="#8E99AA"
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
            {search ? (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Text style={s.clearText}>Clear</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={s.filterGrid}>
            <View style={s.filterItem}>
              <Dropdown
                label="Role"
                placeholder="All Roles"
                options={roleOptions}
                value={role}
                onChange={setRole}
              />
            </View>
            <View style={s.filterItem}>
              <Dropdown
                label="Department"
                placeholder="All Departments"
                options={departmentOptions}
                value={departmentId}
                onChange={setDepartmentId}
              />
            </View>
            <View style={s.filterItem}>
              <Dropdown
                label="Status"
                placeholder="All Statuses"
                options={statusOptions}
                value={status}
                onChange={setStatus}
              />
            </View>
            <View style={s.filterItem}>
              <Dropdown
                label="Sort"
                placeholder="Sort"
                options={sortOptions}
                value={sort}
                onChange={setSort}
              />
            </View>
          </View>

          <View style={s.tableTop}>
            <Text style={s.resultCount}>
              {loading ? "Loading users..." : `${total} account records`}
            </Text>
            <TouchableOpacity onPress={clearFilters} style={s.clearButton}>
              <Text style={s.clearButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={s.table}>
            <TableHeader />
            {loading ? (
              <ActivityIndicator color={COLORS.blue} style={s.loader} />
            ) : users.length ? (
              users.map((user) => (
                <UserRow
                  key={user._id}
                  user={user}
                  onEdit={() =>
                    navigation.navigate("AdminEditUser", { user })
                  }
                  onDelete={() => handleDelete(user)}
                />
              ))
            ) : (
              <View style={s.emptyRow}>
                <Text style={s.emptyText}>No users match your search.</Text>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={s.pagination}>
          <TouchableOpacity
            style={[s.pageBtn, page <= 1 && s.pageBtnDisabled]}
            disabled={page <= 1 || loading}
            onPress={() => loadUsers(page - 1)}
          >
            <Text style={s.pageBtnText}>Previous</Text>
          </TouchableOpacity>
          <Text style={s.pageText}>
            Page {page} of {pages}
          </Text>
          <TouchableOpacity
            style={[s.pageBtn, page >= pages && s.pageBtnDisabled]}
            disabled={page >= pages || loading}
            onPress={() => loadUsers(page + 1)}
          >
            <Text style={s.pageBtnText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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

const SummaryCard = ({ label, value }) => (
  <View style={s.summaryCard}>
    <Text style={s.summaryValue}>{value}</Text>
    <Text style={s.summaryLabel}>{label}</Text>
  </View>
);

const TableHeader = () => (
  <View style={[s.tableRow, s.headerRow]}>
    <Cell text="User ID" header width={130} />
    <Cell text="Full Name" header width={180} />
    <Cell text="Role" header width={100} />
    <Cell text="Department" header width={170} />
    <Cell text="Email Address" header width={220} />
    <Cell text="Status" header width={110} />
    <Cell text="Date Created" header width={130} />
    <Cell text="Actions" header width={120} />
  </View>
);

const UserRow = ({ user, onEdit, onDelete }) => (
  <View style={s.tableRow}>
    <Cell text={getUserId(user)} width={130} />
    <Cell text={user.fullName || "-"} width={180} strong />
    <Cell text={user.role || "-"} width={100} />
    <Cell text={user.collegeId?.name || "Unassigned"} width={170} />
    <Cell text={user.email || "-"} width={220} />
    <View style={[s.cell, { width: 110 }]}>
      <View style={[s.statusChip, s[`status_${user.status}`]]}>
        <Text style={s.statusText}>{user.status || "active"}</Text>
      </View>
    </View>
    <Cell text={formatDate(user.createdAt)} width={130} />
    <View style={[s.cell, s.actionCell, { width: 120 }]}>
      <TouchableOpacity style={s.iconBtn} onPress={onEdit}>
        <EditIcon size={16} color={COLORS.blue} />
      </TouchableOpacity>
      <TouchableOpacity style={s.iconBtnDanger} onPress={onDelete}>
        <DeleteIcon size={16} color={COLORS.danger} />
      </TouchableOpacity>
    </View>
  </View>
);

const Cell = ({ text, width, header, strong }) => (
  <View style={[s.cell, { width }]}>
    <Text
      style={[s.cellText, header && s.headerText, strong && s.strongText]}
      numberOfLines={2}
    >
      {text}
    </Text>
  </View>
);

const s = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 56, paddingBottom: 40 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  back: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.75)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  backText: { color: "#1A3A5C", fontSize: 20, fontWeight: "900" },
  titleWrap: { flex: 1 },
  title: { fontSize: 23, fontWeight: "900", color: "#163B5C" },
  subtitle: { marginTop: 2, fontSize: 12, color: "rgba(22,59,92,0.72)" },
  summaryRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  summaryCard: {
    flex: 1,
    minHeight: 74,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.86)",
    padding: 10,
    justifyContent: "center",
  },
  summaryValue: { fontSize: 22, fontWeight: "900", color: COLORS.blue },
  summaryLabel: { marginTop: 3, fontSize: 11, fontWeight: "700", color: "#4B5563" },
  panel: {
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.92)",
    padding: 14,
    marginBottom: 12,
  },
  searchBar: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5EAF5",
    backgroundColor: "#F8FAFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#172036" },
  clearText: { color: COLORS.blue, fontSize: 12, fontWeight: "800" },
  filterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  filterItem: { minWidth: 150, flex: 1 },
  tableTop: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultCount: { color: "#334155", fontSize: 13, fontWeight: "800" },
  clearButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D7DEEA",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearButtonText: { color: "#334155", fontSize: 12, fontWeight: "800" },
  table: {
    minWidth: 1160,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.96)",
  },
  tableRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "stretch",
    borderBottomWidth: 1,
    borderBottomColor: "#EDF1F7",
  },
  headerRow: { minHeight: 46, backgroundColor: "#EAF0FF" },
  cell: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "#EDF1F7",
  },
  cellText: { color: "#334155", fontSize: 12, lineHeight: 16 },
  headerText: { color: "#17365D", fontSize: 12, fontWeight: "900" },
  strongText: { color: "#172036", fontWeight: "900" },
  statusChip: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: "#E8F5EE",
  },
  status_active: { backgroundColor: "#E5F8EF" },
  status_pending: { backgroundColor: "#FFF4D8" },
  status_inactive: { backgroundColor: "#EEF2F7" },
  status_suspended: { backgroundColor: "#FFE6E6" },
  statusText: {
    color: "#1F2937",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  actionCell: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBtn: {
    width: 36,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnDanger: {
    width: 36,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#FFECEC",
    alignItems: "center",
    justifyContent: "center",
  },
  loader: { paddingVertical: 40 },
  emptyRow: { paddingVertical: 34, alignItems: "center" },
  emptyText: { color: "#334155", fontSize: 14, fontWeight: "800" },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 10,
  },
  pageBtn: {
    borderRadius: 8,
    backgroundColor: COLORS.blue,
    paddingVertical: 11,
    paddingHorizontal: 14,
    minWidth: 96,
    alignItems: "center",
  },
  pageBtnDisabled: { opacity: 0.45 },
  pageBtnText: { color: "#fff", fontWeight: "900", fontSize: 12 },
  pageText: { color: "#163B5C", fontSize: 13, fontWeight: "900" },
});
