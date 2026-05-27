import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ApproveIcon, DeleteIcon } from "../components/Icons";
import { COLORS } from "../config";
import {
  approveInstructor,
  approveStudent,
  getInstructorRequests,
  getStudentRequests,
  rejectInstructor,
  rejectStudent,
} from "../services/api";

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export default function AdminInstructorRequestsScreen({ navigation }) {
  const [tab, setTab] = useState("instructor");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  useFocusEffect(
    useCallback(() => {
      load(tab);
    }, [tab]),
  );

  const load = async (t = tab) => {
    setLoading(true);
    try {
      const r =
        t === "instructor"
          ? await getInstructorRequests()
          : await getStudentRequests();
      setRequests(t === "instructor" ? r.data.instructors : r.data.students);
    } catch {
      setRequests([]);
    }
    setLoading(false);
  };

  const handleApprove = (item) => {
    Alert.alert("Approve", `Approve ${item.fullName}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Approve",
        onPress: async () => {
          setActing(item._id);
          try {
            tab === "instructor"
              ? await approveInstructor(item._id)
              : await approveStudent(item._id);
            load();
          } catch {
            Alert.alert("Error", "Failed to approve.");
          }
          setActing(null);
        },
      },
    ]);
  };

  const handleReject = (item) => {
    Alert.alert(
      "Reject",
      `Reject and delete ${item.fullName}'s registration?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            setActing(item._id);
            try {
              tab === "instructor"
                ? await rejectInstructor(item._id)
                : await rejectStudent(item._id);
              load();
            } catch {
              Alert.alert("Error", "Failed to reject.");
            }
            setActing(null);
          },
        },
      ],
    );
  };

  const renderItem = ({ item }) => (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{item.fullName[0]}</Text>
        </View>
        <View style={s.info}>
          <Text style={s.name}>{item.fullName}</Text>
          <Text style={s.meta}>{item.collegeId?.name || "—"}</Text>
          {tab === "student" && item.courseId?.name && (
            <Text style={s.meta}>{item.courseId.name}</Text>
          )}
          <Text style={s.meta}>{item.email}</Text>
          <Text style={s.date}>Registered: {formatDate(item.createdAt)}</Text>
        </View>
      </View>
      <View style={s.actions}>
        <TouchableOpacity
          style={[s.approveBtn, acting === item._id && s.dimmed]}
          onPress={() => handleApprove(item)}
          disabled={!!acting}
        >
          {acting === item._id ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <View style={s.btnRow}>
              <ApproveIcon size={16} color="#fff" />
              <Text style={s.approveTxt}>Approve</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.rejectBtn, acting === item._id && s.dimmed]}
          onPress={() => handleReject(item)}
          disabled={!!acting}
        >
          <View style={s.btnRow}>
            <DeleteIcon size={16} color={COLORS.danger} />
            <Text style={s.rejectTxt}>Reject</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>Pending Requests</Text>
      </View>

      {/* Tab selector */}
      <View style={s.tabRow}>
        <TouchableOpacity
          style={[s.tabBtn, tab === "instructor" && s.tabActive]}
          onPress={() => setTab("instructor")}
        >
          <Text style={[s.tabTxt, tab === "instructor" && s.tabTxtActive]}>
            Instructors
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tabBtn, tab === "student" && s.tabActive]}
          onPress={() => setTab("student")}
        >
          <Text style={[s.tabTxt, tab === "student" && s.tabTxtActive]}>
            Students
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          color={COLORS.blue}
          style={{ marginTop: 40 }}
          size="large"
        />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(i) => i._id}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <Text style={s.empty}>No pending {tab} requests.</Text>
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7FF" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#eee",
    gap: 12,
  },
  back: {},
  backText: { color: COLORS.blue, fontWeight: "700", fontSize: 14 },
  title: { fontSize: 18, fontWeight: "900", color: "#1a3a5c" },
  tabRow: {
    flexDirection: "row",
    margin: 16,
    backgroundColor: "#E8EEFF",
    borderRadius: 12,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  tabActive: { backgroundColor: "#fff", elevation: 2 },
  tabTxt: { fontSize: 13, fontWeight: "700", color: "#aaa" },
  tabTxtActive: { color: "#1a3a5c" },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", gap: 12, marginBottom: 14 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "900", fontSize: 18 },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 15, fontWeight: "800", color: "#1a3a5c" },
  meta: { fontSize: 12, color: "#666" },
  date: { fontSize: 11, color: "#aaa", marginTop: 2 },
  actions: { flexDirection: "row", gap: 10 },
  approveBtn: {
    flex: 1,
    backgroundColor: "#2EAB6F",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  rejectBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.danger,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  btnRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  approveTxt: { color: "#fff", fontWeight: "700", fontSize: 13 },
  rejectTxt: { color: COLORS.danger, fontWeight: "700", fontSize: 13 },
  dimmed: { opacity: 0.5 },
  empty: { textAlign: "center", color: "#aaa", marginTop: 40, fontSize: 14 },
});
