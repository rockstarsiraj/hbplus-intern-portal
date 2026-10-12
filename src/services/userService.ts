import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from './firebase';
import { AuthUser } from '../types/auth';
import { FirestoreUserProfile } from '../types/user';
import { APP_CONFIG } from '../constants/appConfig';

/**
 * Service to manage authorized user profiles in Cloud Firestore.
 * Conforms to users/{uid} document architecture.
 */
export const userService = {
  /**
   * Syncs the authenticated and domain-verified user's profile to Cloud Firestore.
   * Uses the authenticated user's UID as the immutable document ID.
   */
  async syncUserProfile(user: AuthUser): Promise<{ success: boolean; profile?: FirestoreUserProfile; error?: string }> {
    if (!firestore) {
      return { success: false, error: 'Firestore is not initialized.' };
    }

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const existingSnap = await getDoc(userDocRef);

      const nowIso = new Date().toISOString();
      const profileData: FirestoreUserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'HB+ Team Member',
        photoURL: user.photoURL || null,
        provider: user.providerId || 'google.com',
        domain: APP_CONFIG.ALLOWED_DOMAIN,
        isVerified: user.emailVerified,
        role: 'user', // Default client role (privileged roles must only be modified via backend/admin claims)
        createdAt: existingSnap.exists() ? existingSnap.data()?.createdAt || nowIso : nowIso,
        lastLoginAt: nowIso,
      };

      await setDoc(userDocRef, profileData, { merge: true });

      return {
        success: true,
        profile: profileData,
      };
    } catch (err: any) {
      console.warn('[Firestore] Failed to sync user profile:', err);
      return {
        success: false,
        error: err?.message || 'Failed to sync user profile in database.',
      };
    }
  },

  /**
   * Fetches an existing user profile from Firestore.
   */
  async getUserProfile(uid: string): Promise<FirestoreUserProfile | null> {
    if (!firestore) return null;
    try {
      const userDocRef = doc(firestore, 'users', uid);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        return snap.data() as FirestoreUserProfile;
      }
      return null;
    } catch (err) {
      console.warn('[Firestore] Error fetching profile:', err);
      return null;
    }
  },
};
