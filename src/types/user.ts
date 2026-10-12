/**
 * Cloud Firestore User Profile Schema
 */

export interface FirestoreUserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  provider: string;
  domain: string;
  isVerified: boolean;
  role: 'user' | 'admin';
  createdAt: string;
  lastLoginAt: string;
}

export interface UserSecurityStatus {
  isDomainVerified: boolean;
  emailVerified: boolean;
  accessStatus: 'AUTHORIZED' | 'DENIED' | 'PENDING';
  verifiedDomain: string;
  authProvider: string;
}
