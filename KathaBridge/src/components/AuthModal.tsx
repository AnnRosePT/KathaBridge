import React, { useState, useEffect } from "react";
import { UserProfile, Story } from "../types";
import { StorageService } from "../services/storageService";
import { mockStories } from "../data/mockData";
import { downloadReadingPortfolio } from "../utils/exportProgress";
import {
  isFirebaseLive,
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  sendResetPassword,
  logoutFirebaseUser,
  getActiveFirebaseConfig,
  saveCustomFirebaseConfig,
  clearCustomFirebaseConfig,
  FirebaseClientConfig
} from "../services/firebaseAuth";

interface Props {
  currentUser: UserProfile | null;
  onUserChange: (user: UserProfile | null) => void;
  onClose: () => void;
  onSelectStory?: (story: Story) => void;
}

export const AuthModal: React.FC<Props> = ({ currentUser, onUserChange, onClose, onSelectStory }) => {
  const [tab, setTab] = useState<"LOGIN" | "SIGNUP" | "CONFIG" | "PROFILE">(currentUser ? "PROFILE" : "LOGIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"READER" | "CONTRIBUTOR" | "REVIEWER" | "SCHOLAR">("READER");
  const [feedback, setFeedback] = useState<{ message: string; type: "info" | "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(false);
  const [firebaseActive, setFirebaseActive] = useState(isFirebaseLive());

  // Config tab form state
  const activeCfg = getActiveFirebaseConfig();
  const [cfgApiKey, setCfgApiKey] = useState(activeCfg?.apiKey || "");
  const [cfgAuthDomain, setCfgAuthDomain] = useState(activeCfg?.authDomain || "");
  const [cfgProjectId, setCfgProjectId] = useState(activeCfg?.projectId || "");
  const [cfgStorageBucket, setCfgStorageBucket] = useState(activeCfg?.storageBucket || "");
  const [cfgSenderId, setCfgSenderId] = useState(activeCfg?.messagingSenderId || "");
  const [cfgAppId, setCfgAppId] = useState(activeCfg?.appId || "");

  useEffect(() => {
    setFirebaseActive(isFirebaseLive());
  }, [tab]);

  // Handle Real Google Login
  const handleGoogleAuth = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      if (!isFirebaseLive()) {
        setFeedback({
          message: "Firebase credentials not yet provided. Switching to Firebase Config tab to configure real auth...",
          type: "info"
        });
        setTimeout(() => setTab("CONFIG"), 1200);
        setLoading(false);
        return;
      }

      const user = await loginWithGoogle();
      onUserChange(user);
      setTab("PROFILE");
      setFeedback({
        message: `Welcome, ${user.name}! Authenticated securely via Google.`,
        type: "success"
      });
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      let msg = err.message || "Failed to sign in with Google.";
      if (err.code === "auth/popup-closed-by-user") {
        msg = "Google sign-in popup was closed before completing.";
      } else if (err.code === "auth/unauthorized-domain") {
        msg = "This domain is not authorized in your Firebase Console. Add your Vercel or localhost domain in Firebase > Authentication > Settings.";
      }
      setFeedback({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Handle Email & Password Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setFeedback({ message: "Please fill out email and password.", type: "error" });
      return;
    }

    setLoading(true);
    setFeedback(null);

    if (isFirebaseLive()) {
      try {
        const user = await loginWithEmail(email, password);
        onUserChange(user);
        setTab("PROFILE");
        setFeedback({ message: `Welcome back, ${user.name}!`, type: "success" });
      } catch (err: any) {
        console.error("Email Login Error:", err);
        let msg = "Could not sign in with these credentials.";
        if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
          msg = "Incorrect email or password. Please verify and try again.";
        } else if (err.code === "auth/user-not-found") {
          msg = "No account found with this email. Please Create an Account first.";
        } else if (err.code === "auth/too-many-requests") {
          msg = "Too many failed attempts. Please try again later or reset password.";
        }
        setFeedback({ message: msg, type: "error" });
      } finally {
        setLoading(false);
      }
    } else {
      // Local fallback mode when Firebase credentials haven't been provided yet
      const initials = email.slice(0, 2).toUpperCase();
      const user: UserProfile = {
        id: "usr-" + Date.now(),
        name: email.split("@")[0].replace(".", " "),
        email,
        role: email.includes("scholar") || email.includes("reviewer") ? "REVIEWER" : "READER",
        avatarInitials: initials,
        favoriteStoryIds: StorageService.getFavorites(),
        readingHistory: [
          {
            storyId: "mahabali",
            lastReadAt: new Date().toISOString(),
            progressPercentage: 100
          }
        ],
        preferredLanguage: "EN",
        joinedDate: new Date().toISOString().split("T")[0],
        authProvider: "local",
        isRealAuth: false
      };

      StorageService.setUser(user);
      onUserChange(user);
      setTab("PROFILE");
      setFeedback({
        message: `Welcome, ${user.name}! (Signed in in local session. Add Firebase keys in Config tab for cloud sync).`,
        type: "success"
      });
      setLoading(false);
    }
  };

  // Handle Account Registration
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setFeedback({ message: "Please fill out all required fields.", type: "error" });
      return;
    }
    if (password.length < 6) {
      setFeedback({ message: "Password must be at least 6 characters long.", type: "error" });
      return;
    }

    setLoading(true);
    setFeedback(null);

    if (isFirebaseLive()) {
      try {
        const user = await registerWithEmail(email, password, name, role);
        onUserChange(user);
        setTab("PROFILE");
        setFeedback({
          message: `Account registered successfully on Firebase as ${role}!`,
          type: "success"
        });
      } catch (err: any) {
        console.error("Signup Error:", err);
        let msg = "Could not register account.";
        if (err.code === "auth/email-already-in-use") {
          msg = "An account with this email already exists. Please Sign In.";
        } else if (err.code === "auth/weak-password") {
          msg = "Password is too weak. Please choose a stronger password.";
        }
        setFeedback({ message: msg, type: "error" });
      } finally {
        setLoading(false);
      }
    } else {
      const words = name.trim().split(" ");
      const initials = words.length > 1 ? (words[0][0] + words[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();

      const newUser: UserProfile = {
        id: "usr-" + Date.now(),
        name,
        email,
        role,
        avatarInitials: initials,
        favoriteStoryIds: [],
        readingHistory: [],
        preferredLanguage: "EN",
        joinedDate: new Date().toISOString().split("T")[0],
        authProvider: "local",
        isRealAuth: false
      };

      StorageService.setUser(newUser);
      onUserChange(newUser);
      setTab("PROFILE");
      setFeedback({
        message: `Account created for ${name}! (Add Firebase credentials to sync across devices).`,
        type: "success"
      });
      setLoading(false);
    }
  };

  // Handle Password Reset
  const handleForgotPassword = async () => {
    if (!email) {
      setFeedback({ message: "Please enter your email above to receive a password reset link.", type: "error" });
      return;
    }
    if (!isFirebaseLive()) {
      setFeedback({
        message: "Real password reset requires active Firebase credentials. Configure Firebase in the Config tab.",
        type: "info"
      });
      return;
    }

    setLoading(true);
    try {
      await sendResetPassword(email);
      setFeedback({ message: `Password reset email sent to ${email}. Check your inbox!`, type: "success" });
    } catch (err: any) {
      setFeedback({ message: err.message || "Failed to send reset email.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    setLoading(true);
    await logoutFirebaseUser();
    onUserChange(null);
    setTab("LOGIN");
    setFeedback({ message: "You have been signed out safely.", type: "info" });
    setLoading(false);
  };

  // Handle Save Firebase Config
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cfgApiKey || !cfgProjectId) {
      setFeedback({ message: "API Key and Project ID are required.", type: "error" });
      return;
    }

    const newCfg: FirebaseClientConfig = {
      apiKey: cfgApiKey.trim(),
      authDomain: cfgAuthDomain.trim() || `${cfgProjectId.trim()}.firebaseapp.com`,
      projectId: cfgProjectId.trim(),
      storageBucket: cfgStorageBucket.trim() || `${cfgProjectId.trim()}.appspot.com`,
      messagingSenderId: cfgSenderId.trim(),
      appId: cfgAppId.trim()
    };

    saveCustomFirebaseConfig(newCfg);
    setFirebaseActive(isFirebaseLive());
    setFeedback({
      message: "Firebase configuration saved successfully! Real authentication is now active.",
      type: "success"
    });
    setTab("LOGIN");
  };

  const handleClearConfig = () => {
    clearCustomFirebaseConfig();
    setCfgApiKey("");
    setCfgAuthDomain("");
    setCfgProjectId("");
    setCfgStorageBucket("");
    setCfgSenderId("");
    setCfgAppId("");
    setFirebaseActive(false);
    setFeedback({ message: "Custom Firebase configuration cleared.", type: "info" });
  };

  const userFavorites = currentUser
    ? mockStories.filter((s) => currentUser.favoriteStoryIds?.includes(s.id))
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#FFFDE0] border-4 border-brandBlack rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden shadow-[14px_14px_0px_#FF087D] relative">
        {/* Header */}
        <div className="p-5 bg-brandYellow border-b-2 border-brandBlack flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="bg-brandPink text-white font-mono text-[11px] font-black px-2.5 py-0.5 rounded border border-brandBlack shadow-[1px_1px_0px_#080808]">
              {firebaseActive ? "⚡ CLOUD AUTH" : "CITIZEN PORTAL"}
            </span>
            <h3 className="font-editorial text-2xl font-black text-brandBlack">
              {currentUser ? "My Heritage Profile" : "KathaBridge Access"}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close auth modal"
            className="w-9 h-9 rounded-full border-2 border-brandBlack bg-white hover:bg-brandPink hover:text-white flex items-center justify-center font-black text-lg transition shadow-[2px_2px_0px_#080808] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Live Firebase Status Pill */}
        <div className="px-5 py-2 bg-brandBlack text-white flex items-center justify-between text-xs font-mono font-bold border-b border-brandBlack/40">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${firebaseActive ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}></span>
            <span className="text-[11px]">
              {firebaseActive ? "Real Firebase Authentication Live" : "Local Mode (Add Firebase keys for cloud OAuth)"}
            </span>
          </div>
          <button
            onClick={() => setTab("CONFIG")}
            className="text-[10px] text-brandYellow hover:underline cursor-pointer"
          >
            ⚙️ {firebaseActive ? "Edit Keys" : "Setup Guide"}
          </button>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`font-mono text-xs font-black p-3 text-center border-b ${
              feedback.type === "success"
                ? "bg-emerald-600 text-white border-emerald-800"
                : feedback.type === "error"
                ? "bg-brandVermillion text-white border-brandBlack"
                : "bg-brandYellow text-brandBlack border-brandBlack"
            }`}
          >
            ✦ {feedback.message}
          </div>
        )}

        {/* Tab Buttons (if not logged in) */}
        {!currentUser && (
          <div className="grid grid-cols-3 border-b-2 border-brandBlack font-mono text-xs font-black shrink-0">
            <button
              onClick={() => {
                setTab("LOGIN");
                setFeedback(null);
              }}
              className={`py-3 transition cursor-pointer ${tab === "LOGIN" ? "bg-brandPink text-white" : "bg-white text-brandBlack hover:bg-neutral-100"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setTab("SIGNUP");
                setFeedback(null);
              }}
              className={`py-3 transition cursor-pointer ${tab === "SIGNUP" ? "bg-brandPink text-white" : "bg-white text-brandBlack hover:bg-neutral-100"}`}
            >
              Create Account
            </button>
            <button
              onClick={() => {
                setTab("CONFIG");
                setFeedback(null);
              }}
              className={`py-3 transition cursor-pointer ${tab === "CONFIG" ? "bg-brandPink text-white" : "bg-white text-brandBlack hover:bg-neutral-100"}`}
            >
              Firebase Keys
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {currentUser ? (
            /* User Profile View */
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border-2 border-brandBlack shadow-[4px_4px_0px_#080808]">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.name}
                    className="w-16 h-16 rounded-full border-2 border-brandBlack object-cover shadow-[2px_2px_0px_#080808] shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-brandPink text-white border-2 border-brandBlack flex items-center justify-center text-xl font-black shadow-[2px_2px_0px_#080808] shrink-0">
                    {currentUser.avatarInitials}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-editorial text-xl font-black text-brandBlack">{currentUser.name}</h4>
                    <span className="bg-brandYellow text-brandBlack text-[10px] font-mono font-black px-2 py-0.5 rounded border border-brandBlack">
                      {currentUser.role}
                    </span>
                  </div>
                  <p className="text-xs font-mono font-medium text-neutral-600 mt-0.5">{currentUser.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-neutral-500">
                      Archivist since {currentUser.joinedDate}
                    </span>
                    <span className="text-[10px] font-mono bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300">
                      {currentUser.authProvider === "google" ? "Google OAuth ✓" : "Email & Pass"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Saved Stories */}
              <div>
                <span className="font-mono text-xs font-black text-brandPink uppercase block mb-2">
                  ★ Saved Favorite Stories ({userFavorites.length})
                </span>
                {userFavorites.length === 0 ? (
                  <p className="text-xs font-mono text-neutral-500 bg-white p-3 rounded-xl border border-brandBlack">
                    No saved stories yet. Click the star icon on any story card to bookmark it!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {userFavorites.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between p-3 bg-white rounded-xl border-2 border-brandBlack hover:border-brandPink transition cursor-pointer"
                        onClick={() => {
                          if (onSelectStory) {
                            onSelectStory(s);
                            onClose();
                          }
                        }}
                      >
                        <div>
                          <div className="font-bold text-sm text-brandBlack">{s.title.EN}</div>
                          <span className="text-[10px] font-mono text-neutral-500">{s.categoryLabel} • {s.readingDurationMinutes} min</span>
                        </div>
                        <span className="text-brandPink font-mono text-xs font-black">Open →</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reading History */}
              <div>
                <span className="font-mono text-xs font-black text-brandBlack uppercase block mb-2">
                  📖 Reading History ({currentUser.readingHistory?.length || 0})
                </span>
                <div className="space-y-2">
                  {(currentUser.readingHistory || []).map((h, i) => {
                    const st = mockStories.find((s) => s.id === h.storyId);
                    return (
                      <div key={i} className="p-3 bg-white rounded-xl border border-neutral-300 text-xs font-mono flex items-center justify-between">
                        <div>
                          <span className="font-bold text-brandBlack block">{st?.title.EN || h.storyId}</span>
                          <span className="text-[10px] text-neutral-500">Progress: {h.progressPercentage}%</span>
                        </div>
                        <span className="text-emerald-700 font-bold">{h.progressPercentage === 100 ? "Completed ✓" : "In Progress"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => downloadReadingPortfolio(currentUser.name)}
                  className="w-full bg-brandYellow hover:bg-white text-brandBlack py-2.5 rounded-full font-mono text-xs font-black border-2 border-brandBlack transition shadow-[2px_2px_0px_#080808] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>📜</span>
                  <span>Export Living Heritage Portfolio (JSON)</span>
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleLogout}
                  className="w-full bg-white hover:bg-neutral-100 text-brandVermillion py-2.5 rounded-full font-mono text-xs font-black border-2 border-brandBlack transition shadow-[2px_2px_0px_#080808] cursor-pointer"
                >
                  {loading ? "Signing Out..." : "Sign Out of Account"}
                </button>
              </div>
            </div>
          ) : tab === "LOGIN" ? (
            /* Login Form */
            <div className="space-y-4">
              {/* Google OAuth Button */}
              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleAuth}
                className="w-full bg-white hover:bg-neutral-50 text-brandBlack py-3 px-4 rounded-full font-mono text-xs font-black border-2 border-brandBlack transition shadow-[3px_3px_0px_#080808] flex items-center justify-center gap-3 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t-2 border-brandBlack/20"></div>
                <span className="flex-shrink mx-3 text-[10px] font-mono font-black uppercase text-neutral-500">
                  OR WITH EMAIL
                </span>
                <div className="flex-grow border-t-2 border-brandBlack/20"></div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block font-mono text-xs font-black text-brandBlack mb-1 uppercase">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="reader@kathabridge.org"
                    className="w-full bg-white border-2 border-brandBlack p-3 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-brandPink outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-mono text-xs font-black text-brandBlack uppercase">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-[11px] font-mono font-bold text-brandPink hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border-2 border-brandBlack p-3 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-brandPink outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brandPink hover:bg-brandPinkDark text-white py-3 rounded-full font-mono text-xs font-black uppercase transition border-2 border-brandBlack shadow-[4px_4px_0px_#080808] cursor-pointer"
                >
                  {loading ? "Authenticating..." : "Sign In to KathaBridge →"}
                </button>
              </form>
            </div>
          ) : tab === "SIGNUP" ? (
            /* Signup Form */
            <div className="space-y-4">
              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleAuth}
                className="w-full bg-white hover:bg-neutral-50 text-brandBlack py-3 px-4 rounded-full font-mono text-xs font-black border-2 border-brandBlack transition shadow-[3px_3px_0px_#080808] flex items-center justify-center gap-3 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Sign up with Google</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t-2 border-brandBlack/20"></div>
                <span className="flex-shrink mx-3 text-[10px] font-mono font-black uppercase text-neutral-500">
                  OR WITH EMAIL
                </span>
                <div className="flex-grow border-t-2 border-brandBlack/20"></div>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block font-mono text-xs font-black text-brandBlack mb-1 uppercase">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sreejith Warrier"
                    className="w-full bg-white border-2 border-brandBlack p-3 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-brandPink outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs font-black text-brandBlack mb-1 uppercase">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full bg-white border-2 border-brandBlack p-3 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-brandPink outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs font-black text-brandBlack mb-1 uppercase">Account Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-white border-2 border-brandBlack p-3 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-brandPink outline-none"
                  >
                    <option value="READER">Reader (Read, listen &amp; bookmark)</option>
                    <option value="CONTRIBUTOR">Folklore Contributor (Submit tales &amp; idioms)</option>
                    <option value="REVIEWER">Folklore Scholar / Reviewer (Access review workstation)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs font-black text-brandBlack mb-1 uppercase">Password (min 6 chars)</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border-2 border-brandBlack p-3 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-brandPink outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brandPink hover:bg-brandPinkDark text-white py-3 rounded-full font-mono text-xs font-black uppercase transition border-2 border-brandBlack shadow-[4px_4px_0px_#080808] cursor-pointer"
                >
                  {loading ? "Creating Account..." : "Create Account →"}
                </button>
              </form>
            </div>
          ) : (
            /* Firebase Config & Live Setup Guide */
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border-2 border-brandBlack text-xs font-mono space-y-2">
                <span className="font-black text-brandPink uppercase block text-[11px]">
                  ✦ Real Firebase Authentication Setup
                </span>
                <p className="text-neutral-700 leading-relaxed text-[11px]">
                  To enable real <strong>Google One-Tap OAuth</strong> and <strong>Email/Password sync</strong>:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-neutral-600">
                  <li>Create a free project at <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-brandPink underline">console.firebase.google.com</a></li>
                  <li>Enable <strong>Google</strong> &amp; <strong>Email/Password</strong> in Authentication &gt; Sign-in method</li>
                  <li>In Project Settings, register a Web App and paste the keys below (or into <code className="bg-neutral-100 px-1 py-0.5 rounded border border-neutral-300">.env</code>)</li>
                  <li>For Vercel, add your Vercel URL to Authorized Domains in Firebase</li>
                </ol>
              </div>

              <form onSubmit={handleSaveConfig} className="space-y-3 font-mono text-xs">
                <div>
                  <label className="block font-black text-brandBlack mb-1 uppercase text-[10px]">API Key (VITE_FIREBASE_API_KEY)</label>
                  <input
                    type="text"
                    required
                    value={cfgApiKey}
                    onChange={(e) => setCfgApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-white border-2 border-brandBlack p-2.5 rounded-xl font-mono text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-black text-brandBlack mb-1 uppercase text-[10px]">Project ID</label>
                    <input
                      type="text"
                      required
                      value={cfgProjectId}
                      onChange={(e) => setCfgProjectId(e.target.value)}
                      placeholder="kathabridge-heritage"
                      className="w-full bg-white border-2 border-brandBlack p-2.5 rounded-xl font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-brandBlack mb-1 uppercase text-[10px]">App ID</label>
                    <input
                      type="text"
                      value={cfgAppId}
                      onChange={(e) => setCfgAppId(e.target.value)}
                      placeholder="1:123456789:web:abcdef"
                      className="w-full bg-white border-2 border-brandBlack p-2.5 rounded-xl font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-black text-brandBlack mb-1 uppercase text-[10px]">Auth Domain (optional)</label>
                  <input
                    type="text"
                    value={cfgAuthDomain}
                    onChange={(e) => setCfgAuthDomain(e.target.value)}
                    placeholder="kathabridge-heritage.firebaseapp.com"
                    className="w-full bg-white border-2 border-brandBlack p-2.5 rounded-xl font-mono text-xs"
                  />
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-brandYellow hover:bg-yellow-300 text-brandBlack font-black py-2.5 px-4 rounded-full border-2 border-brandBlack shadow-[2px_2px_0px_#080808] cursor-pointer"
                  >
                    Save &amp; Activate Real Firebase
                  </button>
                  {activeCfg && (
                    <button
                      type="button"
                      onClick={handleClearConfig}
                      className="bg-white hover:bg-neutral-100 text-brandVermillion font-black py-2.5 px-4 rounded-full border-2 border-brandBlack cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
