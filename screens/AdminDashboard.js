import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { getInstructorRequests } from "../services/api";

export default function AdminDashboard({ navigation }) {
  const { currentUser, logout } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      getInstructorRequests()
        .then((r) => setPendingCount(r.data.instructors.length))
        .catch(() => {});
    }, []),
  );

  const firstName =
    currentUser?.fullName?.split(" ")[0]?.toUpperCase() || "ADMIN";

  return (
    <LinearGradient
      colors={["#4DD9C0", "#4D8FD9", "#D98F7A"]}
      style={s.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.portalLabel}>ADMIN PORTAL</Text>
            <Text style={s.greeting}>Hello, {firstName} 👋</Text>
          </View>
          <View style={s.adminBadge}>
            <Text style={s.adminBadgeText}>🛡️ Admin</Text>
          </View>
        </View>

        {/* Stats card */}
        <View style={s.statsCard}>
          <View style={s.statsRow}>
            <View style={s.statItem}>
              <Text style={s.statIcon}>🏫</Text>
              <Text style={s.statLabel}>Admin Panel</Text>
              <Text style={s.statSub}>Full Access</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={s.statIcon}>⏳</Text>
              <Text style={s.statLabel}>{pendingCount}</Text>
              <Text style={s.statSub}>Pending Requests</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={s.statIcon}>✅</Text>
              <Text style={s.statLabel}>Active</Text>
              <Text style={s.statSub}>System Status</Text>
            </View>
          </View>
        </View>

        {/* Academic Structure */}
        <SectionHeader title="ACADEMIC STRUCTURE" icon="🎓" />
        <View style={s.grid}>
          <ActionCard
            icon="🏫"
            label="Manage Colleges"
            color="#1a3f7a"
            sub="Add & rename colleges"
            onPress={() => navigation.navigate("CollegeManager")}
          />
          <ActionCard
            icon="📋"
            label="Manage Courses"
            color="#5B2FBE"
            sub="Add & rename courses"
            onPress={() => navigation.navigate("SectionManager")}
          />
        </View>

        {/* Learning Materials */}
        <SectionHeader title="LEARNING MATERIALS" icon="📚" />
        <View style={s.grid}>
          <ActionCard
            icon="📖"
            label="Manage Subjects"
            color="#1a7a4a"
            sub="Core & specialization"
            onPress={() => navigation.navigate("AdminSubjectManager")}
          />
          <ActionCard
            icon="📤"
            label="Upload Materials"
            color="#B85C00"
            sub="Files, videos & docs"
            onPress={() => navigation.navigate("AdminUploadMaterial")}
          />
        </View>

        {/* User Management */}
        <SectionHeader title="USER MANAGEMENT" icon="👥" />
        <View style={s.fullCard}>
          <TouchableOpacity
            style={s.wideCard}
            onPress={() => navigation.navigate("AdminManageUsers")}
            activeOpacity={0.85}
          >
            <View style={[s.wideIconBox, { backgroundColor: "#0277a8" }]}>
              <Text style={s.wideIcon}>👤</Text>
            </View>
            <View style={s.wideInfo}>
              <Text style={s.wideLabel}>Edit / Delete Users</Text>
              <Text style={s.wideSub}>
                Search, edit or remove student & instructor accounts
              </Text>
            </View>
            <Text style={s.wideArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.wideCard, { marginTop: 10 }]}
            onPress={() => navigation.navigate("InstructorRequests")}
            activeOpacity={0.85}
          >
            <View style={[s.wideIconBox, { backgroundColor: "#B71C1C" }]}>
              <Text style={s.wideIcon}>📝</Text>
            </View>
            <View style={s.wideInfo}>
              <Text style={s.wideLabel}>Instructor Requests</Text>
              <Text style={s.wideSub}>
                Review and approve pending instructor accounts
              </Text>
            </View>
            {pendingCount > 0 && (
              <View style={s.pendingBadge}>
                <Text style={s.pendingBadgeText}>{pendingCount}</Text>
              </View>
            )}
            <Text style={s.wideArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={s.logoutBtn}
          onPress={logout}
          activeOpacity={0.8}
        >
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const SectionHeader = ({ title, icon }) => (
  <View style={s.sectionHeader}>
    <Text style={s.sectionIcon}>{icon}</Text>
    <View>
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  </View>
);

const ActionCard = ({ icon, label, sub, color, onPress }) => (
  <TouchableOpacity
    style={[s.actionCard, { backgroundColor: color }]}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <Text style={s.actionIcon}>{icon}</Text>
    <Text style={s.actionLabel}>{label}</Text>
    <Text style={s.actionSub}>{sub}</Text>
  </TouchableOpacity>
);

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  portalLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1a3a5c",
    letterSpacing: 0.5,
  },
  adminBadge: {
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  adminBadgeText: { color: "#1a3a5c", fontWeight: "800", fontSize: 13 },

  statsCard: {
    backgroundColor: "#1a3f7a",
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
  },
  statsRow: { flexDirection: "row", alignItems: "center" },
  statItem: { flex: 1, alignItems: "center" },
  statIcon: { fontSize: 22, marginBottom: 4 },
  statLabel: { fontSize: 16, fontWeight: "900", color: "#fff" },
  statSub: {
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    marginTop: 4,
  },
  sectionIcon: { fontSize: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#1a3a5c",
    letterSpacing: 0.5,
  },

  grid: { flexDirection: "row", gap: 12, marginBottom: 20 },
  actionCard: {
    flex: 1,
    borderRadius: 18,
    padding: 18,
    minHeight: 120,
    justifyContent: "flex-end",
  },
  actionIcon: { fontSize: 32, marginBottom: 10 },
  actionLabel: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
    marginBottom: 3,
  },
  actionSub: { color: "rgba(255,255,255,0.65)", fontSize: 11 },

  fullCard: { marginBottom: 20 },
  wideCard: {
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    elevation: 2,
  },
  wideIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  wideIcon: { fontSize: 22 },
  wideInfo: { flex: 1 },
  wideLabel: { fontSize: 15, fontWeight: "800", color: "#1a3a5c" },
  wideSub: { fontSize: 12, color: "#666", marginTop: 2 },
  wideArrow: { fontSize: 22, color: "#aaa" },
  pendingBadge: {
    backgroundColor: "#E53935",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  pendingBadgeText: { color: "#fff", fontSize: 12, fontWeight: "900" },

  logoutBtn: {
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  logoutText: { color: "#C62828", fontWeight: "800", fontSize: 15 },
});
