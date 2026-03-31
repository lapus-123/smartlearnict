import { LinearGradient } from "expo-linear-gradient";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
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
            <Svg
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              style={{ marginRight: 4 }}
            >
              <Path
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                stroke="#1a3a5c"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={s.badgeText}>Instructor</Text>
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
          onPress={() => navigation.navigate("Reading History")}
        >
          <View style={s.svgWrap}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 8v4l3 3"
                stroke="#1a3a5c"
                strokeWidth={2}
                strokeLinecap="round"
              />
              <Circle cx={12} cy={12} r={9} stroke="#1a3a5c" strokeWidth={2} />
            </Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.logTitle}>History Log</Text>
            <Text style={s.logSub}>View your learning history & progress</Text>
          </View>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
              d="M9 18l6-6-6-6"
              stroke="#aaa"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>

        <TouchableOpacity style={s.logoutBtn} onPress={logout}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                stroke="#C62828"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={s.logoutText}>Logout</Text>
          </View>
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
    flexDirection: "row",
    alignItems: "center",
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
  svgWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(26,58,92,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
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
