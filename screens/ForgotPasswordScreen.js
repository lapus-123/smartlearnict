import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../components/Button";
import Input from "../components/Input";
import PopupModal from "../components/PopupModal";
import { API_URL, COLORS } from "../config";
import { forgotPassword } from "../services/api";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({
    visible: false,
    title: "",
    message: "",
    type: "success",
  });

  const handleSubmit = async () => {
    if (!email.trim())
      return setPopup({
        visible: true,
        title: "Missing",
        message: "Please enter your email address.",
        type: "error",
      });

    setLoading(true);
    try {
      // Wake up backend first to avoid cold start timeout
      try {
        await fetch(API_URL.replace("/api", "/ping"));
      } catch {}
      const r = await forgotPassword({ email: email.trim() });
      setPopup({
        visible: true,
        title: "Email Sent",
        message: r.data.message,
        type: "success",
      });
      setEmail("");
    } catch (err) {
      setPopup({
        visible: true,
        title: "Error",
        message:
          err.response?.data?.message ||
          "Connection error. Please wait a moment and try again.",
        type: "error",
      });
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.back}
        >
          <Text style={styles.backText}>← Back to Login</Text>
        </TouchableOpacity>

        {/* Icon + header */}
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>🔑</Text>
        </View>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.sub}>
          Enter your registered email address and we'll send your login
          credentials to your inbox.
        </Text>

        {/* Form */}
        <View style={styles.card}>
          <Input
            label="Email Address"
            placeholder="e.g. juan@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Button
            title={loading ? "Sending..." : "Send My Credentials"}
            onPress={handleSubmit}
            loading={loading}
          />
        </View>

        <Text style={styles.note}>
          Only Student and Instructor accounts can use this feature.
        </Text>
      </ScrollView>

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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#F4F6FF" },
  container: { padding: 24, paddingTop: 60, alignItems: "center" },
  back: { alignSelf: "flex-start", marginBottom: 32 },
  backText: { color: COLORS.blue, fontWeight: "600", fontSize: 14 },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EEF0FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  icon: { fontSize: 36 },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#1a3a5c",
    marginBottom: 10,
  },
  sub: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    width: "100%",
    marginBottom: 20,
  },
  note: {
    fontSize: 12,
    color: "#aaa",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
