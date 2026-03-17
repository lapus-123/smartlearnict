import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Image,
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
import { COLORS } from "../config";
import { useAuth } from "../contexts/AuthContext";
import { getColleges, getSections } from "../services/api";

const ROLES = [
  { label: "Student", value: "student", icon: "🎓" },
  { label: "Instructor / Professor", value: "instructor", icon: "📚" },
];

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();

  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [collegeError, setCollegeError] = useState(false);
  const [popup, setPopup] = useState({
    visible: false,
    title: "",
    message: "",
    type: "success",
  });

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState(null);
  const [birthdayStr, setBirthdayStr] = useState("");
  const [schoolYear, setSchoolYear] = useState("");
  const [studentId, setStudentId] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [section, setSection] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [courseId, setCourseId] = useState("");
  const collegeIdRef = useRef("");
  const courseIdRef = useRef("");
  const [colleges, setColleges] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadingColleges, setLoadingColleges] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    collegeIdRef.current = collegeId;
  }, [collegeId]);
  useEffect(() => {
    courseIdRef.current = courseId;
  }, [courseId]);

  const loadColleges = () => {
    setLoadingColleges(true);
    setCollegeError(false);
    getColleges()
      .then((res) =>
        setColleges(
          res.data.colleges.map((c) => ({ label: c.name, value: c._id })),
        ),
      )
      .catch(() => setCollegeError(true))
      .finally(() => setLoadingColleges(false));
  };

  useEffect(() => {
    loadColleges();
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
      .then((res) =>
        setCourses(
          res.data.sections.map((s) => ({ label: s.name, value: s._id })),
        ),
      )
      .catch(() => setCourses([]))
      .finally(() => setLoadingCourses(false));
  }, [collegeId]);

  const handleCollegeChange = (val) => {
    collegeIdRef.current = val;
    setCollegeId(val);
  };
  const handleCourseChange = (val) => {
    courseIdRef.current = val;
    setCourseId(val);
  };

  const handleRegister = async () => {
    const cId = collegeIdRef.current;
    const crId = courseIdRef.current;

    if (!role)
      return setPopup({
        visible: true,
        title: "Select Role",
        message: "Please select Student or Instructor.",
        type: "error",
      });
    if (!fullName.trim())
      return setPopup({
        visible: true,
        title: "Missing Fields",
        message: "Please enter your full name.",
        type: "error",
      });
    if (!email.trim())
      return setPopup({
        visible: true,
        title: "Missing Fields",
        message: "Please enter your email address.",
        type: "error",
      });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return setPopup({
        visible: true,
        title: "Invalid Email",
        message: "Please enter a valid email address.",
        type: "error",
      });
    if (!birthdayStr)
      return setPopup({
        visible: true,
        title: "Missing Fields",
        message: "Please select your birthday.",
        type: "error",
      });
    if (!cId)
      return setPopup({
        visible: true,
        title: "Missing Fields",
        message: "Please select a College.",
        type: "error",
      });
    if (!schoolYear.trim())
      return setPopup({
        visible: true,
        title: "Missing Fields",
        message: "Please enter School Year (e.g. 2024-2025).",
        type: "error",
      });

    if (role === "student") {
      if (!studentId.trim())
        return setPopup({
          visible: true,
          title: "Missing Fields",
          message: "Please enter your Student ID.",
          type: "error",
        });
      if (!crId)
        return setPopup({
          visible: true,
          title: "Missing Fields",
          message: "Please select a Course (e.g. BSIT).",
          type: "error",
        });
      if (!section.trim())
        return setPopup({
          visible: true,
          title: "Missing Fields",
          message: "Please enter your Section (e.g. 4A).",
          type: "error",
        });
    }
    if (role === "instructor" && !instructorId.trim())
      return setPopup({
        visible: true,
        title: "Missing Fields",
        message: "Please enter your Instructor ID.",
        type: "error",
      });

    const payload = {
      role,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      birthday: birthdayStr,
      collegeId: cId,
      schoolYear: schoolYear.trim(),
      ...(role === "student"
        ? {
            studentId: studentId.trim(),
            courseId: crId,
            section: section.trim(),
          }
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
      const msg = result.pending
        ? "Your account has been submitted for Admin approval. You will be able to log in once approved."
        : result.hint || "Account created! You can now log in.";
      setPopup({
        visible: true,
        title: result.pending ? "⏳ Pending Approval" : "✅ Registered!",
        message: msg,
        type: "success",
      });
    }
  };

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
          {/* Logo */}
          <View style={s.logoArea}>
            <View style={s.logoShadow}>
              <Image
                source={require("../assets/logo.png")}
                style={s.logoImg}
                resizeMode="contain"
              />
            </View>
            <Text style={s.appName}>SmartLearnICT</Text>
            <Text style={s.tagline}>Create your account</Text>
          </View>

          {/* Card */}
          <View style={s.card}>
            {/* Role selector */}
            <SectionHeader label="I am a..." />
            <View style={s.roleRow}>
              {ROLES.map((r) => (
                <TouchableOpacity
                  key={r.value}
                  style={[s.roleBtn, role === r.value && s.roleBtnActive]}
                  onPress={() => setRole(r.value)}
                  activeOpacity={0.8}
                >
                  <Text style={s.roleIcon}>{r.icon}</Text>
                  <Text
                    style={[s.roleLabel, role === r.value && s.roleLabelActive]}
                  >
                    {r.label}
                  </Text>
                  {role === r.value && (
                    <View style={s.roleCheck}>
                      <Text style={s.roleCheckText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Lock overlay prompt — shown when no role selected */}
            {!role && (
              <View style={s.lockBox}>
                <Text style={s.lockIcon}>☝️</Text>
                <Text style={s.lockTitle}>Select your role above</Text>
                <Text style={s.lockSub}>
                  Choose Student or Instructor to continue filling out the form.
                </Text>
              </View>
            )}

            {/* All form fields — only shown after role is picked */}
            {!!role && (
              <>
                {/* Personal info */}
                <SectionHeader label="Personal Information" />
                <Input
                  label="Full Name"
                  placeholder="Juan Dela Cruz"
                  value={fullName}
                  onChangeText={setFullName}
                />
                <Input
                  label="Email Address"
                  placeholder="e.g. juan@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <DatePicker
                  label="Birthday"
                  value={birthday}
                  onChange={(obj, str) => {
                    setBirthday(obj);
                    setBirthdayStr(str);
                  }}
                />

                {/* Academic info */}
                <SectionHeader label="Academic Info" />
                {collegeError ? (
                  <View style={s.retryBox}>
                    <Text style={s.retryText}>⚠️ Failed to load colleges.</Text>
                    <TouchableOpacity style={s.retryBtn} onPress={loadColleges}>
                      <Text style={s.retryBtnText}>Tap to Retry</Text>
                    </TouchableOpacity>
                    <Text style={s.retryHint}>
                      Make sure the backend is running and your IP in config.js
                      is correct.
                    </Text>
                  </View>
                ) : (
                  <Dropdown
                    label="College / Department"
                    placeholder={
                      loadingColleges ? "Loading colleges..." : "Select College"
                    }
                    options={colleges}
                    value={collegeId}
                    onChange={handleCollegeChange}
                    disabled={loadingColleges}
                  />
                )}
                <Input
                  label="School Year"
                  placeholder="e.g. 2024-2025"
                  value={schoolYear}
                  onChangeText={setSchoolYear}
                />

                {/* Student fields */}
                {role === "student" && (
                  <>
                    <SectionHeader label="Student Details" />
                    <Input
                      label="Student ID "
                      placeholder="e.g. 2021-00123"
                      value={studentId}
                      onChangeText={setStudentId}
                    />
                    <Dropdown
                      label="Course (e.g. BSIT, BSCS)"
                      placeholder={
                        !collegeId
                          ? "Select a college first"
                          : loadingCourses
                            ? "Loading courses..."
                            : courses.length === 0
                              ? "No courses found"
                              : "Select Course"
                      }
                      options={courses}
                      value={courseId}
                      onChange={handleCourseChange}
                      disabled={!collegeId || loadingCourses}
                    />
                    <Input
                      label="Section (e.g. 4A, 3B)"
                      placeholder="e.g. 4A"
                      value={section}
                      onChangeText={setSection}
                      autoCapitalize="characters"
                    />
                  </>
                )}

                {/* Instructor fields */}
                {role === "instructor" && (
                  <>
                    <SectionHeader label="Instructor Details" />
                    <Input
                      label="Instructor ID "
                      placeholder="e.g. INS-2021-001"
                      value={instructorId}
                      onChangeText={setInstructorId}
                    />
                  </>
                )}

                {/* Hint */}
                <View style={s.hintBox}>
                  <Text style={s.hintIcon}>💡</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.hintText}>
                      Username = MMDD from your birthday
                    </Text>
                    <Text style={s.hintText}>
                      Password = your{" "}
                      {role === "student" ? "Student ID" : "Instructor ID"}
                    </Text>
                  </View>
                </View>
              </>
            )}

            <Button
              title="Register"
              onPress={handleRegister}
              loading={loading}
              style={{ marginTop: 12 }}
              disabled={!role}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
              style={s.loginRow}
            >
              <Text style={s.loginText}>
                Already have an account?{" "}
                <Text style={s.loginBold}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 24 }} />
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

const SectionHeader = ({ label }) => (
  <View style={s.sectionHeader}>
    <View style={s.sectionLine} />
    <Text style={s.sectionLabel}>{label}</Text>
    <View style={s.sectionLine} />
  </View>
);

const s = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 40,
  },

  // Logo
  logoArea: { alignItems: "center", marginBottom: 28 },
  logoShadow: {
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    borderRadius: 35,
    marginBottom: 12,
  },
  logoImg: {
    width: 100,
    height: 100,
    backgroundColor: "#ffffff",
    borderRadius: 35,
  },
  appName: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1a3a5c",
    letterSpacing: 0.5,
  },
  tagline: { fontSize: 13, color: "rgba(26,58,92,0.65)", marginTop: 4 },

  // Card
  card: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 28,
    padding: 24,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 20,
  },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    marginBottom: 12,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: "#EAEEF8" },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1a3a5c",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  // Role
  roleRow: { flexDirection: "row", gap: 12, marginBottom: 4 },
  roleBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#E0E4F0",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    backgroundColor: "#F8FAFF",
    position: "relative",
  },
  roleBtnActive: { borderColor: COLORS.blue, backgroundColor: "#EEF2FF" },
  roleIcon: { fontSize: 28, marginBottom: 6 },
  roleLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    textAlign: "center",
  },
  roleLabelActive: { color: COLORS.blue, fontWeight: "800" },
  roleCheck: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  roleCheckText: { color: "#fff", fontSize: 10, fontWeight: "900" },

  // Hint
  hintBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#F59E0B",
  },
  hintIcon: { fontSize: 16 },
  hintText: { fontSize: 12, color: "#92400E", lineHeight: 19 },

  // Retry
  retryBox: {
    borderWidth: 1.5,
    borderColor: "#FFCC00",
    backgroundColor: "#FFFDE6",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    alignItems: "center",
  },
  retryText: {
    fontSize: 13,
    color: "#856404",
    fontWeight: "600",
    marginBottom: 8,
  },
  retryBtn: {
    backgroundColor: COLORS.blue,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  retryBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  retryHint: { fontSize: 11, color: "#999", marginTop: 8, textAlign: "center" },

  loginRow: { alignItems: "center", marginTop: 16 },
  loginText: { color: "#999", fontSize: 14 },
  loginBold: { color: COLORS.blue, fontWeight: "800" },

  lockBox: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: "#F8FAFF",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E0E4F0",
    borderStyle: "dashed",
    marginTop: 8,
    marginBottom: 4,
  },
  lockIcon: { fontSize: 32, marginBottom: 8 },
  lockTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1a3a5c",
    marginBottom: 4,
  },
  lockSub: { fontSize: 13, color: "#999", textAlign: "center", lineHeight: 19 },
});
