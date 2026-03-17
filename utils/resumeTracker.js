import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_PREFIX = "smartlearn_last_material_";

export const trackMaterial = async (userId, material) => {
  try {
    if (!userId) return;
    const record = {
      _id: material._id?.toString() || material.id,
      id: material._id?.toString() || material.id,
      title: material.title,
      fileType: material.fileType,
      fileUrl: material.fileUrl,
      description: material.description,
      schoolYear: material.schoolYear,
      subjectId: material.subjectId,
      // Explicitly denormalize subjectName so it survives JSON serialization
      subjectName: material.subjectId?.name || material.subjectName || "",
      accessedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(KEY_PREFIX + userId, JSON.stringify(record));
  } catch (err) {
    console.warn("trackMaterial error:", err);
  }
};

export const getLastMaterial = async (userId) => {
  try {
    if (!userId) return null;
    const data = await AsyncStorage.getItem(KEY_PREFIX + userId);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.warn("getLastMaterial error:", err);
    return null;
  }
};
