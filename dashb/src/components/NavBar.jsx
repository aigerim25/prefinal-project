import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import {
  SearchIcon, HomeIcon, DashboardIcon, AlbumIcon, HeartIcon, InfoIcon,
  UserIcon, LoginIcon, SignupIcon, LogoutIcon, MenuIcon, CloseIcon, NoteIcon,
} from "./Icons.jsx";


const APP_NAME = "Web music app";
function NavBar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.body.classList.add("menu-open");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("menu-open");
    };
  }, [open]);

  async function handleLogout() {
    close();
    const ok = await logout();
    if (ok) navigate("/login", { replace: true });
  }

  function handleSearch(e) {
    e.preventDefault();
    const text = query.trim();
    close();
    navigate(text ? `/albums?search=${encodeURIComponent(text)}` : "/albums");
  }

  const linkClass = ({ isActive }) => (isActive ? "side-link active" : "side-link");

  return (
    <>
      <header className="topbar">
        <button
          type="button"
          className="icon-button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="sidebar"
        >
          <MenuIcon size={24} />
        </button>
        <NavLink to="/" className="brand brand--small" onClick={close}>
          <span className="brand__logo"><NoteIcon size={18} /></span>
          {APP_NAME}
        </NavLink>
      </header>

      <div
        className={open ? "sidebar-overlay visible" : "sidebar-overlay"}
        onClick={close}
        aria-hidden="true"
      />

      <nav id="sidebar" className={open ? "sidebar open" : "sidebar"} aria-label="Main navigation">
        <div className="sidebar__head">
          <NavLink to="/" className="brand" onClick={close}>
            <span className="brand__logo"><NoteIcon size={20} /></span>
            {APP_NAME}
          </NavLink>
          <button type="button" className="icon-button sidebar__close" onClick={close} aria-label="Close menu">
            <CloseIcon size={22} />
          </button>
        </div>

        <form className="side-search" role="search" onSubmit={handleSearch}>
          <SearchIcon size={18} />
          <input
            type="search"
            placeholder="Search albums"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search albums"
          />
        </form>

        <div className="side-group">
          <NavLink to="/" end className={linkClass} onClick={close}>
            <HomeIcon /> Home
          </NavLink>
          <NavLink to="/dashboard" className={linkClass} onClick={close}>
            <DashboardIcon /> Dashboard
          </NavLink>
        </div>

        <p className="side-title">Library</p>
        <div className="side-group">
          <NavLink to="/albums" className={linkClass} onClick={close}>
            <AlbumIcon /> Albums
          </NavLink>
          {/* Плейлист избранного виден только после входа */}
          {user && (
            <NavLink to="/liked" className={linkClass} onClick={close}>
              <HeartIcon /> Liked songs
            </NavLink>
          )}
        </div>

        <p className="side-title">Account</p>
        <div className="side-group">
          {loading ? null : user ? (
            <>
              <NavLink to="/profile" className={linkClass} onClick={close}>
                <UserIcon /> Profile
              </NavLink>
              <button type="button" className="side-link" onClick={handleLogout}>
                <LogoutIcon /> Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass} onClick={close}>
                <LoginIcon /> Login
              </NavLink>
              <NavLink to="/signup" className={linkClass} onClick={close}>
                <SignupIcon /> Sign up
              </NavLink>
            </>
          )}
        </div>

        <div className="side-group side-group--bottom">
          <NavLink to="/about" className={linkClass} onClick={close}>
            <InfoIcon /> About
          </NavLink>
        </div>
      </nav>
    </>
  );
}

export default NavBar;
