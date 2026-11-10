import React, { useState } from "react";
import { UserProfile, Story } from "../types";
import { StorageService } from "../services/storageService";
import { mockStories } from "../data/mockData";
import { downloadReadingPortfolio } from "../utils/exportProgress";

interface Props {
  currentUser: UserProfile | null;
  onUserChange: (user: UserProfile | null) => void;
  onClose: () => void;
  onSelectStory?: (story: Story) => void;
}

export const AuthModal: React.FC<Props> = ({
  currentUser,
  onUserChange,
  onClose,
  onSelectStory
}) => {
  const [tab, setTab] = useState<"LOGIN" | "SIGNUP" | "PROFILE">(
    currentUser ? "PROFILE" : "LOGIN"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"READER" | "CONTRIBUTOR" | "REVIEWER" | "SCHOLAR">("READER");
  const [feedback, setFeedback] = useState<{ message: string; type: "info" | "success" | "error" } | null>(null);

  // Simple, Direct Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setFeedback({ message: "Please enter your email/username and password.", type: "error" });
      return;
    }

    const cleanEmail = email.trim();
    const namePart = cleanEmail.includes("@") ? cleanEmail.split("@")[0] : cleanEmail;
    const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    const initials = (namePart.slice(0, 2) || "KB").toUpperCase();

    // Check if this user had existing history
    const existing = StorageService.getUser();
    const user: UserProfile = {
      id: "usr-" + Date.now(),
      name: displayName,
      email: cleanEmail.includes("@") ? cleanEmail : `${cleanEmail}@kathabridge.org`,
      role: cleanEmail.toLowerCase().includes("scholar") || cleanEmail.toLowerCase().includes("reviewer") ? "REVIEWER" : "READER",
      avatarInitials: initials,
      favoriteStoryIds: existing?.favoriteStoryIds?.length ? existing.favoriteStoryIds : StorageService.getFavorites(),
      readingHistory: existing?.readingHistory?.length
        ? existing.readingHistory
        : [
            {
              storyId: "mahabali",
              lastReadAt: new Date().toISOString(),
              progressPercentage: 100
            },
            {
              storyId: "theyyam",
              lastReadAt: new Date(Date.now() - 3600000 * 24).toISOString(),
              progressPercentage: 65
            }
          ],
      preferredLanguage: "EN",
      joinedDate: existing?.joinedDate || new Date().toISOString().split("T")[0],
      authProvider: "local",
      isRealAuth: true
    };

    StorageService.setUser(user);
    onUserChange(user);
    setTab("PROFILE");
    setFeedback({ message: `Welcome back, ${user.name}!`, type: "success" });
  };

  // One-Click Instant Sign In
  const handleQuickDemoLogin = (roleType: "READER" | "SCHOLAR" = "SCHOLAR") => {
    const demoUser: UserProfile = {
      id: "usr-demo-" + Date.now(),
      name: roleType === "SCHOLAR" ? "Aarav Sharma" : "Devi Varma",
      email: roleType === "SCHOLAR" ? "aarav.sharma@kathabridge.org" : "devi.varma@heritage.in",
      role: roleType,
      avatarInitials: roleType === "SCHOLAR" ? "AS" : "DV",
      favoriteStoryIds: ["mahabali", "theyyam", "panchatantra"],
      readingHistory: [
        {
          storyId: "mahabali",
          lastReadAt: new Date().toISOString(),
          progressPercentage: 100
        },
        {
          storyId: "theyyam",
          lastReadAt: new Date(Date.now() - 3600000 * 20).toISOString(),
          progressPercentage: 80
        },
        {
          storyId: "panchatantra",
          lastReadAt: new Date(Date.now() - 3600000 * 48).toISOString(),
          progressPercentage: 100
        }
      ],
      preferredLanguage: "EN",
      joinedDate: "November 2026",
      authProvider: "local",
      isRealAuth: true
    };

    StorageService.setUser(demoUser);
    onUserChange(demoUser);
    setTab("PROFILE");
    setFeedback({ message: `Signed in as ${demoUser.name} (${demoUser.role})!`, type: "success" });
  };

  // Simple, Direct Account Creation
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setFeedback({ message: "Please fill out all fields.", type: "error" });
      return;
    }

    const words = name.trim().split(" ");
    const initials =
      words.length > 1
        ? (words[0][0] + words[1][0]).toUpperCase()
        : name.trim().slice(0, 2).toUpperCase();

    const newUser: UserProfile = {
      id: "usr-" + Date.now(),
      name: name.trim(),
      email: email.trim(),
      role,
      avatarInitials: initials,
      favoriteStoryIds: ["mahabali"],
      readingHistory: [
        {
          storyId: "mahabali",
          lastReadAt: new Date().toISOString(),
          progressPercentage: 25
        }
      ],
      preferredLanguage: "EN",
      joinedDate: new Date().toISOString().split("T")[0],
      authProvider: "local",
      isRealAuth: true
    };

    StorageService.setUser(newUser);
    onUserChange(newUser);
    setTab("PROFILE");
    setFeedback({
      message: `Account created for ${newUser.name}! Ready to explore folklore.`,
      type: "success"
    });
  };

  // Clear Reading History
  const handleClearHistory = () => {
    if (!currentUser) return;
    const updated = { ...currentUser, readingHistory: [] };
    StorageService.setUser(updated);
    onUserChange(updated);
    setFeedback({ message: "Reading history has been cleared.", type: "info" });
  };

  // Sign Out
  const handleLogout = () => {
    StorageService.setUser(null);
    onUserChange(null);
    setTab("LOGIN");
    setFeedback({ message: "You have signed out safely.", type: "info" });
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
              {currentUser ? "ARCHIVIST PROFILE" : "CITIZEN ACCESS"}
            </span>
            <h3 className="font-editorial text-2xl font-black text-brandBlack">
              {currentUser ? "My Heritage Profile" : "Sign In to KathaBridge"}
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

        {/* Feedback Message */}
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
          <div className="grid grid-cols-2 border-b-2 border-brandBlack font-mono text-xs font-black shrink-0">
            <button
              onClick={() => {
                setTab("LOGIN");
                setFeedback(null);
              }}
              className={`py-3 transition cursor-pointer ${
                tab === "LOGIN"
                  ? "bg-brandPink text-white"
                  : "bg-white text-brandBlack hover:bg-neutral-100"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setTab("SIGNUP");
                setFeedback(null);
              }}
              className={`py-3 transition cursor-pointer ${
                tab === "SIGNUP"
                  ? "bg-brandPink text-white"
                  : "bg-white text-brandBlack hover:bg-neutral-100"
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {currentUser ? (
            /* User Profile & Full History View */
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border-2 border-brandBlack shadow-[4px_4px_0px_#080808]">
                <div className="w-16 h-16 rounded-full bg-brandPink text-white border-2 border-brandBlack flex items-center justify-center text-xl font-black shadow-[2px_2px_0px_#080808] shrink-0">
                  {currentUser.avatarInitials}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-editorial text-xl font-black text-brandBlack">
                      {currentUser.name}
                    </h4>
                    <span className="bg-brandYellow text-brandBlack text-[10px] font-mono font-black px-2 py-0.5 rounded border border-brandBlack">
                      {currentUser.role}
                    </span>
                  </div>
                  <p className="text-xs font-mono font-medium text-neutral-600 mt-0.5">
                    {currentUser.email}
                  </p>
                  <p className="text-[11px] font-mono text-neutral-500 mt-1">
                    Archivist since {currentUser.joinedDate}
                  </p>
                </div>
              </div>

              {/* Detailed Reading History */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-black text-brandBlack uppercase flex items-center gap-1.5">
                    <span>📖</span>
                    <span>Reading History ({currentUser.readingHistory?.length || 0})</span>
                  </span>
                  {currentUser.readingHistory?.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearHistory}
                      className="text-[10px] font-mono text-neutral-500 hover:text-brandVermillion underline cursor-pointer"
                    >
                      Clear History
                    </button>
                  )}
                </div>

                {(!currentUser.readingHistory || currentUser.readingHistory.length === 0) ? (
                  <p className="text-xs font-mono text-neutral-500 bg-white p-3 rounded-xl border border-brandBlack">
                    No reading history yet. Open any folklore tale to begin tracking your progress!
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {currentUser.readingHistory.map((item, idx) => {
                      const storyObj = mockStories.find((s) => s.id === item.storyId);
                      const isComplete = item.progressPercentage >= 100;
                      return (
                        <div
                          key={idx}
                          className="p-3.5 bg-white rounded-xl border-2 border-brandBlack text-xs font-mono shadow-[2px_2px_0px_#080808] flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-brandBlack">
                              {storyObj?.title.EN || item.storyId}
                            </span>
                            <span
                              className={`text-[11px] font-black px-2 py-0.5 rounded border ${
                                isComplete
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                  : "bg-amber-100 text-amber-800 border-amber-300"
                              }`}
                            >
                              {isComplete ? "Completed ✓" : `${item.progressPercentage}% Read`}
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden border border-neutral-300">
                            <div
                              className="bg-brandPink h-full transition-all duration-300"
                              style={{ width: `${Math.min(100, item.progressPercentage)}%` }}
                            ></div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1">
                            <span>
                              {item.lastReadAt
                                ? `Last accessed: ${new Date(item.lastReadAt).toLocaleDateString()}`
                                : "Recent session"}
                            </span>
                            {storyObj && onSelectStory && (
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectStory(storyObj);
                                  onClose();
                                }}
                                className="font-black text-brandPink hover:underline cursor-pointer"
                              >
                                Resume Reading →
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Saved Favorites */}
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
                          <span className="text-[10px] font-mono text-neutral-500">
                            {s.categoryLabel} • {s.readingDurationMinutes} min
                          </span>
                        </div>
                        <span className="text-brandPink font-mono text-xs font-black">Open →</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
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
                  onClick={handleLogout}
                  className="w-full bg-white hover:bg-neutral-100 text-brandVermillion py-2.5 rounded-full font-mono text-xs font-black border-2 border-brandBlack transition shadow-[2px_2px_0px_#080808] cursor-pointer"
                >
                  Sign Out of Account
                </button>
              </div>
            </div>
          ) : tab === "LOGIN" ? (
            /* Clean Simple Login Form */
            <div className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block font-mono text-xs font-black text-brandBlack mb-1 uppercase">
                    Email or Username
                  </label>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. aarav or reader@kathabridge.org"
                    className="w-full bg-white border-2 border-brandBlack p-3 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-brandPink outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs font-black text-brandBlack mb-1 uppercase">
                    Password
                  </label>
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
                  className="w-full bg-brandPink hover:bg-brandPinkDark text-white py-3.5 rounded-full font-mono text-xs font-black uppercase transition border-2 border-brandBlack shadow-[4px_4px_0px_#080808] cursor-pointer"
                >
                  Sign In to KathaBridge →
                </button>
              </form>

              {/* Instant 1-Click Demo Login */}
              <div className="pt-2 border-t-2 border-brandBlack/10">
                <span className="block text-center text-[10px] font-mono uppercase text-neutral-500 mb-2 font-bold">
                  OR TEST INSTANTLY WITH 1-CLICK
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin("SCHOLAR")}
                    className="bg-brandYellow hover:bg-yellow-300 text-brandBlack py-2 px-3 rounded-xl font-mono text-[11px] font-black border-2 border-brandBlack shadow-[2px_2px_0px_#080808] transition cursor-pointer"
                  >
                    ⚡ Aarav (Scholar)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin("READER")}
                    className="bg-white hover:bg-neutral-100 text-brandBlack py-2 px-3 rounded-xl font-mono text-[11px] font-black border-2 border-brandBlack shadow-[2px_2px_0px_#080808] transition cursor-pointer"
                  >
                    📖 Devi (Reader)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Clean Simple Signup Form */
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block font-mono text-xs font-black text-brandBlack mb-1 uppercase">
                  Full Name
                </label>
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
                <label className="block font-mono text-xs font-black text-brandBlack mb-1 uppercase">
                  Email Address
                </label>
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
                <label className="block font-mono text-xs font-black text-brandBlack mb-1 uppercase">
                  Account Role
                </label>
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
                <label className="block font-mono text-xs font-black text-brandBlack mb-1 uppercase">
                  Password
                </label>
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
                className="w-full bg-brandPink hover:bg-brandPinkDark text-white py-3.5 rounded-full font-mono text-xs font-black uppercase transition border-2 border-brandBlack shadow-[4px_4px_0px_#080808] cursor-pointer"
              >
                Create Account →
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
