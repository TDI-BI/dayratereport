export interface EditPanelProps {
  selectedUser: UserRow | null;
  updateUser: (email: string, patch: Partial<UserRow>) => void;
}

export interface UserRow {
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  isActive: boolean;
  workType: string;
  username: string;
  id: string | null; // this should be id
  isDomestic: boolean;
}