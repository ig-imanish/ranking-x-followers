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

  const loadDomToImage = async () => {
    if (window.domtoimage) return window.domtoimage;
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/dom-to-image@2.6.0/dist/dom-to-image.min.js';
    document.head.appendChild(script);
    
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
      setTimeout(reject, 5000);
    });
    
    return window.domtoimage;
  };

  const takeSnapshot = async () => {
    if (!previewRef.current) return;

    try {
      const domtoimage = await loadDomToImage();
      if (!domtoimage) throw new Error('Failed to load dom-to-image');
      
      const dataUrl = await domtoimage.toPng(previewRef.current, {
        quality: 0.95,
        bgcolor: '#2c2c2c',
        cacheBust: true,
        filter: function (node) {
          return node.tagName !== 'SCRIPT';
        },
        style: {
          'font-family': 'Arial, sans-serif',
          'color': '#ffffff'
        }
      });
      
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const sidePadding = 4;
        const topBottomPadding = 20;
        const headerHeight = 60;
        canvas.width = img.width + (sidePadding * 2);
        canvas.height = img.height + headerHeight + (topBottomPadding * 2);
        
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#1DA1F2';
        ctx.font = 'bold 18px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Twitter Followers Ranking Tool', canvas.width / 2, topBottomPadding + 18);
        
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial, sans-serif';
        const websiteUrl = window.location.hostname;
        ctx.fillText(`Created with ❤️ by @itz_Manish02 | ${websiteUrl}`, canvas.width / 2, topBottomPadding + 38);
        
        ctx.drawImage(img, sidePadding, topBottomPadding + headerHeight);
        
        canvas.toBlob((blob) => {
          if (!blob) {
            alert('Failed to generate image. Please try again.');
            return;
          }
          
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `twitter-followers-ranking-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 'image/png');
      };
      
      img.onerror = function() {
        throw new Error('Failed to load captured image');
      };
      
      img.src = dataUrl;
      
    } catch (error) {
      console.error('Snapshot error:', error);
      
      try {
        const domtoimage = await loadDomToImage();
        const dataUrl = await domtoimage.toPng(previewRef.current, {
          bgcolor: '#2c2c2c',
          cacheBust: true
        });
        
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `twitter-followers-ranking-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
      } catch (fallbackError) {
        console.error('Fallback snapshot error:', fallbackError);
        alert('Screenshot failed. Please try using your device\'s built-in screenshot feature instead.');
      }
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
                <option key={t} value={t}>
                  {t}
                </option>
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