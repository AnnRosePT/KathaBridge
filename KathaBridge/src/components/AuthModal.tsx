import React, { useState } from "react";
import { UserProfile, Story } from "../types";
import { StorageService } from "../services/storageService";
import { mockStories } from "../data/mockData";

interface Props {
  currentUser: UserProfile | null;
  onUserChange: (user: UserProfile | null) => void;
  onClose: () => void;
  onSelectStory?: (story: Story) => void;
}

export const AuthModal: React.FC<Props> = ({ currentUser, onUserChange, onClose, onSelectStory }) => {
  const [tab, setTab] = useState<"LOGIN" | "SIGNUP" | "PROFILE">(currentUser ? "PROFILE" : "LOGIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"READER" | "CONTRIBUTOR" | "REVIEWER">("READER");
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setFeedback("Please fill out all credentials.");
      return;
    }

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
      joinedDate: new Date().toISOString().split("T")[0]
    };

    StorageService.setUser(user);
    onUserChange(user);
    setTab("PROFILE");
    setFeedback(`Welcome back, ${user.name}!`);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setFeedback("Please fill out all fields.");
      return;
    }

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
      joinedDate: new Date().toISOString().split("T")[0]
    };

    StorageService.setUser(newUser);
    onUserChange(newUser);
    setTab("PROFILE");
    setFeedback(`Account registered successfully as ${role}!`);
  };

  const handleLogout = () => {
    StorageService.setUser(null);
    onUserChange(null);
    setTab("LOGIN");
    setFeedback("You have been signed out.");
  };

  const userFavorites = currentUser
    ? mockStories.filter((s) => currentUser.favoriteStoryIds.includes(s.id))
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#FFFDE0] border-4 border-brandBlack rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden shadow-[14px_14px_0px_#FF087D] relative">
        {/* Header */}
        <div className="p-5 bg-brandYellow border-b-2 border-brandBlack flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="bg-brandPink text-white font-mono text-[11px] font-black px-2.5 py-0.5 rounded border border-brandBlack shadow-[1px_1px_0px_#080808]">
              CITIZEN ACCOUNT
            </span>
            <h3 className="font-editorial text-2xl font-black text-brandBlack">
              {currentUser ? "My Heritage Profile" : "KathaBridge Portal"}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close auth modal"
            className="w-9 h-9 rounded-full border-2 border-brandBlack bg-white hover:bg-brandPink hover:text-white flex items-center justify-center font-black text-lg transition shadow-[2px_2px_0px_#080808]"
          >
            ✕
          </button>
        </div>

        {feedback && (
          <div className="bg-brandBlack text-brandYellow font-mono text-xs font-black p-2.5 text-center border-b border-brandPink">
            ✦ {feedback}
          </div>
        )}

        {/* Tab Buttons (if not logged in) */}
        {!currentUser && (
          <div className="grid grid-cols-2 border-b-2 border-brandBlack font-mono text-xs font-black shrink-0">
            <button
              onClick={() => setTab("LOGIN")}
              className={`py-3 transition ${tab === "LOGIN" ? "bg-brandPink text-white" : "bg-white text-brandBlack hover:bg-neutral-100"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab("SIGNUP")}
              className={`py-3 transition ${tab === "SIGNUP" ? "bg-brandPink text-white" : "bg-white text-brandBlack hover:bg-neutral-100"}`}
            >
              Create Account
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
                <div className="w-16 h-16 rounded-full bg-brandPink text-white border-2 border-brandBlack flex items-center justify-center text-xl font-black shadow-[2px_2px_0px_#080808] shrink-0">
                  {currentUser.avatarInitials}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-editorial text-xl font-black text-brandBlack">{currentUser.name}</h4>
                    <span className="bg-brandYellow text-brandBlack text-[10px] font-mono font-black px-2 py-0.5 rounded border border-brandBlack">
                      {currentUser.role}
                    </span>
                  </div>
                  <p className="text-xs font-mono font-medium text-neutral-600 mt-0.5">{currentUser.email}</p>
                  <p className="text-[11px] font-mono text-neutral-500 mt-1">Archivist since {currentUser.joinedDate}</p>
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
                  📖 Reading History ({currentUser.readingHistory.length})
                </span>
                <div className="space-y-2">
                  {currentUser.readingHistory.map((h, i) => {
                    const st = mockStories.find((s) => s.id === h.storyId);
                    return (
                      <div key={i} className="p-3 bg-white rounded-xl border border-neutral-300 text-xs font-mono flex items-center justify-between">
                        <div>
                          <span className="font-bold text-brandBlack block">{st?.title.EN || h.storyId}</span>
                          <span className="text-[10px] text-neutral-500">Progress: {h.progressPercentage}%</span>
                        </div>
                        <span className="text-brandEmerald font-bold">{h.progressPercentage === 100 ? "Completed ✓" : "In Progress"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full bg-white hover:bg-neutral-100 text-brandVermillion py-2.5 rounded-full font-mono text-xs font-black border-2 border-brandBlack transition shadow-[2px_2px_0px_#080808]"
                >
                  Sign Out of Account
                </button>
              </div>
            </div>
          ) : tab === "LOGIN" ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block font-mono text-xs font-black text-brandBlack mb-1 uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@heritage.org (use scholar@ for reviewer access)"
                  className="w-full bg-white border-2 border-brandBlack p-3 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-brandPink outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-black text-brandBlack mb-1 uppercase">Password</label>
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
                className="w-full bg-brandPink hover:bg-brandPinkDark text-white py-3 rounded-full font-mono text-xs font-black uppercase transition border-2 border-brandBlack shadow-[4px_4px_0px_#080808]"
              >
                Sign In to KathaBridge →
              </button>
            </form>
          ) : (
            /* Signup Form */
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
                <label className="block font-mono text-xs font-black text-brandBlack mb-1 uppercase">Password</label>
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
                className="w-full bg-brandPink hover:bg-brandPinkDark text-white py-3 rounded-full font-mono text-xs font-black uppercase transition border-2 border-brandBlack shadow-[4px_4px_0px_#080808]"
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

