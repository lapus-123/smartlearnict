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
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../components/Button";
import Input from "../components/Input";
import PopupModal from "../components/PopupModal";
import { useAuth } from "../contexts/AuthContext";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
    const result = await login(username.trim(), password.trim());
    setLoading(false);
    if (!result.success)
      setPopup({
        visible: true,
        title: "Login Failed",
        message: result.message,
        type: "error",
      });
    else
      setPopup({
        visible: true,
        title: "Welcome Back!",
        message: "Redirecting to your dashboard...",
        type: "success",
      });
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
          {/* Logo Area */}
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
            <Text style={s.tagline}>Your Learning Portal</Text>
          </View>

          {/* Designer Card */}
          <View style={s.card}>
            <View style={s.cardAccent} />

            <View style={s.cardHeader}>
              <Text style={s.cardTitle}>Sign In</Text>
              <View style={s.titleUnderline} />
              <Text style={s.cardSub}>Welcome back, learner!</Text>
            </View>

            <View style={s.inputContainer}>
              {/* Username Input */}
              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>USERNAME</Text>
                <View style={s.iconInputWrapper}>
                  <Input
                    placeholder="MMDD format"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                  <Ionicons
                    name="person-outline"
                    size={18}
                    color="#4D8FD9"
                    style={s.inputIcon}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>PASSWORD</Text>
                <View style={s.iconInputWrapper}>
                  <Input
                    placeholder="Your ID Number"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={s.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={showPassword ? "#4D8FD9" : "#1a3a5c"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate("ForgotPassword")}
              style={s.forgotRow}
            >
              <Text style={s.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <View style={s.buttonShadow}>
              <Button title="Login" onPress={handleLogin} loading={loading} />
            </View>

            <View style={s.divider}>
              <View style={s.divLine} />
              <View style={s.orCircle}>
                <Text style={s.divText}>OR</Text>
              </View>
              <View style={s.divLine} />
            </View>

            <TouchableOpacity
              style={s.registerBtn}
              onPress={() => navigation.navigate("Register")}
            >
              <Text style={s.registerTxt}>Create New Account</Text>
            </TouchableOpacity>
          </View>

          {/* Compact Hint */}
          <View style={s.hintPill}>
            <Text style={s.hintText}>💡 Username: MMDD • Password: ID</Text>
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
    paddingHorizontal: 40,
    paddingVertical: 30,
  },

  // Logo Area - More contrast
  logoArea: { alignItems: "center", marginBottom: 20 },
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

  // The Card - Advanced Glassmorphism
  card: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 32,
    paddingHorizontal: 22,
    paddingBottom: 24,
    width: "100%",
    maxWidth: 325,
    alignSelf: "center",
    elevation: 20,
    shadowColor: "#1a3a5c",
    shadowOpacity: 0.15,
    shadowRadius: 25,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.7)",
    overflow: "hidden",
  },
  cardAccent: {
    height: 4,
    width: "25%",
    backgroundColor: "#4D8FD9",
    alignSelf: "center",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginBottom: 20,
  },
  cardHeader: { marginBottom: 16, alignItems: "center" },
  cardTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#1a3a5c",
    letterSpacing: -0.5,
  },
  titleUnderline: {
    height: 3,
    width: 30,
    backgroundColor: "#4DD9C0",
    borderRadius: 10,
    marginTop: 4,
    marginBottom: 6,
  },
  cardSub: { fontSize: 13, color: "#6D7993", fontWeight: "600", opacity: 0.8 },

  inputContainer: { gap: 4 },
  inputGroup: { marginBottom: 12 },
  inputLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#4D8FD9",
    letterSpacing: 1.2,
    marginBottom: 6,
    marginLeft: 4,
  },

  // Symmetrical Icon Inputs
  iconInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  inputIcon: {
    position: "absolute",
    right: 14,
    opacity: 0.6,
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    height: "100%",
    paddingHorizontal: 4,
    justifyContent: "center",
  },

  forgotRow: { alignSelf: "flex-end", marginBottom: 14, paddingRight: 4 },
  forgotText: {
    color: "#1a3a5c",
    fontSize: 11,
    fontWeight: "800",
    textDecorationLine: "underline",
    opacity: 0.8,
  },

  // Button Shadow for primary action
  buttonShadow: {
    shadowColor: "#4D8FD9",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  divider: { flexDirection: "row", alignItems: "center", marginVertical: 18 },
  divLine: { flex: 1, height: 1.2, backgroundColor: "#EEF2F6" },
  orCircle: {
    marginHorizontal: 12,
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  divText: { color: "#94A3B8", fontSize: 10, fontWeight: "900" },

  registerBtn: {
    borderWidth: 1.8,
    borderColor: "#1a3a5c",
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  registerTxt: { color: "#1a3a5c", fontWeight: "900", fontSize: 14 },

  hintPill: {
    marginTop: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  hintText: { color: "#1a3a5c", fontSize: 11, fontWeight: "800", opacity: 0.9 },
});
