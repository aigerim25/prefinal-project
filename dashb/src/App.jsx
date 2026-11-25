import { lazy } from "react";
import { Routes, Route } from "react-router";
import RootLayout from "./components/RootLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import GuestRoute from "./components/GuestRoute.jsx";
import Home from "./pages/Home.jsx";
import Albums from "./pages/Albums.jsx";
import Login from "./pages/Login.jsx";
import NotFound from "./pages/NotFound.jsx";
import Offline from "./components/Offline.jsx";

const AlbumPage = lazy(() => import("./pages/AlbumPages.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Signup = lazy(() => import("./pages/SignUp.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const Liked = lazy(() => import("./pages/Liked.jsx"));

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="albums" element={<Albums />} />
        <Route path="albums/:id" element={<AlbumPage />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="about" element={<About />} />

        <Route element={<GuestRoute />}>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<Profile />} />
          <Route path="liked" element={<Liked/>}/>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;