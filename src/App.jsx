import React, { useState, useRef } from "react";
import styles from "./assets/css/App.module.css"

const App = () => {
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [tier, setTier] = useState("fav");
  const [users, setUsers] = useState([]);
  const previewRef = useRef(null);

  const tiers = [
    "fav",
    "elite",
    "we need to interact more",
    "neutral",
    "idk you",
    "stranger",
  ];

  const extractUsernameFromLink = (link) => {
    const patterns = [
      /(?:twitter\.com|x\.com)\/([^/?]+)/i,
      /^@?([a-zA-Z0-9_]{1,15})$/,
    ];

    for (const pattern of patterns) {
      const match = link.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const createDefaultAvatar = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 48;
    canvas.height = 48;

    ctx.fillStyle = "#1DA1F2";
    ctx.beginPath();
    ctx.arc(24, 24, 24, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(24, 18, 8, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(24, 38, 12, 0, Math.PI);
    ctx.fill();

    return canvas.toDataURL("image/png");
  };

  const generateAvatarUrl = (username) => {
    return `https://unavatar.io/x/${username}`;
  };

  const addUser = () => {
    if (!username.trim()) {
      alert("Please enter a username or profile link");
      return;
    }

    let finalUsername = username.trim();
    let finalAvatarUrl = avatarUrl.trim();

    if (username.includes("/")) {
      const extracted = extractUsernameFromLink(username);
      if (extracted) {
        finalUsername = extracted;
      }
    }

    finalUsername = finalUsername.replace("@", "");

    if (!finalAvatarUrl) {
      finalAvatarUrl = generateAvatarUrl(finalUsername);
    }

    if (
      users.some(
        (user) => user.username.toLowerCase() === finalUsername.toLowerCase()
      )
    ) {
      alert("User already added!");
      return;
    }

    const newUser = {
      id: Date.now(), // Simple ID generation
      username: finalUsername,
      avatar: finalAvatarUrl,
      tier: tier,
    };

    setUsers([...users, newUser]);
    setUsername("");
    setAvatarUrl("");
  };

  const removeUser = (userId) => {
    setUsers(users.filter((user) => user.id !== userId));
  };

  const changeUserTier = (userId, newTier) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, tier: newTier } : user
      )
    );
  };

  const groupedUsers = tiers.reduce((acc, t) => {
    acc[t] = users.filter((u) => u.tier === t);
    return acc;
  }, {});

  const tierColors = [
    "#ff4757", // fav - red
    "#ff6b35", // elite - orange-red
    "#ff9500", // we need to interact more - orange
    "#ffa502", // neutral - yellow
    "#2ed573", // idk you - green
    "#26de81", // stranger - light green
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        Twitter Followers Ranking Tool
      </h1>
      <p className={styles.description}>
        Add Twitter users by username or profile link, rank them in different
        tiers, and take a screenshot of your ranking!
      </p>

      <div className={styles.addUserForm}>
        <h3 className={styles.formTitle}>Add New User</h3>
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            Username or Profile Link:
          </label>
          <input
            type="text"
            placeholder="@username, username, or https://x.com/username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.input}
            onKeyPress={(e) => e.key === "Enter" && addUser()}
          />
        </div>

        <div className={styles.inputGroupLarge}>
          <label className={styles.label}>
            Custom Avatar URL (optional):
          </label>
          <input
            type="text"
            placeholder="https://example.com/avatar.jpg (leave empty to auto-generate)"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.formControls}>
          <div className={styles.selectContainer}>
            <label className={styles.label}>
              Tier:
            </label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className={styles.select}
            >
              {tiers.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={addUser}
            className={styles.addButton}
          >
            Add User
          </button>
        </div>
      </div>

      {users.length > 0 && (
        <div className={styles.usersSection}>
          <h3 className={styles.usersTitle}>Added Users ({users.length})</h3>
          <div className={styles.usersContainer}>
            {users.map((user) => (
              <div
                key={user.id}
                className={styles.userItem}
              >
                <img
                  src={user.avatar}
                  alt={user.username}
                  className={styles.userAvatar}
                  onError={(e) => {
                    e.target.src = createDefaultAvatar();
                  }}
                />
                <span className={styles.userName}>
                  @{user.username}
                </span>
                <select
                  value={user.tier}
                  onChange={(e) => changeUserTier(user.id, e.target.value)}
                  className={styles.userSelect}
                >
                  {tiers.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => removeUser(user.id)}
                  className={styles.removeButton}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.rankingContainer}>
        <h2 className={styles.rankingTitle}>
          Your Twitter Followers Ranking
        </h2>
        <p className={styles.credit}>
          Made with ❤️ by @itz_Manish02
        </p>
        <div
          ref={previewRef}
          className={styles.rankingPreview}
        >
          {tiers.map((t, index) => (
            <div
              key={t}
              className={styles.tierRow}
            >
              <div
                className={styles.tierLabel}
                style={{ backgroundColor: tierColors[index] }}
              >
                {t.toUpperCase()}
              </div>
              <div className={styles.tierContent}>
                {groupedUsers[t]?.length > 0 ? (
                  groupedUsers[t].map((u) => (
                    <div
                      key={u.id}
                      className={styles.tierUserItem}
                    >
                      <img
                        src={u.avatar}
                        alt={u.username}
                        className={styles.tierUserAvatar}
                        onError={(e) => {
                          e.target.src = createDefaultAvatar();
                        }}
                      />
                      <span className={styles.tierUserName}>
                        @{u.username}
                      </span>
                    </div>
                  ))
                ) : (
                  <span className={styles.emptyTier}>
                    No users in this tier...
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {users.length > 0 && (
          <div className={styles.tipSection}>
            <p className={styles.tipText}>
              💡 <strong>Tip:</strong> Use your device's screenshot feature to
              capture and share this ranking!
              <br />
              <span className={styles.noteText}>Note:</span> Loading pfp can take some seconds!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;