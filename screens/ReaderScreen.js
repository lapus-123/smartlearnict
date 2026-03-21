import * as FileSystem from "expo-file-system";
import * as ScreenOrientation from "expo-screen-orientation";
import { VideoView, useVideoPlayer } from "expo-video";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { COLORS } from "../config";
import { useAuth } from "../contexts/AuthContext";
import { saveProgress } from "../services/api";

const VIDEO_TYPES = ["mp4", "mov", "webm"];
const IMAGE_TYPES = ["jpg", "jpeg", "png"];
const PDF_TYPES = ["pdf"];
const DOC_TYPES = ["docx", "doc", "ppt", "pptx"];

const optimizeImageUrl = (url) => {
  if (!url?.includes("cloudinary.com")) return url;
  return url.replace("/upload/", "/upload/q_auto,f_auto,w_800/");
};

const getPdfHtml = (pdfUrl) => `
<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=3.0">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#fff;}
#loading{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;color:#555;}
.sp{width:40px;height:40px;border:4px solid #eee;border-top-color:#1736F5;border-radius:50%;animation:spin .8s linear infinite;margin-bottom:12px;}
@keyframes spin{to{transform:rotate(360deg);}}
canvas{display:block;width:100%!important;height:auto!important;border-bottom:1px solid #eee;}
#pb{position:fixed;top:0;left:0;height:3px;background:#1736F5;transition:width .2s;z-index:99;}
</style></head><body>
<div id="pb" style="width:0%"></div>
<div id="loading"><div class="sp"></div><p>Loading PDF...</p></div>
<div id="c"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
<script>
pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const pb=document.getElementById('pb');
pdfjsLib.getDocument({url:'${pdfUrl}',cMapUrl:'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',cMapPacked:true})
.promise.then(pdf=>{
  document.getElementById('loading').style.display='none';
  const c=document.getElementById('c');
  const render=n=>pdf.getPage(n).then(pg=>{
    const vp=pg.getViewport({scale:1.8});
    const cv=document.createElement('canvas');
    cv.height=vp.height;cv.width=vp.width;c.appendChild(cv);
    pg.render({canvasContext:cv.getContext('2d'),viewport:vp}).promise.then(()=>{
      if(n<pdf.numPages)render(n+1);
      else window.addEventListener('scroll',()=>{
        const pct=Math.min(100,Math.round(((window.scrollY+window.innerHeight)/document.body.scrollHeight)*100));
        pb.style.width=pct+'%';
        window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({type:'progress',value:pct}));
      },{passive:true});
    });
  });
  render(1);
}).catch(()=>{document.getElementById('loading').innerHTML='<p style="color:#e53935;padding:20px">Failed to load PDF.</p>';});
</script></body></html>`;

export default function ReaderScreen({ route, navigation }) {
  const { material } = route.params;
  const materialId =
    route.params.materialId ||
    material._id?.toString() ||
    material.id?.toString() ||
    material.materialId?.toString();
  const { currentUser } = useAuth();
  const ft = material.fileType?.toLowerCase();
  const userId = currentUser?.id || currentUser?._id;
  // Bug 1 fix — subjectId may be a populated object OR a plain string ID
  const subjectName = material.subjectId?.name || material.subjectName || "";

  // ALL state declarations first — before any useCallback/useEffect that references them
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoSaving, setVideoSaving] = useState(false);
  const [watchFinished, setWatchFinished] = useState(false);

  const saveTimer = useRef(null);
  const latestProgress = useRef(0);
  const watchFinishedRef = useRef(false); // ref so listener never has stale closure
  const [dims, setDims] = useState(Dimensions.get("window"));
  const isLandscape = dims.width > dims.height;
  const isVideo = ["mp4", "mov", "webm"].includes(ft);

  const player = useVideoPlayer(isVideo ? material.fileUrl : null, (p) => {
    p.loop = false;
  });

  const handleVideoFinished = useCallback(async () => {
    if (!userId || watchFinishedRef.current) return;
    watchFinishedRef.current = true;
    setWatchFinished(true);
    setVideoSaving(true);
    try {
      await saveProgress({
        materialId,
        progress: 100,
        materialTitle: material.title,
        subjectName,
        isVideo: true,
        watched: true,
      });
    } catch {}
    setTimeout(() => {
      setVideoSaving(false);
      navigation.goBack();
    }, 1500);
  }, [userId, materialId, subjectName]);

  // Detect video end using addListener — works across all expo-video versions
  useEffect(() => {
    if (!isVideo || !player) return;
    const sub = player.addListener("statusChange", ({ status }) => {
      if (status === "idle") {
        handleVideoFinished();
      }
    });
    return () => sub?.remove?.();
  }, [player, isVideo]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      // Final save on unmount
      if (userId && latestProgress.current > 0) {
        saveProgress({
          materialId,
          progress: latestProgress.current,
          materialTitle: material.title,
          subjectName,
        }).catch(() => {});
      }
    };
  }, []);

  // Unlock orientation on mount, re-lock to portrait on unmount
  useEffect(() => {
    ScreenOrientation.unlockAsync();
    const sub = Dimensions.addEventListener("change", ({ window }) =>
      setDims(window),
    );
    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      );
      sub?.remove();
    };
  }, []);

  const handleProgress = useCallback(
    (value) => {
      setProgress(value);
      latestProgress.current = value;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        if (userId)
          saveProgress({
            materialId,
            progress: value,
            materialTitle: material.title,
            subjectName,
          }).catch(() => {});
      }, 2000);
    },
    [userId, materialId],
  );

  const handleImageScroll = (e) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const pct = Math.min(
      100,
      Math.round(
        ((contentOffset.y + layoutMeasurement.height) / contentSize.height) *
          100,
      ),
    );
    handleProgress(pct);
  };

  const handleDownload = () => {
    Alert.alert("Download", `Open "${material.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Open",
        onPress: async () => {
          setDownloading(true);
          try {
            const filename =
              material.title.replace(/[^a-zA-Z0-9]/g, "_") + "." + ft;
            const localUri = FileSystem.documentDirectory + filename;
            const { uri } = await FileSystem.downloadAsync(
              material.fileUrl,
              localUri,
            );
            await Linking.openURL(
              (await Linking.canOpenURL(uri)) ? uri : material.fileUrl,
            );
          } catch {
            Linking.openURL(material.fileUrl);
          }
          setDownloading(false);
        },
      },
    ]);
  };

  const renderContent = () => {
    if (VIDEO_TYPES.includes(ft)) {
      return (
        <View
          style={[styles.videoWrap, isLandscape && { backgroundColor: "#000" }]}
        >
          <VideoView
            player={player}
            style={[styles.video, isLandscape && { width, height }]}
            allowsFullscreen
            nativeControls
          />
          {videoSaving && (
            <View style={styles.watchedOverlay}>
              <ActivityIndicator color="#fff" size="large" />
              <Text style={styles.watchedOverlayTitle}>
                ✓ Marked as Watched
              </Text>
              <Text style={styles.watchedOverlaySub}>
                Returning to material...
              </Text>
            </View>
          )}
        </View>
      );
    }
    if (IMAGE_TYPES.includes(ft)) {
      return (
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <ScrollView
            style={{ flex: 1 }}
            scrollEventThrottle={100}
            onScroll={handleImageScroll}
            showsVerticalScrollIndicator={false}
            maximumZoomScale={3}
            minimumZoomScale={1}
          >
            <Image
              source={{ uri: optimizeImageUrl(material.fileUrl) }}
              style={{ width: dims.width, height: dims.height * 0.85 }}
              resizeMode="contain"
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                Alert.alert("Error", "Failed to load image. Please try again.");
              }}
            />
          </ScrollView>
          {loading && (
            <View style={styles.loaderBox}>
              <ActivityIndicator color={COLORS.blue} size="large" />
              <Text style={styles.loaderText}>Loading image...</Text>
            </View>
          )}
        </View>
      );
    }
    if (PDF_TYPES.includes(ft)) {
      return (
        <View style={{ flex: 1 }}>
          {loading && (
            <View style={styles.loaderBox}>
              <ActivityIndicator color={COLORS.blue} size="large" />
              <Text style={styles.loaderText}>Preparing PDF...</Text>
            </View>
          )}
          <WebView
            originWhitelist={["*"]}
            source={{ html: getPdfHtml(material.fileUrl) }}
            style={{ flex: 1 }}
            onLoad={() => setLoading(false)}
            javaScriptEnabled
            domStorageEnabled
            scalesPageToFit={false}
            showsVerticalScrollIndicator
            onMessage={(e) => {
              try {
                const msg = JSON.parse(e.nativeEvent.data);
                if (msg.type === "progress") handleProgress(msg.value);
              } catch {}
            }}
          />
        </View>
      );
    }
    if (DOC_TYPES.includes(ft)) {
      const iconMap = { docx: "📝", doc: "📝", ppt: "📊", pptx: "📊" };
      return (
        <View style={styles.docWrap}>
          <Text style={styles.docIcon}>{iconMap[ft] || "📎"}</Text>
          <Text style={styles.docTitle}>{material.title}</Text>
          <Text style={styles.docNote}>
            This file type must be opened in an external app.
          </Text>
          <TouchableOpacity
            style={styles.docBtn}
            onPress={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.docBtnText}>⬇ Download & Open</Text>
            )}
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={isLandscape} />
      {/* Header — hidden in landscape for full immersion */}
      {!isLandscape && (
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {material.title}
          </Text>
          {!DOC_TYPES.includes(ft) && (
            <TouchableOpacity
              style={styles.dlBtn}
              onPress={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <ActivityIndicator color="#1a1a1a" size="small" />
              ) : (
                <Text style={styles.dlIcon}>⬇</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
      {/* Progress strip — hidden in landscape */}
      {!isLandscape && (
        <View style={styles.progressStrip}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
          <Text style={styles.progressPct}>{progress}%</Text>
        </View>
      )}
      {/* Full-screen content */}
      <View style={{ flex: 1 }}>
        {renderContent()}
        {isLandscape && (
          <TouchableOpacity
            style={styles.landscapeBack}
            onPress={() => navigation.goBack()}
            activeOpacity={0.75}
          >
            <Text style={styles.landscapeBackText}>←</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a1a" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.blue,
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  backBtn: { padding: 4 },
  backText: { color: "#fff", fontSize: 22, fontWeight: "700" },
  headerTitle: { flex: 1, color: "#fff", fontSize: 14, fontWeight: "700" },
  dlBtn: { backgroundColor: "#FFC709", borderRadius: 8, padding: 8 },
  dlIcon: { fontSize: 16, color: "#1a1a1a", fontWeight: "700" },
  progressStrip: {
    height: 24,
    backgroundColor: "#111",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
  },
  progressFill: {
    height: 4,
    backgroundColor: "#1736F5",
    borderRadius: 2,
    position: "absolute",
    left: 0,
    top: 10,
  },
  progressPct: {
    color: "#aaa",
    fontSize: 11,
    fontWeight: "700",
    marginLeft: "auto",
  },
  videoWrap: { flex: 1, justifyContent: "center", backgroundColor: "#000" },
  video: { width: "100%", height: "100%" },
  watchedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.82)",
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
  },
  watchedOverlayTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 16,
  },
  watchedOverlaySub: { color: "rgba(255,255,255,0.65)", fontSize: 14 },
  loaderAbs: { position: "absolute", top: "45%", alignSelf: "center" },
  loaderBox: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F6FF",
    zIndex: 10,
  },
  loaderText: { marginTop: 12, color: "#666", fontSize: 14 },
  docWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: "#F4F6FF",
  },
  docIcon: { fontSize: 56, marginBottom: 16 },
  docTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a3a5c",
    textAlign: "center",
    marginBottom: 12,
  },
  docNote: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  docBtn: {
    backgroundColor: COLORS.blue,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  docBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  landscapeBack: {
    position: "absolute",
    top: 14,
    left: 14,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99,
  },
  landscapeBackText: { color: "#fff", fontSize: 20, fontWeight: "800" },
});
