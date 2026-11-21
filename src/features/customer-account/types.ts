export interface ProfileView {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  school: string;
  avatar: string | null;
  interests: number[];
  /** "none" until the user applies to ride. */
  riderStatus: "none" | "pending" | "approved";
}

export interface SchoolView {
  id: number;
  name: string;
  logoUrl: string | null;
}
