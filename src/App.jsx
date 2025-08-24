import React, { useState, useRef } from "react";

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

  // Function to extract username from Twitter/X link
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

  // Create a default avatar as base64
  const createDefaultAvatar = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 48;
    canvas.height = 48;

    // Draw a circular background
    ctx.fillStyle = "#1DA1F2";
    ctx.beginPath();
    ctx.arc(24, 24, 24, 0, 2 * Math.PI);
    ctx.fill();

    // Draw a simple person icon
    ctx.fillStyle = "#FFFFFF";
    // Head
    ctx.beginPath();
    ctx.arc(24, 18, 8, 0, 2 * Math.PI);
    ctx.fill();

    // Body
    ctx.beginPath();
    ctx.arc(24, 38, 12, 0, Math.PI);
    ctx.fill();

    return canvas.toDataURL("image/png");
  };

  // Generate Twitter avatar URL from username
  const generateAvatarUrl = (username) => {
    // Use unavatar.io which has better CORS support
    return `https://unavatar.io/x/${username}`;
  };

  const addUser = () => {
    if (!username.trim()) {
      alert("Please enter a username or profile link");
      return;
    }

    let finalUsername = username.trim();
    let finalAvatarUrl = avatarUrl.trim();

    // Try to extract username from link if it looks like a URL
    if (username.includes("/")) {
      const extracted = extractUsernameFromLink(username);
      if (extracted) {
        finalUsername = extracted;
      }
    }

    // Remove @ if present
    finalUsername = finalUsername.replace("@", "");

    // If no custom avatar URL, generate one
    if (!finalAvatarUrl) {
      finalAvatarUrl = generateAvatarUrl(finalUsername);
    }

    // Check if user already exists
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

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{ color: "#1DA1F2", marginBottom: "10px", textAlign: "center" }}
      >
        Twitter Followers Ranking Tool
      </h1>
      <p
        style={{
          color: "#666",
          marginBottom: "30px",
          textAlign: "center",
          maxWidth: "800px",
          margin: "0 auto 30px",
        }}
      >
        Add Twitter users by username or profile link, rank them in different
        tiers, and take a screenshot of your ranking!
      </p>

      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "25px",
          borderRadius: "12px",
          marginBottom: "30px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          maxWidth: "1000px",
          margin: "0 auto 30px",
        }}
      >
        <h3 style={{ marginTop: "0", color: "#333" }}>Add New User</h3>
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#444",
            }}
          >
            Username or Profile Link:
          </label>
          <input
            type="text"
            placeholder="@username, username, or https://x.com/username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              maxWidth: "400px",
              padding: "12px",
              border: "2px solid #e1e8ed",
              borderRadius: "8px",
              fontSize: "14px",
              transition: "border-color 0.2s",
            }}
            onKeyPress={(e) => e.key === "Enter" && addUser()}
            onFocus={(e) => (e.target.style.borderColor = "#1DA1F2")}
            onBlur={(e) => (e.target.style.borderColor = "#e1e8ed")}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#444",
            }}
          >
            Custom Avatar URL (optional):
          </label>
          <input
            type="text"
            placeholder="https://example.com/avatar.jpg (leave empty to auto-generate)"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            style={{
              width: "100%",
              maxWidth: "400px",
              padding: "12px",
              border: "2px solid #e1e8ed",
              borderRadius: "8px",
              fontSize: "14px",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#1DA1F2")}
            onBlur={(e) => (e.target.style.borderColor = "#e1e8ed")}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: "15px",
            alignItems: "end",
            flexWrap: "wrap",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#444",
              }}
            >
              Tier:
            </label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              style={{
                padding: "12px",
                border: "2px solid #e1e8ed",
                borderRadius: "8px",
                fontSize: "14px",
                minWidth: "200px",
              }}
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
            style={{
              backgroundColor: "#1DA1F2",
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#1991db")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#1DA1F2")}
          >
            Add User
          </button>
        </div>
      </div>

      {users.length > 0 && (
        <div
          style={{
            marginBottom: "30px",
            maxWidth: "1000px",
            margin: "0 auto 30px",
          }}
        >
          <h3 style={{ color: "#333" }}>Added Users ({users.length})</h3>
          <div
            style={{
              maxHeight: "250px",
              overflowY: "auto",
              border: "2px solid #e1e8ed",
              borderRadius: "8px",
              padding: "15px",
              backgroundColor: "#ffffff",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
          >
            {users.map((user) => (
              <div
                key={user.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "12px",
                  padding: "10px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                  border: "1px solid #e9ecef",
                }}
              >
                <img
                  src={user.avatar}
                  alt={user.username}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    marginRight: "12px",
                    objectFit: "cover",
                    border: "2px solid #1DA1F2",
                  }}
                  onError={(e) => {
                    e.target.src = createDefaultAvatar();
                  }}
                />
                <span
                  style={{
                    marginRight: "12px",
                    fontWeight: "600",
                    color: "#333",
                    fontSize: "14px",
                  }}
                >
                  @{user.username}
                </span>
                <select
                  value={user.tier}
                  onChange={(e) => changeUserTier(user.id, e.target.value)}
                  style={{
                    padding: "6px 8px",
                    marginRight: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "12px",
                    flex: "1",
                    maxWidth: "180px",
                  }}
                >
                  {tiers.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => removeUser(user.id)}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <h2
          style={{
            marginBottom: "20px",
            color: "#333",
            textAlign: "center",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          Your Twitter Followers Ranking
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: "25px",
            fontSize: "14px",
          }}
        >
          Made with ❤️ by @itz_Manish02
        </p>
        <div
          ref={previewRef}
          style={{
            backgroundColor: "#2c2c2c",
            padding: "25px 30px",
            borderRadius: "16px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
            margin: "0 auto",
            width: "100%",
            maxWidth: "1300px",
          }}
        >
          {tiers.map((t, index) => {
            const tierColors = [
              "#ff4757", // fav - red
              "#ff6b35", // elite - orange-red
              "#ff9500", // we need to interact more - orange
              "#ffa502", // neutral - yellow
              "#2ed573", // idk you - green
              "#26de81", // stranger - light green
            ];

            return (
              <div
                key={t}
                style={{
                  display: "flex",
                  alignItems: "stretch",
                  marginBottom: "10px",
                  minHeight: "55px",
                  backgroundColor: "transparent",
                }}
              >
                <div
                  style={{
                    backgroundColor: tierColors[index],
                    color: "black",
                    padding: "12px 18px",
                    borderRadius: "10px 0 0 10px",
                    minWidth: "180px",
                    fontWeight: "bold",
                    fontSize: "14px",
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  }}
                >
                  {t.toUpperCase()}
                </div>
                <div
                  style={{
                    backgroundColor: "#3c3c3c",
                    flex: 1,
                    borderRadius: "0 10px 10px 0",
                    padding: "8px 15px",
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "8px",
                    minHeight: "55px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  }}
                >
                  {groupedUsers[t]?.length > 0 ? (
                    groupedUsers[t].map((u) => (
                      <div
                        key={u.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          backgroundColor: "#4c4c4c",
                          borderRadius: "20px",
                          padding: "4px 10px 4px 4px",
                          border: "1px solid #5c5c5c",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                        }}
                      >
                        <img
                          src={u.avatar}
                          alt={u.username}
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            marginRight: "6px",
                            objectFit: "cover",
                            border: "2px solid white",
                          }}
                          onError={(e) => {
                            e.target.src = createDefaultAvatar();
                          }}
                        />
                        <span
                          style={{
                            color: "white",
                            fontSize: "12px",
                            fontWeight: "500",
                          }}
                        >
                          @{u.username}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span
                      style={{
                        color: "#888",
                        fontStyle: "italic",
                        padding: "12px",
                        fontSize: "12px",
                      }}
                    >
                      No users in this tier...
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {users.length > 0 && (
          <div
            style={{
              textAlign: "center",
              marginTop: "20px",
              padding: "12px",
              backgroundColor: "#e8f5e8",
              borderRadius: "8px",
              maxWidth: "500px",
              margin: "20px auto 0",
            }}
          >
            <p
              style={{
                color: "#2d7738",
                margin: "0",
                fontSize: "13px",
                fontWeight: "500",
              }}
            >
              💡 <strong>Tip:</strong> Use your device's screenshot feature to
              capture and share this ranking!
              <br />
              <strong style={{color: "red"}}>Note:</strong> Loading pfp can take some seconds!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
