import { Platform } from 'react-native';
import {
  signInWithPopup,
  signInWithCredential,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  User as FirebaseUser,
} from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { auth, googleProvider, checkFirebaseConfiguration } from './firebase';
import { validateAuthorizedDomain } from '../utils/domainValidation';
import { AuthUser } from '../types/auth';
import { userService } from './userService';

// Ensure WebBrowser finishes auth sessions properly on web/mobile
WebBrowser.maybeCompleteAuthSession();

export interface SignInResult {
  success: boolean;
  user?: AuthUser;
  isDomainRejected?: boolean;
  deniedEmail?: string;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Maps raw Firebase User instance to application AuthUser model.
 */
export function mapFirebaseUserToAuthUser(fbUser: FirebaseUser): AuthUser {
  return {
    uid: fbUser.uid,
    email: fbUser.email || '',
    emailVerified: fbUser.emailVerified,
    displayName: fbUser.displayName,
    photoURL: fbUser.photoURL,
    providerId: fbUser.providerData[0]?.providerId || 'google.com',
  };
}

import { formatAuthError } from '../utils/authErrors';
export { formatAuthError };

/**
 * Cross-platform Authentication Service
 */
export const authService = {
  /**
   * Executes Google OAuth Sign-In across Web and Native platforms.
   * Performs strict post-auth domain validation before granting application state.
   */
  async signInWithGoogle(): Promise<SignInResult> {
    const configCheck = checkFirebaseConfiguration();
    if (!configCheck.isConfigured || !auth || !googleProvider) {
      return {
        success: false,
        errorCode: 'CONFIG_MISSING',
        errorMessage: `Firebase is not configured. Missing required variables: ${configCheck.missingKeys.join(', ')}`,
      };
    }

    try {
      let fbUser: FirebaseUser;

      if (Platform.OS === 'web') {
        // Web Platform: Standard Firebase Popup Flow
        const result = await signInWithPopup(auth, googleProvider);
        fbUser = result.user;
      } else {
        // Native Mobile Platform (iOS / Android)
        const clientId =
          Platform.OS === 'ios'
            ? process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
            : process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

        const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

        if (!clientId && !webClientId) {
          // Helpful informative error if native client IDs haven't been provided yet
          return {
            success: false,
            errorCode: 'NATIVE_CLIENT_ID_MISSING',
            errorMessage:
              'Native Google Client ID is not configured. Please define EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID or EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID in .env.',
          };
        }

        // Trigger Expo AuthSession for Google OAuth
        const redirectUri = AuthSession.makeRedirectUri({
          scheme: 'hbplus-intern-portal',
        });

        const discovery = {
          authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
          tokenEndpoint: 'https://oauth2.googleapis.com/token',
          revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
        };

        const authRequest = new AuthSession.AuthRequest({
          clientId: clientId || webClientId || '',
          scopes: ['openid', 'profile', 'email'],
          redirectUri,
          responseType: AuthSession.ResponseType.IdToken,
          extraParams: {
            prompt: 'select_account',
          },
        });

        const authResult = await authRequest.promptAsync(discovery);

        if (authResult.type === 'cancel' || authResult.type === 'dismiss') {
          return {
            success: false,
            errorCode: 'USER_CANCELLED',
            errorMessage: 'Google sign-in was cancelled.',
          };
        }

        if (authResult.type !== 'success' || !authResult.params?.id_token) {
          return {
            success: false,
            errorCode: 'NATIVE_AUTH_FAILED',
            errorMessage: 'Failed to obtain Google identity token from mobile flow.',
          };
        }

        // Exchange Google ID Token with Firebase
        const credential = GoogleAuthProvider.credential(authResult.params.id_token);
        const userCred = await signInWithCredential(auth, credential);
        fbUser = userCred.user;
      }

      // Step 2 & 3: Read authenticated email and validate domain strictly
      const domainCheck = validateAuthorizedDomain(fbUser.email, fbUser.emailVerified);

      if (!domainCheck.isValid) {
        // Immediate Security Enforcement:
        // Reject user, destroy Firebase session token, and return rejection payload
        const rejectedEmail = fbUser.email || 'unknown';
        await firebaseSignOut(auth);

        return {
          success: false,
          isDomainRejected: true,
          deniedEmail: rejectedEmail,
          errorCode: domainCheck.errorCode,
          errorMessage: domainCheck.errorMessage,
        };
      }

      // Valid authorized user:
      const appUser = mapFirebaseUserToAuthUser(fbUser);

      // Synchronize verified profile to Cloud Firestore
      await userService.syncUserProfile(appUser);

      return {
        success: true,
        user: appUser,
      };
    } catch (err: any) {
      console.warn('[AuthService] Sign-in error:', err);
      return {
        success: false,
        errorCode: err?.code || 'AUTH_ERROR',
        errorMessage: formatAuthError(err),
      };
    }
  },

  /**
   * Signs the current user out of Firebase and terminates active session.
   */
  async signOut(): Promise<void> {
    if (auth) {
      try {
        await firebaseSignOut(auth);
      } catch (err) {
        console.warn('[AuthService] Sign out error:', err);
      }
    }
  },
};
