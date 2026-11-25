import { useState, useEffect,  Suspense } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import NavBar from "./NavBar.jsx";
import UpdatePrompt from "./UpdatePrompt.jsx";
import CachedDataNotice from "./CachedDataNotice.jsx";
import NetworkStatus from "./NetworkStatus.jsx";
import { OFFLINE_ERROR_EVENT } from "../services/queryClient.js";
import PlayerBar from "./PlayerBar.jsx";
import { PlayerProvider } from "../context/PlayerProvider.jsx";
import { useFavorites, useSyncFavoritesWithUser } from "../hooks/useFavorites.js";

function RootLayout() {
  return (
    <PlayerProvider>
      <AppShell />
    </PlayerProvider>
  );
}

function AppShell() {
  useSyncFavoritesWithUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { likedSongs, addToLikedSongs, removeFromLikedSongs } = useFavorites();

  useEffect(() => {
    function handleOfflineError() {
      if (location.pathname === "/offline") return;
      navigate("/offline", {
        state: { from: location.pathname + location.search },
      });
    }
    window.addEventListener(OFFLINE_ERROR_EVENT, handleOfflineError);
    return () =>
      window.removeEventListener(OFFLINE_ERROR_EVENT, handleOfflineError);
  }, [location, navigate]);

  return (
    <>
      <div className="app-shell">
        <NavBar />
        <div className="app-content">
          <NetworkStatus />
          <CachedDataNotice />
          <main>
            <Suspense fallback={<p>Loading page...</p>}>
              {/* Те же имена, что и раньше: SongRow и Dashboard работают без изменений */}
              <Outlet context={{ likedSongs, addToLikedSongs, removeFromLikedSongs }} />
            </Suspense>
          </main>
        </div>
      </div>
      <PlayerBar />
      <UpdatePrompt />
    </>
  );
}

export default RootLayout;
