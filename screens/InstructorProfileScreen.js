import { LinearGradient } from "expo-linear-gradient";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AvatarPicker from "../components/AvatarPicker";
import { useAuth } from "../contexts/AuthContext";

export default function InstructorProfileScreen({ navigation }) {
  const { currentUser, logout } = useAuth();

  const rows = [
    { label: "Full Name", value: currentUser?.fullName },
    { label: "Username", value: currentUser?.username },
    { label: "Email", value: currentUser?.email },
    { label: "College", value: currentUser?.college?.name },
    { label: "School Year", value: currentUser?.schoolYear },
    { label: "Instructor ID", value: currentUser?.instructorId },
  ];

  return (
    <LinearGradient
      colors={["#4DD9C0", "#4D8FD9", "#D98F7A"]}
      style={s.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.avatarBox}>
          <AvatarPicker size={90} />
          <Text style={s.name}>{currentUser?.fullName}</Text>
          <View style={s.badge}>
            <Text style={s.badgeText}>📚 Instructor</Text>
          </View>
        </View>

        <View style={s.card}>
          {rows.map((r) =>
            r.value ? (
              <View key={r.label} style={s.row}>
                <Text style={s.rowLabel}>{r.label}</Text>
                <Text style={s.rowValue}>{r.value}</Text>
              </View>
            ) : null,
          )}
        </View>

        <TouchableOpacity
          style={s.logBtn}
          onPress={() => navigation.navigate("ReadingHistory")}
        >
          <Text style={s.logIcon}>📚</Text>
          <View>
            <Text style={s.logTitle}>Reading Log</Text>
            <Text style={s.logSub}>View your learning history & progress</Text>
          </View>
          <Text style={s.logArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.logoutBtn} onPress={logout}>
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },
  avatarBox: { alignItems: "center", marginBottom: 28 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(26,63,122,0.85)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    elevation: 4,
  },
  avatarText: { color: "#fff", fontSize: 34, fontWeight: "900" },
  name: { fontSize: 22, fontWeight: "900", color: "#1a3a5c", marginBottom: 8 },
  badge: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  badgeText: { color: "#1a3a5c", fontWeight: "700", fontSize: 13 },
  card: {
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  rowLabel: { color: "#666", fontSize: 13 },
  rowValue: {
    color: "#1a3a5c",
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
    textAlign: "right",
  },
  logBtn: {
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 12,
    elevation: 2,
  },
  logIcon: { fontSize: 26 },
  logTitle: { fontSize: 15, fontWeight: "800", color: "#1a3a5c" },
  logSub: { fontSize: 12, color: "#666", marginTop: 2 },
  logArrow: { fontSize: 22, color: "#aaa", marginLeft: "auto" },
  logoutBtn: {
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  logoutText: { color: "#C62828", fontWeight: "800", fontSize: 15 },
});
