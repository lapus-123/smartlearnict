import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../components/Button";
import DatePicker from "../components/DatePicker";
import Dropdown from "../components/Dropdown";
import Input from "../components/Input";
import PopupModal from "../components/PopupModal";
import { useAuth } from "../contexts/AuthContext";
import { getColleges, getSections } from "../services/api";

const ROLES = [
  { label: "Student", value: "student" },
  { label: "Instructor / Professor", value: "instructor" },
];

const SCHOOL_YEARS = ["2023-2024", "2024-2025", "2025-2026", "2026-2027"].map(
  (y) => ({ label: y, value: y }),
);

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();

  const [role, setRole] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [birthdayDate, setBirthdayDate] = useState(null);
  const [birthdayStr, setBirthdayStr] = useState("");
  const [schoolYear, setSchoolYear] = useState("");
  const [studentId, setStudentId] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [courseId, setCourseId] = useState("");
  const collegeIdRef = useRef("");
  const courseIdRef = useRef("");

  const [colleges, setColleges] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadingColleges, setLoadingColleges] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({
    visible: false,
    title: "",
    message: "",
    type: "success",
  });

  useEffect(() => {
    collegeIdRef.current = collegeId;
  }, [collegeId]);
  useEffect(() => {
    courseIdRef.current = courseId;
  }, [courseId]);

  useEffect(() => {
    setLoadingColleges(true);
    getColleges()
      .then((r) =>
        setColleges(
          r.data.colleges.map((c) => ({ label: c.name, value: c._id })),
        ),
      )
      .catch(() => {})
      .finally(() => setLoadingColleges(false));
  }, []);

  useEffect(() => {
    if (!collegeId) {
      setCourses([]);
      setCourseId("");
      courseIdRef.current = "";
      return;
    }
    setLoadingCourses(true);
    setCourseId("");
    courseIdRef.current = "";
    getSections(collegeId)
      .then((r) =>
        setCourses(
          r.data.sections.map((s) => ({ label: s.name, value: s._id })),
        ),
      )
      .catch(() => setCourses([]))
      .finally(() => setLoadingCourses(false));
  }, [collegeId]);

  const err = (title, message) =>
    setPopup({ visible: true, title, message, type: "error" });

  const handleRegister = async () => {
    const cId = collegeIdRef.current;
    const crId = courseIdRef.current;

    if (!role)
      return err("Select Role", "Please select Student or Instructor.");
    if (!fullName.trim())
      return err("Missing Fields", "Please enter your full name.");
    if (!email.trim())
      return err("Missing Fields", "Please enter your email address.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return err("Invalid Email", "Please enter a valid email address.");
    if (!birthdayStr)
      return err("Missing Fields", "Please select your birthday.");
    if (!cId) return err("Missing Fields", "Please select your College.");
    if (!schoolYear)
      return err("Missing Fields", "Please select your School Year.");
    if (role === "student") {
      if (!studentId.trim())
        return err("Missing Fields", "Please enter your Student ID.");
      if (!crId)
        return err("Missing Fields", "Please select your Course (e.g. BSIT).");
    }
    if (role === "instructor" && !instructorId.trim())
      return err("Missing Fields", "Please enter your Instructor ID.");

    const payload = {
      role,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      birthday: birthdayStr,
      collegeId: cId,
      schoolYear,
      ...(role === "student"
        ? { studentId: studentId.trim(), courseId: crId }
        : { instructorId: instructorId.trim() }),
    };

    setLoading(true);
    const result = await register(payload);
    setLoading(false);

    if (!result.success) {
      setPopup({
        visible: true,
        title: "Registration Failed",
        message: result.message,
        type: "error",
      });
    } else {
      setPopup({
        visible: true,
        title: "Pending Approval",
        message:
          "Your account has been submitted. You can log in once the Admin approves your account.",
        type: "success",
      });
    }
  };

  const isLocked = !role;

  return (
    <LinearGradient
      colors={["#4DD9C0", "#4D8FD9", "#D98F7A"]}
      style={s.flex}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={s.backBtn}
            >
              <Text style={s.backText}>← Back to Login</Text>
            </TouchableOpacity>
            <Text style={s.title}>Create Account</Text>
            <Text style={s.sub}>Register as a student or instructor</Text>
          </View>

          <View style={s.card}>
            {/* Role selector */}
            <Text style={s.label}>REGISTER AS</Text>
            <View style={s.roleRow}>
              {ROLES.map((r) => (
                <TouchableOpacity
                  key={r.value}
                  style={[s.roleBtn, role === r.value && s.roleBtnActive]}
                  onPress={() => setRole(r.value)}
                >
                  <Text
                    style={[s.roleTxt, role === r.value && s.roleTxtActive]}
                  >
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Lock overlay until role selected */}
            {isLocked ? (
              <View style={s.lockBox}>
                <Text style={s.lockText}>
                  Please select a role above to continue
                </Text>
              </View>
            ) : (
              <>
                <Text style={s.label}>FULL NAME</Text>
                <Input
                  placeholder="Juan dela Cruz"
                  value={fullName}
                  onChangeText={setFullName}
                />

                <Text style={s.label}>EMAIL ADDRESS</Text>
                <Input
                  placeholder="your@email.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                <Text style={s.label}>BIRTHDAY</Text>
                <DatePicker
                  value={birthdayDate}
                  onChange={(dateObj, dateStr) => {
                    setBirthdayDate(dateObj);
                    setBirthdayStr(dateStr);
                  }}
                />
                <Text style={s.hint}>
                  Your username will be your birth month + day (e.g. 0123 = Jan
                  23)
                </Text>

                <Text style={s.label}>COLLEGE</Text>
                <Dropdown
                  value={collegeId}
                  onChange={(val) => {
                    collegeIdRef.current = val;
                    setCollegeId(val);
                  }}
                  options={colleges}
                  placeholder={
                    loadingColleges ? "Loading colleges..." : "Select College"
                  }
                />

                <Text style={s.label}>SCHOOL YEAR</Text>
                <Dropdown
                  value={schoolYear}
                  onChange={setSchoolYear}
                  options={SCHOOL_YEARS}
                  placeholder="Select School Year"
                />

                {role === "student" && (
                  <>
                    <Text style={s.label}>COURSE & SECTION</Text>
                    <Dropdown
                      value={courseId}
                      onChange={(val) => {
                        courseIdRef.current = val;
                        setCourseId(val);
                      }}
                      options={courses}
                      placeholder={
                        !collegeId
                          ? "Select a college first"
                          : loadingCourses
                            ? "Loading courses..."
                            : "Select Course"
                      }
                    />

                    <Text style={s.label}>STUDENT ID</Text>
                    <Input
                      placeholder="e.g. 2021-00123"
                      value={studentId}
                      onChangeText={setStudentId}
                    />
                  </>
                )}

                {role === "instructor" && (
                  <>
                    <Text style={s.label}>INSTRUCTOR ID</Text>
                    <Input
                      placeholder="e.g. INS-2021-001"
                      value={instructorId}
                      onChangeText={setInstructorId}
                    />
                  </>
                )}

                <View style={s.pendingNote}>
                  <Text style={s.pendingText}>
                    ⏳ All accounts require Admin approval before logging in.
                  </Text>
                </View>

                <Button
                  title="Create Account"
                  onPress={handleRegister}
                  loading={loading}
                />
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <PopupModal
        visible={popup.visible}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        onClose={() => {
          setPopup({ ...popup, visible: false });
          if (popup.type === "success") navigation.navigate("Login");
        }}
      />
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingVertical: 36 },
  header: { marginBottom: 20 },
  backBtn: { marginBottom: 12 },
  backText: { color: "#1a3a5c", fontWeight: "700", fontSize: 14 },
  title: { fontSize: 28, fontWeight: "900", color: "#1a3a5c" },
  sub: { fontSize: 14, color: "rgba(26,58,92,0.6)", marginTop: 4 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  label: {
    fontSize: 10,
    fontWeight: "900",
    color: "#4D8FD9",
    letterSpacing: 1.2,
    marginBottom: 6,
    marginTop: 14,
  },
  hint: { fontSize: 11, color: "#aaa", marginTop: 4, marginBottom: 2 },
  roleRow: { flexDirection: "row", gap: 10, marginBottom: 4 },
  roleBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  roleBtnActive: { backgroundColor: "#1a3a5c", borderColor: "#1a3a5c" },
  roleTxt: { fontSize: 13, fontWeight: "700", color: "#666" },
  roleTxtActive: { color: "#fff" },
  lockBox: {
    backgroundColor: "#f5f8ff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginTop: 10,
  },
  lockText: { color: "#aaa", fontSize: 14, textAlign: "center" },
  pendingNote: {
    backgroundColor: "#FFF8E1",
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
    marginBottom: 4,
  },
  pendingText: {
    fontSize: 12,
    color: "#E65100",
    fontWeight: "600",
    textAlign: "center",
  },
});
