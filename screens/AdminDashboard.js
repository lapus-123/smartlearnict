import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { ChevronRight, LogoutIcon } from "../components/Icons";
import { useAuth } from "../contexts/AuthContext";
import { getInstructorRequests } from "../services/api";

// ── Inline SVG icons for admin cards ─────────────────────────────────────────
const ShieldIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
const ClockIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={9} stroke="#fff" strokeWidth={2} />
    <Path d="M12 7v5l3 3" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);
const CheckIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      stroke="#4DD9C0"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
const CollegeIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3L1 9l11 6 9-4.91V17M5 13.18V17L12 21l7-3.82V13.18L12 17l-7-3.82z"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
const CoursesAdminIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Rect
      x={3}
      y={3}
      width={7}
      height={7}
      rx={1}
      stroke="#fff"
      strokeWidth={2}
    />
    <Rect
      x={14}
      y={3}
      width={7}
      height={7}
      rx={1}
      stroke="#fff"
      strokeWidth={2}
    />
    <Rect
      x={3}
      y={14}
      width={7}
      height={7}
      rx={1}
      stroke="#fff"
      strokeWidth={2}
    />
    <Rect
      x={14}
      y={14}
      width={7}
      height={7}
      rx={1}
      stroke="#fff"
      strokeWidth={2}
    />
  </Svg>
);
const SubjectsIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
const UploadAdminIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
const UsersIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
const RequestsIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
const AcademicIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3L1 9l11 6 9-4.91V17M5 13.18V17L12 21l7-3.82V13.18L12 17l-7-3.82z"
      stroke="#1a3a5c"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
const MaterialsIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
      stroke="#1a3a5c"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
const UserMgmtIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      stroke="#1a3a5c"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function AdminDashboard({ navigation }) {
  const { currentUser, logout } = useAuth();
  const confirmLogout = () => {
    Alert.alert("Logout", "Would you like to log out?", [
      { text: "No", style: "cancel" },
      { text: "Yes", style: "destructive", onPress: logout },
    ]);
  };

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
            <Text style={s.greeting}>Hello, {firstName}</Text>
          </View>
          <View style={s.adminBadge}>
            <ShieldIcon />
            <Text style={s.adminBadgeText}>Admin</Text>
          </View>
        </View>

        {/* Stats card */}
        <View style={s.statsCard}>
          <View style={s.statsRow}>
            <View style={s.statItem}>
              <ShieldIcon />
              <Text style={s.statLabel}>Admin Panel</Text>
              <Text style={s.statSub}>Full Access</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <ClockIcon />
              <Text style={s.statLabel}>{pendingCount}</Text>
              <Text style={s.statSub}>Pending Requests</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <CheckIcon />
              <Text style={s.statLabel}>Active</Text>
              <Text style={s.statSub}>System Status</Text>
            </View>
          </View>
        </View>

        {/* Academic Structure */}
        <SectionHeader title="ACADEMIC STRUCTURE" icon={<AcademicIcon />} />
        <View style={s.grid}>
          <ActionCard
            icon={<CollegeIcon />}
            label="Manage Colleges"
            color="#1a3f7a"
            sub="Add & rename colleges"
            onPress={() => navigation.navigate("CollegeManager")}
          />
          <ActionCard
            icon={<CoursesAdminIcon />}
            label="Manage Courses"
            color="#5B2FBE"
            sub="Add & rename courses"
            onPress={() => navigation.navigate("SectionManager")}
          />
        </View>

        {/* Learning Materials */}
        <SectionHeader title="LEARNING MATERIALS" icon={<MaterialsIcon />} />
        <View style={s.grid}>
          <ActionCard
            icon={<SubjectsIcon />}
            label="Manage Subjects"
            color="#1a7a4a"
            sub="Core & specialization"
            onPress={() => navigation.navigate("AdminSubjectManager")}
          />
          <ActionCard
            icon={<UploadAdminIcon />}
            label="Upload Materials"
            color="#B85C00"
            sub="Files, videos & docs"
            onPress={() => navigation.navigate("AdminUploadMaterial")}
          />
        </View>

        {/* User Management */}
        <SectionHeader title="USER MANAGEMENT" icon={<UserMgmtIcon />} />
        <View style={s.fullCard}>
          <TouchableOpacity
            style={s.wideCard}
            onPress={() => navigation.navigate("AdminManageUsers")}
            activeOpacity={0.85}
          >
            <View style={[s.wideIconBox, { backgroundColor: "#0277a8" }]}>
              <UsersIcon />
            </View>
            <View style={s.wideInfo}>
              <Text style={s.wideLabel}>Edit / Delete Users</Text>
              <Text style={s.wideSub}>
                Search, edit or remove student & instructor accounts
              </Text>
            </View>
            <ChevronRight size={20} color="#aaa" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.wideCard, { marginTop: 10 }]}
            onPress={() => navigation.navigate("InstructorRequests")}
            activeOpacity={0.85}
          >
            <View style={[s.wideIconBox, { backgroundColor: "#B71C1C" }]}>
              <RequestsIcon />
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
            <ChevronRight size={20} color="#aaa" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={s.logoutBtn}
          onPress={confirmLogout}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <LogoutIcon size={18} color="#C62828" />
            <Text style={s.logoutText}>Logout</Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const SectionHeader = ({ title, icon }) => (
  <View style={s.sectionHeader}>
    {icon}
    <Text style={s.sectionTitle}>{title}</Text>
  </View>
);

const ActionCard = ({ icon, label, sub, color, onPress }) => (
  <TouchableOpacity
    style={[s.actionCard, { backgroundColor: color }]}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <View style={s.actionIconWrap}>{icon}</View>
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
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  adminBadgeText: { color: "#1a3a5c", fontWeight: "800", fontSize: 13 },
  statsCard: {
    backgroundColor: "#1a3f7a",
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
  },
  statsRow: { flexDirection: "row", alignItems: "center" },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
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
  actionIconWrap: { marginBottom: 10 },
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
  wideInfo: { flex: 1 },
  wideLabel: { fontSize: 15, fontWeight: "800", color: "#1a3a5c" },
  wideSub: { fontSize: 12, color: "#666", marginTop: 2 },
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
