import { useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
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
import {
  deleteUser,
  editUser,
  getColleges,
  getSections,
} from "../services/api";

export default function AdminEditUserScreen({ route, navigation }) {
  const { user } = route.params;

  // Form state
  const [fullName, setFullName] = useState(user.fullName || "");
  const [birthday, setBirthday] = useState(
    user.birthday ? parseBirthday(user.birthday) : null,
  );
  const [birthdayStr, setBirthdayStr] = useState(user.birthday || "");
  const [schoolYear, setSchoolYear] = useState(user.schoolYear || "");
  const [studentId, setStudentId] = useState(user.studentId || "");
  const [instructorId, setInstructorId] = useState(user.instructorId || "");
  const [section, setSection] = useState(user.section || "");
  const [collegeId, setCollegeId] = useState(
    user.collegeId?._id || user.collegeId || "",
  );
  const [courseId, setCourseId] = useState(
    user.courseId?._id || user.courseId || "",
  );
  const collegeIdRef = useRef(user.collegeId?._id || user.collegeId || "");
  const courseIdRef = useRef(user.courseId?._id || user.courseId || "");

  const [colleges, setColleges] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({
    visible: false,
    title: "",
    message: "",
    type: "success",
  });

  // Preview generated username
  const previewUsername = birthdayStr
    ? birthdayStr.slice(0, 2) + birthdayStr.slice(3, 5)
    : user.username;

  useEffect(() => {
    getColleges()
      .then((r) =>
        setColleges(
          r.data.colleges.map((c) => ({ label: c.name, value: c._id })),
        ),
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    const cId = collegeIdRef.current;
    if (!cId) return;
    getSections(cId)
      .then((r) =>
        setCourses(
          r.data.sections.map((s) => ({ label: s.name, value: s._id })),
        ),
      )
      .catch(() => setCourses([]));
  }, [collegeId]);

  function parseBirthday(str) {
    if (!str) return null;
    const [mm, dd, yyyy] = str.split("/");
    return new Date(+yyyy, +mm - 1, +dd);
  }

  const handleCollegeChange = (val) => {
    collegeIdRef.current = val;
    setCollegeId(val);
  };
  const handleCourseChange = (val) => {
    courseIdRef.current = val;
    setCourseId(val);
  };

  const handleSave = async () => {
    if (!fullName.trim())
      return setPopup({
        visible: true,
        title: "Missing",
        message: "Full Name is required.",
        type: "error",
      });
    if (!schoolYear.trim())
      return setPopup({
        visible: true,
        title: "Missing",
        message: "School Year is required.",
        type: "error",
      });

    const payload = {
      fullName: fullName.trim(),
      birthday: birthdayStr || user.birthday,
      schoolYear: schoolYear.trim(),
      collegeId: collegeIdRef.current,
    };

    if (user.role === "student") {
      payload.courseId = courseIdRef.current;
      payload.section = section.trim();
      payload.studentId = studentId.trim();
    } else {
      payload.instructorId = instructorId.trim();
    }

    setLoading(true);
    try {
      const res = await editUser(user._id, payload);
      setPopup({
        visible: true,
        title: "Saved",
        message: `Changes saved. New username: ${res.data.user.username}`,
        type: "success",
      });
    } catch (err) {
      setPopup({
        visible: true,
        title: "Error",
        message: err.response?.data?.message || "Failed to save.",
        type: "error",
      });
    }
    setLoading(false);
  };

  const handleDelete = () => {
    Alert.alert("Delete User", `Permanently delete "${user.fullName}"? `, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteUser(user._id);
            navigation.goBack();
          } catch {
            setPopup({
              visible: true,
              title: "Error",
              message: "Failed to delete.",
              type: "error",
            });
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>
        Edit {user.role === "student" ? "Student" : "Instructor"}
      </Text>

      {/* Username preview */}
      <View style={styles.usernameBox}>
        <Text style={styles.usernameLabel}>Current Username</Text>
        <Text style={styles.usernameValue}>{previewUsername}</Text>
        {birthdayStr && birthdayStr !== user.birthday && (
          <Text style={styles.usernameHint}>
            ⚠️ Will update to {previewUsername} after save
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Personal Information</Text>

        <Input
          label="Full Name"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Full Name"
        />

        <DatePicker
          label="Birthday (changing this updates username)"
          value={birthday}
          onChange={(dateObj, dateStr) => {
            setBirthday(dateObj);
            setBirthdayStr(dateStr);
          }}
        />

        <Input
          label="School Year"
          value={schoolYear}
          onChangeText={setSchoolYear}
          placeholder="e.g. 2024-2025"
        />

        <Dropdown
          label="College"
          placeholder="Select College"
          options={colleges}
          value={collegeId}
          onChange={handleCollegeChange}
        />

        {/* Student-only fields */}
        {user.role === "student" && (
          <>
            <Text style={styles.sectionLabel}>Student Details</Text>
            <Input
              label="Student ID (changing this updates password)"
              value={studentId}
              onChangeText={setStudentId}
              placeholder="Student ID"
            />
            <Dropdown
              label="Course"
              placeholder={
                !collegeId ? "Select college first" : "Select Course"
              }
              options={courses}
              value={courseId}
              onChange={handleCourseChange}
              disabled={!collegeId}
            />
            <Input
              label="Section"
              value={section}
              onChangeText={setSection}
              placeholder="e.g. 4A"
              autoCapitalize="characters"
            />
          </>
        )}

        {/* Instructor-only fields */}
        {user.role === "instructor" && (
          <>
            <Text style={styles.sectionLabel}>Instructor Details</Text>
            <Input
              label="Instructor ID (changing this updates password)"
              value={instructorId}
              onChangeText={setInstructorId}
              placeholder="Instructor ID"
            />
          </>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 If Birthday is changed → Username auto-updates to MMDD{"\n"}
            💡 If ID is changed → Password auto-rehashes
          </Text>
        </View>

        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={loading}
          style={{ marginTop: 8 }}
        />

        <TouchableOpacity style={styles.deleteFullBtn} onPress={handleDelete}>
          <Text style={styles.deleteFullBtnText}>🗑 Delete This Account</Text>
        </TouchableOpacity>
      </View>

      <PopupModal
        visible={popup.visible}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        onClose={() => {
          setPopup({ ...popup, visible: false });
          if (popup.type === "success") navigation.goBack();
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6FF",
    padding: 20,
    paddingTop: 56,
  },
  back: { marginBottom: 16 },
  backText: { color: COLORS.blue, fontWeight: "600", fontSize: 15 },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  usernameBox: {
    backgroundColor: "#EEF0FF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  usernameLabel: { fontSize: 12, color: COLORS.gray, marginBottom: 4 },
  usernameValue: { fontSize: 22, fontWeight: "800", color: COLORS.blue },
  usernameHint: { fontSize: 12, color: "#E07B00", marginTop: 4 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 18,
    elevation: 2,
    marginBottom: 30,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.blue,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 6,
  },
  infoBox: {
    backgroundColor: "#FFF9E6",
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  infoText: { color: COLORS.gray, fontSize: 12, lineHeight: 18 },
  deleteFullBtn: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#FFE5E5",
    alignItems: "center",
  },
  deleteFullBtnText: { color: "#E53935", fontWeight: "700", fontSize: 15 },
});
