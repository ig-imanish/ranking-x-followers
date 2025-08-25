import React, { useState, useRef } from "react";
import styles from "./assets/css/App.module.css";

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

  const tierColors = [
    "#ff4757",
    "#ff6b35", 
    "#ff9500",
    "#ffa502",
    "#2ed573",
    "#26de81",
  ];

  const extractUsernameFromLink = (link) => {
    const patterns = [
      /(?:twitter\.com|x\.com)\/([^/?]+)/i,
      /^@?([a-zA-Z0-9_]{1,15})$/,
    ];
    return patterns.find(pattern => pattern.test(link))?.exec(link)?.[1] || null;
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

  const generateAvatarUrl = (username) => `https://unavatar.io/x/${username}`;

  const addUser = () => {
    if (!username.trim()) {
      alert("Please enter a username or profile link");
      return;
    }

    let finalUsername = username.trim();
    let finalAvatarUrl = avatarUrl.trim();

    if (username.includes("/")) {
      const extracted = extractUsernameFromLink(username);
      if (extracted) finalUsername = extracted;
    }

    finalUsername = finalUsername.replace("@", "");

    if (!finalAvatarUrl) {
      finalAvatarUrl = generateAvatarUrl(finalUsername);
    }

    if (users.some(user => user.username.toLowerCase() === finalUsername.toLowerCase())) {
      alert("User already added!");
      return;
    }

    const newUser = {
      id: Date.now(),
      username: finalUsername,
      avatar: finalAvatarUrl,
      tier: tier,
    };

    setUsers(prev => [...prev, newUser]);
    setUsername("");
    setAvatarUrl("");
  };

  const removeUser = (userId) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  const changeUserTier = (userId, newTier) => {
    setUsers(prev => 
      prev.map(user => 
        user.id === userId ? { ...user, tier: newTier } : user
      )
    );
  };

  const loadHtml2Canvas = async () => {
    if (window.html2canvas) return window.html2canvas;
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
    document.head.appendChild(script);
    
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
      setTimeout(reject, 5000);
    });
    
    return window.html2canvas;
  };

  const takeSnapshot = async () => {
    if (!previewRef.current) return;

    try {
      const html2canvas = await loadHtml2Canvas();
      if (!html2canvas) throw new Error('Failed to load html2canvas');
      
      const websiteUrl = window.location.hostname;
      
      const wrapper = document.createElement('div');
      wrapper.style.cssText = `
        background-color: #f5f5f5 !important;
        padding: 30px !important;
        font-family: Arial, sans-serif !important;
        width: fit-content !important;
        margin: 0 auto !important;
        box-sizing: border-box !important;
        position: fixed !important;
        top: -9999px !important;
        left: -9999px !important;
        z-index: -1000 !important;
      `;
      
      const header = document.createElement('div');
      header.style.cssText = `
        text-align: center !important;
        margin-bottom: 25px !important;
        color: #333 !important;
        background-color: transparent !important;
      `;
      header.innerHTML = `
        <div style="font-size: 20px !important; font-weight: bold !important; color: #1DA1F2 !important; margin-bottom: 8px !important; font-family: Arial, sans-serif !important;">
          Twitter Followers Ranking Tool
        </div>
        <div style="font-size: 14px !important; color: #666 !important; font-family: Arial, sans-serif !important;">
          Created with ❤️ by @itz_Manish02 | ${websiteUrl}
        </div>
      `;
      
      const clonedPreview = previewRef.current.cloneNode(true);
      clonedPreview.style.cssText = `
        background-color: #2c2c2c !important;
        padding: 25px 30px !important;
        border-radius: 16px !important;
        box-shadow: 0 8px 25px rgba(0,0,0,0.3) !important;
        width: ${previewRef.current.offsetWidth}px !important;
        position: relative !important;
      `;
      
      wrapper.appendChild(header);
      wrapper.appendChild(clonedPreview);
      document.body.appendChild(wrapper);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(wrapper, {
        backgroundColor: '#f5f5f5',
        scale: 1,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: false,
        logging: false,
        width: wrapper.offsetWidth,
        height: wrapper.offsetHeight,
      });
      
      document.body.removeChild(wrapper);
      
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas has no dimensions');
      }
      
      canvas.toBlob((blob) => {
        if (!blob) {
          alert('Failed to generate image. Please try again.');
          return;
        }
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `twitter-followers-ranking-${Date.now()}.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/jpeg', 0.9);
      
    } catch (error) {
      console.error('Snapshot error:', error);
      alert('Screenshot failed. Please try using your device\'s built-in screenshot feature instead.');
    }
  };

  const groupedUsers = tiers.reduce((acc, t) => {
    acc[t] = users.filter(u => u.tier === t);
    return acc;
  }, {});

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
            <label className={styles.label}>Tier:</label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className={styles.select}
            >
              {tiers.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <button onClick={addUser} className={styles.addButton}>
            Add User
          </button>
        </div>
      </div>

      {users.length > 0 && (
        <div className={styles.usersSection}>
          <h3 className={styles.usersTitle}>Added Users ({users.length})</h3>
          <div className={styles.usersContainer}>
            {users.map((user) => (
              <div key={user.id} className={styles.userItem}>
                <img
                  src={user.avatar}
                  alt={user.username}
                  className={styles.userAvatar}
                  onError={(e) => {
                    e.target.src = createDefaultAvatar();
                  }}
                />
                <span className={styles.userName}>@{user.username}</span>
                <select
                  value={user.tier}
                  onChange={(e) => changeUserTier(user.id, e.target.value)}
                  className={styles.userSelect}
                >
                  {tiers.map((t) => (
                    <option key={t} value={t}>{t}</option>
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
        <p className={styles.credit}>Made with ❤️ by @itz_Manish02</p>
        
        {users.length > 0 && (
          <div className={styles.snapshotButtonContainer}>
            <button onClick={takeSnapshot} className={styles.snapshotButton}>
              📸 Take Snapshot
            </button>
          </div>
        )}
        
        <div ref={previewRef} className={styles.rankingPreview}>
          {tiers.map((t, index) => (
            <div key={t} className={styles.tierRow}>
              <div
                className={styles.tierLabel}
                style={{ backgroundColor: tierColors[index] }}
              >
                {t.toUpperCase()}
              </div>
              <div className={styles.tierContent}>
                {groupedUsers[t]?.length > 0 ? (
                  groupedUsers[t].map((u) => (
                    <div key={u.id} className={styles.tierUserItem}>
                      <img
                        src={u.avatar}
                        alt={u.username}
                        className={styles.tierUserAvatar}
                        onError={(e) => {
                          e.target.src = createDefaultAvatar();
                        }}
                      />
                      <span className={styles.tierUserName}>@{u.username}</span>
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