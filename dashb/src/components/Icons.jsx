function Icon({ children, size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (p) => (
  <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Icon>
);
export const HomeIcon = (p) => (
  <Icon {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></Icon>
);
export const DashboardIcon = (p) => (
  <Icon {...p}><path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M22 20H2" /></Icon>
);
export const AlbumIcon = (p) => (
  <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.5" /></Icon>
);
export const HeartIcon = (p) => (
  <Icon {...p}><path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9Z" /></Icon>
);
export const InfoIcon = (p) => (
  <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></Icon>
);
export const UserIcon = (p) => (
  <Icon {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></Icon>
);
export const LoginIcon = (p) => (
  <Icon {...p}><path d="M14 4h5v16h-5" /><path d="M10 16l4-4-4-4" /><path d="M14 12H3" /></Icon>
);
export const SignupIcon = (p) => (
  <Icon {...p}><circle cx="10" cy="8" r="4" /><path d="M2 21a8 8 0 0 1 13-6" /><path d="M19 14v6" /><path d="M16 17h6" /></Icon>
);
export const LogoutIcon = (p) => (
  <Icon {...p}><path d="M10 4H5v16h5" /><path d="M14 16l4-4-4-4" /><path d="M18 12H9" /></Icon>
);
export const MenuIcon = (p) => (
  <Icon {...p}><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></Icon>
);
export const CloseIcon = (p) => (
  <Icon {...p}><path d="M6 6l12 12" /><path d="M18 6 6 18" /></Icon>
);
export const NoteIcon = (p) => (
  <Icon {...p}><path d="M9 18V5l11-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" /></Icon>
);
