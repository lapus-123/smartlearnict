import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../config";
import { useAuth } from "../contexts/AuthContext";
import {
  createComment,
  deleteComment,
  getComments,
  getProgress,
  saveProgress,
  updateComment,
} from "../services/api";
import { trackMaterial } from "../utils/resumeTracker";

const FILE_META = {
  pdf: { icon: "📄", label: "PDF Document", color: "#E53935" },
  docx: { icon: "📝", label: "Word Document", color: "#1976D2" },
  doc: { icon: "📝", label: "Word Document", color: "#1976D2" },
  ppt: { icon: "📊", label: "PowerPoint", color: "#E65100" },
  pptx: { icon: "📊", label: "PowerPoint", color: "#E65100" },
  mp4: { icon: "🎬", label: "Video", color: "#7B2FBE" },
  mov: { icon: "🎬", label: "Video", color: "#7B2FBE" },
  webm: { icon: "🎬", label: "Video", color: "#7B2FBE" },
  jpg: { icon: "🖼️", label: "Image", color: "#2d9e5f" },
  jpeg: { icon: "🖼️", label: "Image", color: "#2d9e5f" },
  png: { icon: "🖼️", label: "Image", color: "#2d9e5f" },
};

const formatDate = (d) => {
  const date = new Date(d);
  return (
    date.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }) +
    " • " +
    date.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })
  );
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function CommentInput({
  value,
  onChange,
  onSubmit,
  onCancel,
  editingId,
  posting,
}) {
  return (
    <View style={cs.inputCard}>
      <TextInput
        style={cs.input}
        placeholder={editingId ? "Edit your comment..." : "Write a comment..."}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChange}
        multiline
        maxLength={1000}
        textAlignVertical="top"
      />
      <View style={cs.inputFooter}>
        <Text style={cs.charCount}>{value.length}/1000</Text>
        <View style={cs.inputBtns}>
          {editingId && (
            <TouchableOpacity style={cs.cancelBtn} onPress={onCancel}>
              <Text style={cs.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[cs.postBtn, (!value.trim() || posting) && cs.postBtnOff]}
            onPress={onSubmit}
            disabled={posting || !value.trim()}
          >
            {posting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={cs.postText}>{editingId ? "Update" : "Post"}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const URL_REGEX = /(https?:\/\/[^\s]+)/g;
function LinkText({ text, style }) {
  const parts = text.split(URL_REGEX);
  return (
    <Text style={style}>
      {parts.map((part, i) =>
        URL_REGEX.test(part) ? (
          <Text
            key={i}
            style={cs.link}
            onPress={() =>
              Linking.openURL(part).catch(() =>
                Alert.alert("Error", "Could not open link."),
              )
            }
          >
            {part}
          </Text>
        ) : (
          <Text key={i}>{part}</Text>
        ),
      )}
    </Text>
  );
}

function CommentItem({ item, currentUserId, onEdit, onDelete }) {
  const isOwn =
    item.userId === currentUserId || item.userId?._id === currentUserId;
  return (
    <View style={cs.item}>
      <View style={cs.avatar}>
        <Text style={cs.avatarText}>
          {item.userFullName?.[0]?.toUpperCase() || "?"}
        </Text>
      </View>
      <View style={cs.body}>
        <View style={cs.commentHeaderRow}>
          <Text style={cs.name}>{item.userFullName}</Text>
          <Text style={cs.date}>{formatDate(item.createdAt)}</Text>
        </View>
        <LinkText text={item.text} style={cs.text} />
        {isOwn && (
          <View style={cs.actions}>
            <TouchableOpacity onPress={() => onEdit(item)}>
              <Text style={cs.actionEdit}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(item._id)}>
              <Text style={cs.actionDel}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function MaterialViewerScreen({ route, navigation }) {
  const { material } = route.params;
  const { currentUser } = useAuth();

  const ft = material.fileType?.toLowerCase();
  const meta = FILE_META[ft] || { icon: "📎", label: "File", color: "#555" };
  const materialId =
    material._id?.toString() ||
    material.id?.toString() ||
    material.materialId?.toString();
  const userId = currentUser?.id || currentUser?._id;
  const subjectName = material.subjectId?.name || material.subjectName || "";
  const isVideo = ["mp4", "mov", "webm"].includes(ft);
  const hasMultipleFiles = material.files?.length > 1;

  const [progress, setProgress] = useState(0);
  const [watched, setWatched] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [posting, setPosting] = useState(false);
  const [cLoading, setCLoading] = useState(true);

  // FIX 1: Save initial progress + load comments on mount
  useEffect(() => {
    if (userId) trackMaterial(userId, material);

    getProgress(materialId)
      .then((r) => {
        const saved = r.data.progress || 0;
        setProgress(saved);
        setWatched(r.data.watched || false);
        // Only record initial visit if brand new
        if (saved === 0 && !r.data.watched && userId) {
          saveProgress({
            materialId,
            progress: 0,
            materialTitle: material.title,
            subjectName,
            isVideo,
          }).catch(() => {});
        }
      })
      .catch(() => {
        if (userId)
          saveProgress({
            materialId,
            progress: 0,
            materialTitle: material.title,
            subjectName,
            isVideo,
          }).catch(() => {});
      });

    setCLoading(true);
    getComments(materialId)
      .then((r) => setComments(r.data.comments))
      .catch(() => {})
      .finally(() => setCLoading(false));
  }, []);

  // FIX 2: Refresh progress/watched when returning from ReaderScreen
  useEffect(() => {
    const unsub = navigation.addListener("focus", () => {
      getProgress(materialId)
        .then((r) => {
          setProgress(r.data.progress || 0);
          setWatched(r.data.watched || false);
        })
        .catch(() => {});
    });
    return unsub;
  }, [navigation, materialId]);

  const handlePost = useCallback(async () => {
    const text = commentText.trim();
    if (!text) return;
    setPosting(true);
    try {
      if (editingId) {
        const r = await updateComment(editingId, text);
        setComments((p) =>
          p.map((c) => (c._id === editingId ? r.data.comment : c)),
        );
        setEditingId(null);
      } else {
        const r = await createComment({ materialId, text });
        setComments((p) => [r.data.comment, ...p]);
      }
      setCommentText("");
    } catch {
      Alert.alert("Error", "Failed to post comment.");
    }
    setPosting(false);
  }, [commentText, editingId, materialId]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F8F9FD" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {material.title}
          </Text>
          <Text style={styles.headerMeta}>{material.schoolYear}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Main Content Card */}
        <View style={styles.materialCard}>
          <View style={styles.materialTopRow}>
            <View
              style={[
                styles.fileIconBox,
                { backgroundColor: meta.color + "15" },
              ]}
            >
              <Text style={styles.fileIcon}>{meta.icon}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.materialTitle}>{material.title}</Text>
              <Text style={styles.materialType}>{meta.label}</Text>
            </View>
          </View>

          {material.description ? (
            <Text style={styles.materialDesc}>{material.description}</Text>
          ) : null}

          {/* FIX 3: Single-file progress + open button */}
          {!hasMultipleFiles && (
            <>
              {isVideo ? (
                <View style={styles.watchedRow}>
                  <View
                    style={[
                      styles.watchedBadge,
                      watched && styles.watchedBadgeOn,
                    ]}
                  >
                    <Text style={styles.watchedIcon}>
                      {watched ? "✓" : "👁"}
                    </Text>
                    <Text
                      style={[
                        styles.watchedText,
                        watched && styles.watchedTextOn,
                      ]}
                    >
                      {watched ? "Watched" : "Not yet watched"}
                    </Text>
                  </View>
                  {watched && (
                    <TouchableOpacity
                      style={styles.unWatchBtn}
                      onPress={() => {
                        setWatched(false);
                        saveProgress({
                          materialId,
                          progress: 0,
                          materialTitle: material.title,
                          subjectName,
                          isVideo: true,
                          watched: false,
                        }).catch(() => {});
                      }}
                    >
                      <Text style={styles.unWatchText}>Mark as unwatched</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>Reading Progress</Text>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${progress}%`,
                          backgroundColor:
                            progress >= 100 ? "#2EAB6F" : COLORS.blue,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.progressPct,
                      { color: progress >= 100 ? "#2EAB6F" : COLORS.blue },
                    ]}
                  >
                    {progress}%
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.readBtn}
                onPress={() =>
                  navigation.navigate("Reader", { material, materialId })
                }
                activeOpacity={0.85}
              >
                <Text style={styles.readBtnIcon}>▶</Text>
                <Text style={styles.readBtnText}>
                  {isVideo
                    ? watched
                      ? "WATCH AGAIN"
                      : "WATCH NOW"
                    : progress > 0 && progress < 100
                      ? "CONTINUE READING"
                      : progress >= 100
                        ? "READ AGAIN"
                        : "READ NOW"}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* FIX 4: Multi-file list */}
          {hasMultipleFiles && (
            <View style={styles.filesContainer}>
              <View style={styles.filesSectionHeader}>
                <Text style={styles.sectionLabel}>FILES IN THIS MATERIAL</Text>
                <View style={styles.fileCountBadge}>
                  <Text style={styles.fileCountText}>
                    {material.files.length} files
                  </Text>
                </View>
              </View>
              {material.files.map((f, i) => {
                const fExt = f.fileType?.toLowerCase();
                const fMeta = FILE_META[fExt] || {
                  icon: "📎",
                  label: fExt?.toUpperCase() || "FILE",
                  color: "#555",
                };
                const cleanName = (f.fileName || `File ${i + 1}`)
                  .replace(/%20/g, " ")
                  .replace(/\.[^/.]+$/, "");
                return (
                  <View key={f._id || i} style={styles.fileCard}>
                    <View
                      style={[
                        styles.fileCardBar,
                        { backgroundColor: fMeta.color },
                      ]}
                    />
                    <View style={styles.fileCardBody}>
                      <View style={styles.fileCardTop}>
                        <View
                          style={[
                            styles.miniIcon,
                            { backgroundColor: fMeta.color + "18" },
                          ]}
                        >
                          <Text style={{ fontSize: 24 }}>{fMeta.icon}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.fileCardNum}>FILE {i + 1}</Text>
                          <Text style={styles.fileName} numberOfLines={2}>
                            {cleanName}
                          </Text>
                          <Text style={styles.fileSub}>{fMeta.label}</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.fileCardBtn,
                          { backgroundColor: fMeta.color },
                        ]}
                        onPress={() =>
                          navigation.navigate("Reader", {
                            material: {
                              ...material,
                              fileUrl: f.fileUrl,
                              fileType: f.fileType,
                              publicId: f.publicId,
                            },
                            materialId,
                          })
                        }
                        activeOpacity={0.8}
                      >
                        <Text style={styles.fileCardBtnText}>
                          {["mp4", "mov", "webm"].includes(fExt)
                            ? "▶   Play Video"
                            : "▶   Open File"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Discussion Section */}
        <View style={styles.commentSection}>
          <Text style={styles.commentHeader}>
            Discussion ({comments.length})
          </Text>
          <CommentInput
            value={commentText}
            onChange={setCommentText}
            onSubmit={handlePost}
            onCancel={() => {
              setEditingId(null);
              setCommentText("");
            }}
            editingId={editingId}
            posting={posting}
          />
          {cLoading ? (
            <ActivityIndicator color={COLORS.blue} style={{ marginTop: 20 }} />
          ) : (
            comments.map((item) => (
              <CommentItem
                key={item._id}
                item={item}
                currentUserId={userId}
                onEdit={(i) => {
                  setEditingId(i._id);
                  setCommentText(i.text);
                }}
                onDelete={(id) =>
                  Alert.alert("Delete", "Remove this comment?", [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () =>
                        deleteComment(id)
                          .then(() =>
                            setComments((p) => p.filter((c) => c._id !== id)),
                          )
                          .catch(() => {}),
                    },
                  ])
                }
              />
            ))
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const cs = StyleSheet.create({
  inputCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E8EBF0",
  },
  input: {
    fontSize: 14,
    color: "#333",
    minHeight: 60,
    textAlignVertical: "top",
  },
  inputFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  charCount: { fontSize: 11, color: "#999" },
  inputBtns: { flexDirection: "row", gap: 8 },
  cancelBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  cancelText: { color: "#666", fontSize: 13 },
  postBtn: {
    backgroundColor: "#1736F5",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  postBtnOff: { backgroundColor: "#B0B8E8" },
  postText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  item: { flexDirection: "row", gap: 12, marginBottom: 16 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1736F5",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  body: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E8EBF0",
  },
  commentHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  name: { fontSize: 13, fontWeight: "700", color: "#1A1C1E" },
  date: { fontSize: 10, color: "#999" },
  text: { fontSize: 13, color: "#444", lineHeight: 18 },
  actions: { flexDirection: "row", gap: 15, marginTop: 8 },
  actionEdit: { color: "#1736F5", fontSize: 11, fontWeight: "600" },
  actionDel: { color: "#E53935", fontSize: 11, fontWeight: "600" },
  link: { color: "#1736F5", textDecorationLine: "underline" },
});

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.blue,
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  backBtn: { marginRight: 15 },
  backText: { color: "#fff", fontSize: 24 },
  headerInfo: { flex: 1 },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  headerMeta: { color: "rgba(255,255,255,0.7)", fontSize: 12 },

  scroll: { padding: 16 },
  materialCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  materialTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  fileIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  fileIcon: { fontSize: 28 },
  materialTitle: { fontSize: 20, fontWeight: "800", color: "#1A1C1E" },
  materialType: { fontSize: 12, color: "#666", marginTop: 2 },
  materialDesc: {
    fontSize: 14,
    color: "#4A4D55",
    lineHeight: 21,
    marginBottom: 16,
  },

  // Single file — progress
  watchedRow: { marginBottom: 16 },
  watchedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    padding: 10,
    alignSelf: "flex-start",
  },
  watchedBadgeOn: { backgroundColor: "#E8F5E9" },
  watchedIcon: { fontSize: 16 },
  watchedText: { fontSize: 13, fontWeight: "700", color: "#999" },
  watchedTextOn: { color: "#2EAB6F" },
  unWatchBtn: { marginTop: 8 },
  unWatchText: { color: "#999", fontSize: 12, textDecorationLine: "underline" },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  progressLabel: { fontSize: 12, color: "#888", fontWeight: "600" },
  progressTrack: {
    flex: 1,
    height: 7,
    backgroundColor: "#EEF0FF",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 4 },
  progressPct: {
    fontSize: 12,
    fontWeight: "800",
    minWidth: 36,
    textAlign: "right",
  },
  readBtn: {
    backgroundColor: "#1a3f7a",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 4,
  },
  readBtnIcon: { color: "#FFC709", fontSize: 18 },
  readBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1,
  },

  // Multi-file
  filesContainer: {
    borderTopWidth: 1,
    borderTopColor: "#F0F2F5",
    paddingTop: 18,
    marginTop: 4,
  },
  filesSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#999",
    letterSpacing: 1,
  },
  fileCountBadge: {
    backgroundColor: "#1a3f7a",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  fileCountText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  fileCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    elevation: 2,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  fileCardBar: { height: 5, width: "100%" },
  fileCardBody: { padding: 16 },
  fileCardTop: { flexDirection: "row", gap: 14, marginBottom: 14 },
  miniIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  fileCardNum: {
    fontSize: 10,
    fontWeight: "900",
    color: "#bbb",
    letterSpacing: 1,
    marginBottom: 3,
  },
  fileName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1A1C1E",
    lineHeight: 20,
    marginBottom: 4,
  },
  fileSub: { fontSize: 11, color: "#888", fontWeight: "600" },
  fileCardBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    elevation: 1,
  },
  fileCardBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  commentSection: { paddingHorizontal: 4 },
  commentHeader: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1C1E",
    marginBottom: 15,
  },
});
