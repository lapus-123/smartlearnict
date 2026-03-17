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

export default function StudentProfileScreen({ navigation }) {
  const { currentUser, logout } = useAuth();

  const rows = [
    { label: "Full Name", value: currentUser?.fullName },
    { label: "Username", value: currentUser?.username },
    { label: "College", value: currentUser?.college?.name },
    { label: "Course", value: currentUser?.course?.name },
    { label: "Section", value: currentUser?.section },
    { label: "School Year", value: currentUser?.schoolYear },
    { label: "Student ID", value: currentUser?.studentId },
  ];

  return (
    <LinearGradient
      colors={["#4DD9C0", "#4D8FD9", "#D98F7A"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarBox}>
          <AvatarPicker size={90} />
          <Text style={styles.name}>{currentUser?.fullName}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🎓 Student</Text>
          </View>
        </View>

        <View style={styles.card}>
          {rows.map((r) =>
            r.value ? (
              <View key={r.label} style={styles.row}>
                <Text style={styles.rowLabel}>{r.label}</Text>
                <Text style={styles.rowValue}>{r.value}</Text>
              </View>
            ) : null,
          )}
        </View>

        {/* View Reading Log */}
        <TouchableOpacity
          style={styles.logBtn}
          onPress={() => navigation.navigate("ReadingHistory")}
        >
          <Text style={styles.logIcon}>📚</Text>
          <View>
            <Text style={styles.logTitle}>Reading Log</Text>
            <Text style={styles.logSub}>
              View your learning history & progress
            </Text>
          </View>
          <Text style={styles.logArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 64, paddingBottom: 40 },
  avatarBox: { alignItems: "center", marginBottom: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1a3f7a",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: { fontSize: 34, fontWeight: "900", color: "#fff" },
  name: { fontSize: 20, fontWeight: "900", color: "#1a3a5c", marginBottom: 6 },
  badge: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  badgeText: { color: "#1a3a5c", fontWeight: "700", fontSize: 12 },
  card: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  rowLabel: { fontSize: 13, color: "#888" },
  rowValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1a3a5c",
    maxWidth: "60%",
    textAlign: "right",
  },
  logBtn: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  logIcon: { fontSize: 28 },
  logTitle: { fontSize: 15, fontWeight: "800", color: "#1a3a5c" },
  logSub: { fontSize: 12, color: "#888", marginTop: 2 },
  logArrow: { marginLeft: "auto", fontSize: 22, color: "#aaa" },
  logoutBtn: {
    backgroundColor: "#E53935",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  logoutText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
