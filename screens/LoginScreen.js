import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../components/Button";
import PopupModal from "../components/PopupModal";
import { API_URL } from "../config";
import { useAuth } from "../contexts/AuthContext";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [popup, setPopup] = useState({
    visible: false,
    title: "",
    message: "",
    type: "success",
  });

  const handleLogin = async () => {
    if (!username.trim() || !password.trim())
      return setPopup({
        visible: true,
        title: "Missing Fields",
        message: "Please enter your username and password.",
        type: "error",
      });
    setLoading(true);
    // Wake up Render backend before login (prevents cold start timeout)
    try {
      await fetch(API_URL.replace("/api", "/ping"));
    } catch {}
    const result = await login(username.trim(), password.trim());
    setLoading(false);
    if (!result.success)
      setPopup({
        visible: true,
        title: "Login Failed",
        message: result.message,
        type: "error",
      });
    else {
      // For admin: navigate immediately via auth state (no popup delay)
      if (result.role === "admin") return;
      setPopup({
        visible: true,
        title: "Welcome Back!",
        message: "Redirecting to your dashboard...",
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
          {/* Logo — untouched */}
          <View style={s.logoArea}>
            <View style={s.logoOuterRing}>
              <View style={s.logoShadow}>
                <Image
                  source={require("../assets/logo.png")}
                  style={s.logoImg}
                  resizeMode="contain"
                />
              </View>
            </View>
            <Text style={s.tagline}>YOUR LEARNING PORTAL</Text>
          </View>

          {/* Card */}
          <View style={s.card}>
            {/* Header */}
            <Text style={s.cardTitle}>Sign In</Text>
            <View style={s.titleBar} />
            <Text style={s.cardSub}>Welcome back, learner!</Text>

            {/* Username */}
            <View style={s.fieldWrap}>
              <View
                style={[
                  s.fieldBox,
                  focusedField === "username" && s.fieldBoxFocused,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={focusedField === "username" ? "#4D8FD9" : "#aab"}
                  style={s.fieldIcon}
                />
                <TextInput
                  style={s.fieldInput}
                  placeholder="Username (MMDD format)"
                  placeholderTextColor="#BBC"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Password */}
            <View style={s.fieldWrap}>
              <View
                style={[
                  s.fieldBox,
                  focusedField === "password" && s.fieldBoxFocused,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={focusedField === "password" ? "#4D8FD9" : "#aab"}
                  style={s.fieldIcon}
                />
                <TextInput
                  style={s.fieldInput}
                  placeholder="Password (Your ID Number)"
                  placeholderTextColor="#BBC"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={s.eyeBtn}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={showPassword ? "#4D8FD9" : "#aab"}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot */}
            <TouchableOpacity
              onPress={() => navigation.navigate("ForgotPassword")}
              style={s.forgotRow}
            >
              <Text style={s.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login button */}
            <Button title="Login" onPress={handleLogin} loading={loading} />

            {/* Divider */}
            <View style={s.divider}>
              <View style={s.divLine} />
              <View style={s.orPill}>
                <Text style={s.orText}>OR</Text>
              </View>
              <View style={s.divLine} />
            </View>

            {/* Register */}
            <TouchableOpacity
              style={s.registerBtn}
              onPress={() => navigation.navigate("Register")}
            >
              <Text style={s.registerTxt}>Create New Account</Text>
            </TouchableOpacity>
          </View>

          {/* Hint */}
          <View style={s.hintPill}>
            <Text style={s.hintText}>
              💡 Username: MMDD • Password: Your ID
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <PopupModal
        visible={popup.visible}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup({ ...popup, visible: false })}
      />
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 36,
  },

  // Logo — unchanged
  logoArea: { alignItems: "center", marginBottom: 24 },
  logoOuterRing: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  logoShadow: {
    elevation: 25,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 15,
    borderRadius: 40,
    backgroundColor: "#fff",
  },
  logoImg: { width: 120, height: 120, borderRadius: 40 },
  tagline: {
    fontSize: 11,
    fontWeight: "900",
    color: "#1a3a5c",
    marginTop: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  // Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 28,
    elevation: 16,
    shadowColor: "#1a3a5c",
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#1a3a5c",
    textAlign: "center",
  },
  titleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#4DD9C0",
    borderRadius: 4,
    alignSelf: "center",
    marginTop: 6,
    marginBottom: 8,
  },
  cardSub: {
    fontSize: 14,
    color: "#8896A8",
    textAlign: "center",
    marginBottom: 28,
  },

  // Fields
  fieldWrap: { marginBottom: 16 },
  fieldBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F7FF",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E8EEFF",
    paddingHorizontal: 14,
    height: 54,
  },
  fieldBoxFocused: { borderColor: "#4D8FD9", backgroundColor: "#EFF5FF" },
  fieldIcon: { marginRight: 10 },
  fieldInput: { flex: 1, fontSize: 15, color: "#1a3a5c", fontWeight: "500" },
  eyeBtn: { padding: 6 },

  // Forgot
  forgotRow: { alignSelf: "flex-end", marginBottom: 20, marginTop: -4 },
  forgotText: { color: "#4D8FD9", fontSize: 13, fontWeight: "700" },

  // Divider
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  divLine: { flex: 1, height: 1, backgroundColor: "#EEF2F8" },
  orPill: {
    marginHorizontal: 12,
    backgroundColor: "#F4F7FF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#E8EEFF",
  },
  orText: { color: "#8896A8", fontSize: 11, fontWeight: "900" },

  // Register
  registerBtn: {
    borderWidth: 2,
    borderColor: "#1a3a5c",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  registerTxt: { color: "#1a3a5c", fontWeight: "900", fontSize: 15 },

  // Hint
  hintPill: {
    marginTop: 24,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  hintText: { color: "#1a3a5c", fontSize: 12, fontWeight: "800" },
});
