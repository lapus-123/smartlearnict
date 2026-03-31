import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import {
  CoursesIcon,
  HomeIcon,
  ProfileIcon,
  UpdatesIcon,
  UploadIcon,
} from "../components/Icons";
import InstructorHomeScreen from "../screens/InstructorHomeScreen";
import InstructorProfileScreen from "../screens/InstructorProfileScreen";
import InstructorUploadScreen from "../screens/InstructorUploadScreen";
import MaterialViewerScreen from "../screens/MaterialViewerScreen";
import ReaderScreen from "../screens/ReaderScreen";
import ReadingHistoryScreen from "../screens/ReadingHistoryScreen";
import StudentCoursesScreen from "../screens/StudentCoursesScreen";
import StudentUpdatesScreen from "../screens/StudentUpdatesScreen";
import SubjectMaterialsScreen from "../screens/SubjectMaterialsScreen";
import { getRecentMaterials } from "../services/api";
import { hasUnseenUpdates } from "../utils/notifBadge";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS = {
  Home: { label: "Home" },
  Courses: { label: "Subjects" },
  Upload: { label: "Upload" },
  Updates: { label: "Updates" },
  Profile: { label: "Profile" },
};

const TabSvgIcon = ({ name, focused }) => {
  const color = focused ? "#1a3a5c" : "rgba(26,58,92,0.35)";
  const sw = focused ? 2.5 : 1.8;
  if (name === "Home") return <HomeIcon color={color} sw={sw} size={22} />;
  if (name === "Courses")
    return <CoursesIcon color={color} sw={sw} size={22} />;
  if (name === "Upload") return <UploadIcon color={color} sw={sw} size={22} />;
  if (name === "Updates")
    return <UpdatesIcon color={color} sw={sw} size={22} />;
  if (name === "Profile")
    return <ProfileIcon color={color} sw={sw} size={22} />;
  return null;
};

const SHARED = (S) => (
  <>
    <S.Screen name="SubjectMaterials" component={SubjectMaterialsScreen} />
    <S.Screen name="MaterialViewer" component={MaterialViewerScreen} />
    <S.Screen name="Reader" component={ReaderScreen} />
  </>
);

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InstructorHome" component={InstructorHomeScreen} />
      {SHARED(Stack)}
    </Stack.Navigator>
  );
}
function CoursesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="InstructorCoursesList"
        component={StudentCoursesScreen}
      />
      {SHARED(Stack)}
    </Stack.Navigator>
  );
}
function UpdatesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InstructorUpdates" component={StudentUpdatesScreen} />
      <Stack.Screen name="MaterialViewer" component={MaterialViewerScreen} />
      <Stack.Screen name="Reader" component={ReaderScreen} />
    </Stack.Navigator>
  );
}
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="InstructorProfile"
        component={InstructorProfileScreen}
      />
      <Stack.Screen name="ReadingHistory" component={ReadingHistoryScreen} />
      <Stack.Screen name="MaterialViewer" component={MaterialViewerScreen} />
      <Stack.Screen name="Reader" component={ReaderScreen} />
    </Stack.Navigator>
  );
}

function CustomTabBar({ state, navigation }) {
  const [hasBadge, setHasBadge] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getRecentMaterials()
        .then((r) => hasUnseenUpdates(r.data.materials))
        .then(setHasBadge)
        .catch(() => {});
    }, []),
  );

  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const tab = TAB_ICONS[route.name];
        const showBadge = route.name === "Updates" && hasBadge && !focused;
        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => {
              if (route.name === "Updates") setHasBadge(false);
              if (route.name === "Home")
                navigation.navigate("Home", { screen: "InstructorHome" });
              else navigation.navigate(route.name);
            }}
          >
            <View style={styles.iconWrap}>
              <TabSvgIcon name={route.name} focused={focused} />
              {showBadge && <View style={styles.badge} />}
            </View>
            <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
              {tab.label}
            </Text>
            {focused && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function InstructorTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Courses" component={CoursesStack} />
      <Tab.Screen name="Upload" component={InstructorUploadScreen} />
      <Tab.Screen name="Updates" component={UpdatesStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.97)",
    elevation: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    paddingBottom: 6,
    paddingTop: 8,
  },
  tabItem: { flex: 1, alignItems: "center", position: "relative" },
  iconWrap: { position: "relative" },
  tabIcon: { marginBottom: 3 },
  tabLabel: { fontSize: 10, color: "#aaa", marginTop: 3, fontWeight: "600" },
  tabLabelActive: { color: "#1a3a5c", fontWeight: "800" },
  tabIndicator: {
    position: "absolute",
    bottom: -8,
    width: 20,
    height: 3,
    backgroundColor: "#4D8FD9",
    borderRadius: 2,
    alignSelf: "center",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E53935",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
});
