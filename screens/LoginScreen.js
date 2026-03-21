import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Dimensions,
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

const { width } = Dimensions.get("window");

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

          {/* Card */}
          <View style={s.card}>
            <View style={s.cardAccent} />

            <View style={s.cardHeader}>
              <Text style={s.cardTitle}>Sign In</Text>
              {/* FIX: replaced <div> with <View> */}
              <View style={s.titleUnderline} />
              <Text style={s.cardSub}>Enter your credentials</Text>
            </View>

            <View style={s.inputContainer}>
              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>USERNAME</Text>
                <Input
                  placeholder="MMDD format"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>

              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>PASSWORD</Text>
                <View style={s.passwordContainer}>
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
                      color="#1a3a5c"
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

            <Button title="Login" onPress={handleLogin} loading={loading} />

            <View style={s.divider}>
              <View style={s.divLine} />
              <Text style={s.divText}>OR</Text>
              <View style={s.divLine} />
            </View>

            <TouchableOpacity
              style={s.registerBtn}
              onPress={() => navigation.navigate("Register")}
            >
              <Text style={s.registerTxt}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {/* Hint */}
          <View style={s.hintPill}>
            <Text style={s.hintText}>💡 Hint: MMDD & ID Number</Text>
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
    paddingHorizontal: 45,
    paddingVertical: 30,
  },
  logoArea: { alignItems: "center", marginBottom: 25 },
  logoOuterRing: {
    padding: 10,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  logoShadow: {
    elevation: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 15,
    borderRadius: 40,
    backgroundColor: "#fff",
  },
  logoImg: { width: 130, height: 130, borderRadius: 40 },
  tagline: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1a3a5c",
    marginTop: 10,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    opacity: 0.8,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingBottom: 24,
    width: "100%",
    maxWidth: 320,
    alignSelf: "center",
    elevation: 15,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    overflow: "hidden",
  },
  cardAccent: {
    height: 4,
    width: "30%",
    backgroundColor: "#4D8FD9",
    alignSelf: "center",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginBottom: 20,
  },
  cardHeader: { marginBottom: 18, alignItems: "center" },
  cardTitle: { fontSize: 24, fontWeight: "900", color: "#1a3a5c" },
  titleUnderline: {
    height: 3,
    width: 25,
    backgroundColor: "#4DD9C0",
    borderRadius: 2,
    marginTop: 2,
    marginBottom: 6,
  },
  cardSub: { fontSize: 12, color: "#6D7993", fontWeight: "600" },
  inputContainer: { gap: 2 },
  inputGroup: { marginBottom: 10 },
  inputLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#4D8FD9",
    letterSpacing: 1,
    marginBottom: 4,
    marginLeft: 2,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    height: "100%",
    justifyContent: "center",
    paddingLeft: 10,
  },
  forgotRow: { alignSelf: "flex-end", marginBottom: 12 },
  forgotText: {
    color: "#1a3a5c",
    fontSize: 11,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 14 },
  divLine: { flex: 1, height: 1, backgroundColor: "#EEE" },
  divText: {
    color: "#CCC",
    fontSize: 10,
    fontWeight: "900",
    marginHorizontal: 10,
  },
  registerBtn: {
    borderWidth: 1.5,
    borderColor: "#1a3a5c",
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: "center",
  },
  registerTxt: { color: "#1a3a5c", fontWeight: "900", fontSize: 13 },
  hintPill: {
    marginTop: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: "center",
  },
  hintText: { color: "#1a3a5c", fontSize: 11, fontWeight: "700" },
});
