import React, { useState, useRef, useCallback } from "react";
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
    "#ff6b6b", 
    "#ff6b35",
    "#f1c40f",
    "#2ecc71",
    "#1abc9c",
  ];

  const extractUsernameFromLink = useCallback((link) => {
    const patterns = [
      /(?:twitter\.com|x\.com)\/([^/?]+)/i,
      /^@?([a-zA-Z0-9_]{1,15})$/,
    ];
    return patterns.find(pattern => pattern.test(link))?.exec(link)?.[1] || null;
  }, []);

  const createDefaultAvatar = useCallback((username = "") => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 48;
    canvas.height = 48;

    const colors = ['#FF6B35', '#F7931E', '#FFD23F', '#06D6A0', '#118AB2', '#073B4C'];
    const colorIndex = username.length % colors.length;
    
    ctx.fillStyle = colors[colorIndex];
    ctx.beginPath();
    ctx.arc(24, 24, 24, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 18px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const initial = username.charAt(0).toUpperCase() || "?";
    ctx.fillText(initial, 24, 24);

    return canvas.toDataURL("image/png");
  }, []);

  const generateAvatarUrl = useCallback((username) => {
    return `https://unavatar.io/x/${username}`;
  }, []);

  const handleImageError = useCallback((e, username) => {
    const img = e.target;
    if (!img.dataset.fallbackAttempted) {
      img.dataset.fallbackAttempted = "true";
      
      const fallbackSources = [
        `https://unavatar.io/twitter/${username}`,
        `https://github.com/${username}.png?size=48`
      ];
      
      const currentSrc = img.src;
      let nextSource = fallbackSources.find(src => !currentSrc.includes(src.split('/')[2]?.split('.')[0]));
      
      if (nextSource) {
        img.src = nextSource;
      } else {
        img.src = createDefaultAvatar(username);
      }
    } else {
      img.src = createDefaultAvatar(username);
    }
  }, [createDefaultAvatar]);

  const addUser = useCallback(() => {
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
  }, [username, avatarUrl, tier, users, extractUsernameFromLink, generateAvatarUrl]);

  const removeUser = useCallback((userId) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  }, []);

  const changeUserTier = useCallback((userId, newTier) => {
    setUsers(prev => 
      prev.map(user => 
        user.id === userId ? { ...user, tier: newTier } : user
      )
    );
  }, []);

  const loadDomToImage = useCallback(async () => {
    if (window.domtoimage) return window.domtoimage;
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/dom-to-image@2.6.0/dist/dom-to-image.min.js';
    document.head.appendChild(script);
    
    return new Promise((resolve, reject) => {
      script.onload = () => resolve(window.domtoimage);
      script.onerror = reject;
      setTimeout(reject, 5000);
    });
  }, []);

  const preloadImages = useCallback(async (element) => {
    const images = element.querySelectorAll('img');
    const imagePromises = Array.from(images).map(img => {
      return new Promise((resolve) => {
        if (img.complete && img.naturalWidth > 0) {
          resolve();
        } else {
          const timeoutId = setTimeout(() => {
            resolve();
          }, 3000);
          
          img.onload = () => {
            clearTimeout(timeoutId);
            resolve();
          };
          img.onerror = () => {
            clearTimeout(timeoutId);
            resolve();
          };
        }
      });
    });
    
    await Promise.all(imagePromises);
    await new Promise(resolve => setTimeout(resolve, 500));
  }, []);

  const captureElement = useCallback(async (domtoimage, element) => {
    return domtoimage.toPng(element, {
      quality: 0.9,
      bgcolor: '#2c2c2c',
      cacheBust: true,
      useCORS: true,
      allowTaint: true,
      filter: (node) => node.tagName !== 'SCRIPT',
      style: {
        'font-family': 'Arial, sans-serif',
        'color': '#ffffff',
        'transform': 'scale(1)',
        'transform-origin': 'top left'
      }
    });
  }, []);

  const createCanvasWithHeader = useCallback((img) => {
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
    
    return canvas;
  }, []);

  const downloadForSafari = useCallback((canvas) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `twitter-followers-ranking-${Date.now()}.png`;
        link.style.display = 'none';
        document.body.appendChild(link);
        
        const event = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true
        });
        link.dispatchEvent(event);
        document.body.removeChild(link);
        return;
      }
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `twitter-followers-ranking-${Date.now()}.png`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    }, 'image/png', 0.9);
  }, []);

  const downloadForStandardBrowser = useCallback((canvas) => {
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
  }, []);

  const handleFallback = useCallback(async (domtoimage) => {
    const canvas = await domtoimage.toCanvas(previewRef.current, {
      bgcolor: '#2c2c2c',
      cacheBust: true,
      useCORS: true
    });
    
    const dataURL = canvas.toDataURL('image/png');
    const isSafari = navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome');
    
    if (isSafari) {
      const newTab = window.open();
      newTab.document.write(`
        <html>
          <body style="margin:0; padding:20px; text-align:center; font-family: Arial;">
            <h3>Your Twitter Ranking Image</h3>
            <p>Long press the image below and select "Save Image" or "Add to Photos"</p>
            <img src="${dataURL}" style="max-width:100%; border: 1px solid #ccc;"/>
            <br><br>
            <a href="${dataURL}" download="twitter-ranking.png" style="display:inline-block; padding:10px 20px; background:#1DA1F2; color:white; text-decoration:none; border-radius:5px;">Download Image</a>
          </body>
        </html>
      `);
    } else {
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `twitter-followers-ranking-${Date.now()}.png`;
      link.click();
    }
  }, []);

  const takeSnapshot = useCallback(async () => {
    if (!previewRef.current) return;

    try {
      const domtoimage = await loadDomToImage();
      if (!domtoimage) throw new Error('Failed to load dom-to-image');
      
      await preloadImages(previewRef.current);
      const dataUrl = await captureElement(domtoimage, previewRef.current);
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = createCanvasWithHeader(img);
        const isSafari = navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome');
        
        if (isSafari) {
          downloadForSafari(canvas);
        } else {
          downloadForStandardBrowser(canvas);
        }
      };
      
      img.onerror = () => {
        throw new Error('Failed to load captured image');
      };
      
      img.src = dataUrl;
      
    } catch (error) {
      console.error('Snapshot error:', error);
      
      try {
        const domtoimage = await loadDomToImage();
        await handleFallback(domtoimage);
      } catch (fallbackError) {
        console.error('Fallback snapshot error:', fallbackError);
        alert('Screenshot failed on this device. Please try using your device\'s built-in screenshot feature instead, or try on a different browser.');
      }
    }
  }, [loadDomToImage, preloadImages, captureElement, createCanvasWithHeader, downloadForSafari, downloadForStandardBrowser, handleFallback]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter") addUser();
  }, [addUser]);

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
            onKeyPress={handleKeyPress}
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
                  onError={(e) => handleImageError(e, user.username)}
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
                        onError={(e) => handleImageError(e, u.username)}
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