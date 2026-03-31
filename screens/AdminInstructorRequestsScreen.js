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
  getInstructorRequests,
  rejectInstructor,
} from "../services/api";

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export default function AdminInstructorRequestsScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  const load = async () => {
    setLoading(true);
    try {
      const r = await getInstructorRequests();
      setRequests(r.data.instructors);
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
            await approveInstructor(item._id);
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
    Alert.alert("Reject", `Reject and remove ${item.fullName}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: async () => {
          setActing(item._id);
          try {
            await rejectInstructor(item._id);
            load();
          } catch {
            Alert.alert("Error", "Failed to reject.");
          }
          setActing(null);
        },
      },
    ]);
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Instructor Requests</Text>
          <Text style={s.sub}>Pending approval</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator
          color="#fff"
          size="large"
          style={{ marginTop: 40 }}
        />
      ) : requests.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>✅</Text>
          <Text style={s.emptyText}>No pending requests</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(i) => i._id}
          contentContainerStyle={s.list}
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={s.cardHeader}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>
                    {item.fullName?.[0]?.toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{item.fullName}</Text>
                  <Text style={s.meta}>ID: {item.instructorId}</Text>
                </View>
                <View style={s.pendingBadge}>
                  <Text style={s.pendingText}>Pending</Text>
                </View>
              </View>
              <View style={s.details}>
                <Text style={s.detail}>🏫 {item.collegeId?.name || "—"}</Text>
                <Text style={s.detail}>📅 {item.schoolYear}</Text>
                <Text style={s.detail}>✉️ {item.email}</Text>
                <Text style={s.detail}>
                  🗓 Registered {formatDate(item.createdAt)}
                </Text>
              </View>
              <View style={s.actions}>
                <TouchableOpacity
                  style={s.approveBtn}
                  onPress={() => handleApprove(item)}
                  disabled={acting === item._id}
                >
                  {acting === item._id ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <ApproveIcon size={16} color="#fff" />
                      <Text style={s.approveTxt}>Approve</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.rejectBtn}
                  onPress={() => handleReject(item)}
                  disabled={acting === item._id}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <DeleteIcon size={16} color="#E53935" />
                    <Text style={s.rejectTxt}>Reject</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.blue },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 14,
  },
  back: { padding: 4 },
  backText: { color: "#fff", fontSize: 22, fontWeight: "700" },
  title: { color: "#fff", fontSize: 20, fontWeight: "900" },
  sub: { color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 },
  empty: { alignItems: "center", marginTop: 80 },
  emptyIcon: { fontSize: 52, marginBottom: 12 },
  emptyText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  list: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  name: { fontSize: 15, fontWeight: "800", color: "#1a3a5c" },
  meta: { fontSize: 12, color: "#888", marginTop: 2 },
  pendingBadge: {
    backgroundColor: "#FFF3CD",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pendingText: { color: "#E07B00", fontSize: 11, fontWeight: "800" },
  details: {
    backgroundColor: "#F4F6FF",
    borderRadius: 10,
    padding: 12,
    gap: 5,
    marginBottom: 14,
  },
  detail: { fontSize: 13, color: "#444" },
  actions: { flexDirection: "row", gap: 10 },
  approveBtn: {
    flex: 1,
    backgroundColor: "#2EAB6F",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  approveTxt: { color: "#fff", fontWeight: "800", fontSize: 14 },
  rejectBtn: {
    flex: 1,
    backgroundColor: "#FFE5E5",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  rejectTxt: { color: "#E53935", fontWeight: "800", fontSize: 14 },
});
