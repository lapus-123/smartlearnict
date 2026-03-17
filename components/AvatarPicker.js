import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { uploadAvatar } from "../services/api";

const { width: SW, height: SH } = Dimensions.get("window");

export default function AvatarPicker({ size = 90 }) {
  const { currentUser, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [viewing, setViewing] = useState(false);

  const initials = currentUser?.fullName?.charAt(0)?.toUpperCase() || "?";
  const avatarUrl = currentUser?.avatarUrl;

  const handlePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow access to your photo library.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets?.length) return;

    const formData = new FormData();
    formData.append("avatar", {
      uri: result.assets[0].uri,
      name: "avatar.jpg",
      type: "image/jpeg",
    });

    setViewing(false);
    setUploading(true);
    try {
      const res = await uploadAvatar(formData);
      await updateUser({ avatarUrl: res.data.avatarUrl });
    } catch {
      Alert.alert(
        "Upload failed",
        "Could not upload profile picture. Try again.",
      );
    }
    setUploading(false);
  };

  return (
    <>
      {/* Avatar circle — tap to view */}
      <TouchableOpacity
        onPress={() => setViewing(true)}
        style={[
          styles.wrap,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
        activeOpacity={0.85}
      >
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: size, height: size, borderRadius: size / 2 }}
          />
        ) : (
          <View
            style={[
              styles.placeholder,
              { width: size, height: size, borderRadius: size / 2 },
            ]}
          >
            <Text style={[styles.initials, { fontSize: size * 0.38 }]}>
              {initials}
            </Text>
          </View>
        )}
        {uploading && (
          <View style={styles.overlay}>
            <ActivityIndicator color="#fff" />
          </View>
        )}
        {/* Camera badge */}
        <View style={styles.camBadge}>
          <Text style={styles.camIcon}>📷</Text>
        </View>
      </TouchableOpacity>

      {/* Full-screen view modal */}
      <Modal
        visible={viewing}
        transparent
        animationType="fade"
        onRequestClose={() => setViewing(false)}
      >
        <View style={styles.modalBg}>
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setViewing(false)}
          >
            <Text style={styles.closeTxt}>✕</Text>
          </TouchableOpacity>

          {/* Full avatar */}
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={styles.fullImg}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.fullPlaceholder}>
              <Text style={styles.fullInitials}>{initials}</Text>
            </View>
          )}

          {/* Name */}
          <Text style={styles.modalName}>{currentUser?.fullName}</Text>

          {/* Change photo button */}
          <TouchableOpacity style={styles.changeBtn} onPress={handlePick}>
            <Text style={styles.changeTxt}>📷 Change Profile Photo</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "relative", marginBottom: 12 },
  placeholder: {
    backgroundColor: "rgba(26,63,122,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  initials: { color: "#fff", fontWeight: "900" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  camBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 12,
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  camIcon: { fontSize: 13 },

  // Modal
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  closeBtn: {
    position: "absolute",
    top: 52,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeTxt: { color: "#fff", fontSize: 18, fontWeight: "700" },
  fullImg: {
    width: SW * 0.75,
    height: SW * 0.75,
    borderRadius: SW * 0.375,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  fullPlaceholder: {
    width: SW * 0.75,
    height: SW * 0.75,
    borderRadius: SW * 0.375,
    backgroundColor: "#1a3f7a",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  fullInitials: { color: "#fff", fontSize: SW * 0.28, fontWeight: "900" },
  modalName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 20,
    marginBottom: 32,
  },
  changeBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  changeTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
