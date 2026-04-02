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
} from "../components/Icons";

import MaterialViewerScreen from "../screens/MaterialViewerScreen";
import ReaderScreen from "../screens/ReaderScreen";
import ReadingHistoryScreen from "../screens/ReadingHistoryScreen";
import StudentCoursesScreen from "../screens/StudentCoursesScreen";
import StudentHomeScreen from "../screens/StudentHomeScreen";
import StudentProfileScreen from "../screens/StudentProfileScreen";
import StudentUpdatesScreen from "../screens/StudentUpdatesScreen";
import SubjectMaterialsScreen from "../screens/SubjectMaterialsScreen";
import { getRecentMaterials } from "../services/api";
import { hasUnseenUpdates } from "../utils/notifBadge";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const SHARED_SCREENS = (S) => (
  <>
    <S.Screen name="SubjectMaterials" component={SubjectMaterialsScreen} />
    <S.Screen name="MaterialViewer" component={MaterialViewerScreen} />
    <S.Screen name="Reader" component={ReaderScreen} />
  </>
);

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudentHome" component={StudentHomeScreen} />
      {SHARED_SCREENS(Stack)}
    </Stack.Navigator>
  );
}

function CoursesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="StudentCoursesList"
        component={StudentCoursesScreen}
      />
      {SHARED_SCREENS(Stack)}
    </Stack.Navigator>
  );
}

function UpdatesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudentUpdates" component={StudentUpdatesScreen} />
      <Stack.Screen name="MaterialViewer" component={MaterialViewerScreen} />
      <Stack.Screen name="Reader" component={ReaderScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudentProfile" component={StudentProfileScreen} />
      <Stack.Screen name="ReadingHistory" component={ReadingHistoryScreen} />
      <Stack.Screen name="MaterialViewer" component={MaterialViewerScreen} />
      <Stack.Screen name="Reader" component={ReaderScreen} />
    </Stack.Navigator>
  );
}

const TAB_ICONS = {
  Home: { label: "Home" },
  Courses: { label: "Courses" },
  Updates: { label: "Updates" },
  Profile: { label: "Profile" },
};

const TabSvgIcon = ({ name, focused }) => {
  const color = focused ? "#1a3a5c" : "rgba(26,58,92,0.35)";
  const sw = focused ? 2.5 : 1.8;
  if (name === "Home") return <HomeIcon color={color} sw={sw} size={22} />;
  if (name === "Courses")
    return <CoursesIcon color={color} sw={sw} size={22} />;
  if (name === "Updates")
    return <UpdatesIcon color={color} sw={sw} size={22} />;
  if (name === "Profile")
    return <ProfileIcon color={color} sw={sw} size={22} />;
  return null;
};

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
            onPress={() => {
              if (route.name === "Updates") setHasBadge(false);
              if (route.name === "Home")
                navigation.navigate("Home", { screen: "StudentHome" });
              else navigation.navigate(route.name);
            }}
            activeOpacity={0.7}
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

export default function StudentTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Courses" component={CoursesStack} />
      <Tab.Screen name="Updates" component={UpdatesStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    elevation: 24,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    paddingBottom: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E8EEFF",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    paddingVertical: 4,
    minHeight: 52,
  },
  iconWrap: { position: "relative" },
  tabIcon: { marginBottom: 3 },
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
  tabLabel: { fontSize: 11, fontWeight: "600", color: "#aaa", marginTop: 4 },
  tabLabelActive: { color: "#1a3a5c", fontWeight: "900" },
  tabIndicator: {
    position: "absolute",
    bottom: -2,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#1a3a5c",
  },
});
