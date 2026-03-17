import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { registerRootComponent } from "expo";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Auth
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";

// Admin screens
import AdminDashboard from "./screens/AdminDashboard";
import AdminEditUserScreen from "./screens/AdminEditUserScreen";
import AdminManageUsersScreen from "./screens/AdminManageUsersScreen";
import AdminSubjectManagerScreen from "./screens/AdminSubjectManagerScreen";
import AdminUploadMaterialScreen from "./screens/AdminUploadMaterialScreen";
import CollegeManagerScreen from "./screens/CollegeManagerScreen";
import MaterialViewerScreen from "./screens/MaterialViewerScreen";
import SectionManagerScreen from "./screens/SectionManagerScreen";
import SubjectMaterialsScreen from "./screens/SubjectMaterialsScreen";

// Instructor screens
import InstructorTabNavigator from "./navigators/InstructorTabNavigator";
import AdminInstructorRequestsScreen from "./screens/AdminInstructorRequestsScreen";

// Student tab navigator
import StudentTabNavigator from "./navigators/StudentTabNavigator";

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { currentUser, loading } = useAuth();

  if (loading)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#4DD9C0",
        }}
      >
        <ActivityIndicator size="large" color="#1a3a5c" />
      </View>
    );

  if (!currentUser)
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      </Stack.Navigator>
    );

  if (currentUser.role === "admin")
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="CollegeManager" component={CollegeManagerScreen} />
        <Stack.Screen name="SectionManager" component={SectionManagerScreen} />
        <Stack.Screen
          name="AdminManageUsers"
          component={AdminManageUsersScreen}
        />
        <Stack.Screen name="AdminEditUser" component={AdminEditUserScreen} />
        <Stack.Screen
          name="AdminSubjectManager"
          component={AdminSubjectManagerScreen}
        />
        <Stack.Screen
          name="AdminUploadMaterial"
          component={AdminUploadMaterialScreen}
        />
        <Stack.Screen
          name="InstructorRequests"
          component={AdminInstructorRequestsScreen}
        />
        <Stack.Screen
          name="SubjectMaterials"
          component={SubjectMaterialsScreen}
        />
        <Stack.Screen name="MaterialViewer" component={MaterialViewerScreen} />
      </Stack.Navigator>
    );

  if (currentUser.role === "instructor") return <InstructorTabNavigator />;

  // Student — bottom tab navigator
  return <StudentTabNavigator />;
}

function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

registerRootComponent(App);
export default App;
