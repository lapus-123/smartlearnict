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
import { COLORS } from "../config";
import { useAuth } from "../contexts/AuthContext";

const { width } = Dimensions.get("window");

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
          {/* Logo area */}
          <View style={s.logoArea}>
            <View style={s.logoShadow}>
              <Image
                source={require("../assets/logo.png")}
                style={s.logoImg}
                resizeMode="contain"
              />
            </View>
            <Text style={s.appName}>SmartLearnICT</Text>
            <Text style={s.tagline}>Your Learning Portal</Text>
          </View>

          {/* Card */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Sign In</Text>
            <Text style={s.cardSub}>Enter your credentials to continue</Text>

            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>USERNAME</Text>
              <Input
                placeholder="MMDD format (e.g. 0115)"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>PASSWORD</Text>
              <Input
                placeholder="Your ID Number"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
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
              <Text style={s.divText}>or</Text>
              <View style={s.divLine} />
            </View>

            <TouchableOpacity
              style={s.registerBtn}
              onPress={() => navigation.navigate("Register")}
            >
              <Text style={s.registerTxt}>Create an Account</Text>
            </TouchableOpacity>
          </View>

          {/* Hint pill */}
          <View style={s.hintPill}>
            <Text style={s.hintText}>
              💡 Username = MMDD · Password = Your ID Number
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
    paddingVertical: 48,
  },

  // Logo
  logoArea: { alignItems: "center", marginBottom: 36 },
  logoShadow: {
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    borderRadius: 35,
    marginBottom: 14,
  },
  logoImg: {
    width: 200,
    height: 200,
    backgroundColor: "#ffffff",
    borderRadius: 35,
  },
  appName: {
    fontSize: 26,
    fontWeight: "900",
    color: "#1a3a5c",
    letterSpacing: 0.5,
  },
  tagline: { fontSize: 13, color: "rgba(26,58,92,0.65)", marginTop: 4 },

  // Card
  card: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 28,
    padding: 28,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1a3a5c",
    marginBottom: 4,
  },
  cardSub: { fontSize: 13, color: "#999", marginBottom: 24 },

  inputGroup: { marginBottom: 4 },
  inputLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1a3a5c",
    letterSpacing: 1,
    marginBottom: 4,
  },

  forgotRow: { alignItems: "flex-end", marginBottom: 16, marginTop: 4 },
  forgotText: { color: COLORS.blue, fontSize: 13, fontWeight: "700" },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 16,
  },
  divLine: { flex: 1, height: 1, backgroundColor: "#EAEEF8" },
  divText: { color: "#bbb", fontSize: 12, fontWeight: "600" },

  registerBtn: {
    borderWidth: 2,
    borderColor: "#1a3a5c",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  registerTxt: { color: "#1a3a5c", fontWeight: "800", fontSize: 15 },

  hintPill: {
    marginTop: 20,
    backgroundColor: "rgba(255,255,255,0.4)",
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignSelf: "center",
  },
  hintText: {
    color: "#1a3a5c",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});
