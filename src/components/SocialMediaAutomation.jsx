import { useState, useEffect } from 'react';
import translations from '../utils/translations';

function SocialMediaAutomation({ language = 'en' }) {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    content: '',
    platforms: {
      facebook: true,
      instagram: true,
      twitter: true,
      tiktok: false,
      telegram: false
    },
    scheduledDate: '',
    scheduledTime: '',
    optimizeForSeo: true,
    optimizeForVideo: false,
    notifyOnTelegram: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [activeTab, setActiveTab] = useState('create');
  const [telegramSettings, setTelegramSettings] = useState({
    botToken: '',
    chatId: ''
  });
  const [tiktokSettings, setTiktokSettings] = useState({
    apiKey: '',
    secretKey: ''
  });

  // Get translations based on current interface language
  const t = translations[language];

  // Load API key and settings from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key') || '';
    const savedTelegramSettings = JSON.parse(localStorage.getItem('telegram_settings') || '{"botToken":"","chatId":""}');
    const savedTiktokSettings = JSON.parse(localStorage.getItem('tiktok_settings') || '{"apiKey":"","secretKey":""}');

    setApiKey(savedApiKey);
    setTelegramSettings(savedTelegramSettings);
    setTiktokSettings(savedTiktokSettings);

    // Set default scheduled date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setNewPost(prev => ({
      ...prev,
      scheduledDate: tomorrow.toISOString().split('T')[0],
      scheduledTime: '09:00'
    }));

    // Load saved posts
    const savedPosts = JSON.parse(localStorage.getItem('scheduled_posts') || '[]');
    setPosts(savedPosts);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('platform-')) {
      const platform = name.replace('platform-', '');
      setNewPost(prev => ({
        ...prev,
        platforms: {
          ...prev.platforms,
          [platform]: checked
        }
      }));
    } else {
      setNewPost(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleTelegramSettingsChange = (e) => {
    const { name, value } = e.target;
    setTelegramSettings(prev => {
      const updated = { ...prev, [name]: value };
      localStorage.setItem('telegram_settings', JSON.stringify(updated));
      return updated;
    });
  };

  const handleTiktokSettingsChange = (e) => {
    const { name, value } = e.target;
    setTiktokSettings(prev => {
      const updated = { ...prev, [name]: value };
      localStorage.setItem('tiktok_settings', JSON.stringify(updated));
      return updated;
    });
  };

  const optimizeContent = async () => {
    if (!apiKey) {
      setError(t.apiKeyError || 'Please configure your Gemini API key in settings');
      return;
    }

    if (!newPost.title || !newPost.description) {
      setError(t.socialMediaRequiredFields || 'Title and description are required for optimization');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Create a prompt for Gemini to optimize the content
      const prompt = `
        Optimize the following social media post for SEO and engagement:

        Title: ${newPost.title}
        Description: ${newPost.description}
        ${newPost.content ? `Content: ${newPost.content}` : ''}

        Platforms: ${Object.entries(newPost.platforms)
          .filter(([_, selected]) => selected)
          .map(([platform]) => platform)
          .join(', ')}

        ${newPost.optimizeForVideo ? 'This is for video content. Optimize for video engagement.' : ''}

        Provide a structured response in the following JSON format:
        {
          "title": "optimized title",
          "description": "optimized description",
          "content": "optimized content",
          "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
          "seoTips": ["tip1", "tip2", "tip3"]
        }

        IMPORTANT: Return ONLY valid JSON with no markdown formatting, no code blocks, and no additional text.
        The response must be parseable by JSON.parse() directly.
      `;

      // Call Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();

      // Extract the response text
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const responseText = data.candidates[0].content.parts[0].text;

        // Parse the JSON response
        try {
          // First, try to extract JSON from markdown code blocks if present
          let jsonText = responseText.trim();

          // Check if response is wrapped in markdown code blocks
          const jsonRegex = /```(?:json)?\s*([\s\S]*?)```/;
          const match = jsonText.match(jsonRegex);

          if (match && match[1]) {
            jsonText = match[1].trim();
          }

          const jsonResponse = JSON.parse(jsonText);
          setNewPost(prev => ({
            ...prev,
            title: jsonResponse.title || prev.title,
            description: jsonResponse.description || prev.description,
            content: jsonResponse.content || prev.content,
            optimizedHashtags: jsonResponse.hashtags || [],
            seoTips: jsonResponse.seoTips || []
          }));
          setSuccess(t.socialMediaOptimized || 'Content optimized successfully!');
        } catch (jsonError) {
          console.error('Error parsing JSON response:', jsonError);
          setError(t.jsonParseError || 'Error parsing response from Gemini API');
        }
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (err) {
      console.error('Optimization error:', err);
      setError(`${t.errorPrefix || 'Error:'} ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const schedulePost = () => {
    if (!newPost.title || !newPost.description || !newPost.scheduledDate || !newPost.scheduledTime) {
      setError(t.socialMediaScheduleRequired || 'Title, description, date and time are required');
      return;
    }

    // Check if at least one platform is selected
    const hasPlatform = Object.values(newPost.platforms).some(v => v);
    if (!hasPlatform) {
      setError(t.socialMediaPlatformRequired || 'At least one platform must be selected');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const scheduledDateTime = new Date(`${newPost.scheduledDate}T${newPost.scheduledTime}`);

      if (scheduledDateTime < new Date()) {
        throw new Error(t.socialMediaPastDate || 'Cannot schedule posts in the past');
      }

      const newPostWithId = {
        ...newPost,
        id: Date.now().toString(),
        scheduledDateTime: scheduledDateTime.toISOString(),
        status: 'scheduled'
      };

      if (editingPost) {
        // Update existing post
        setPosts(prev => prev.map(post =>
          post.id === editingPost.id ? { ...newPostWithId, id: post.id } : post
        ));
        setSuccess(t.socialMediaPostUpdated || 'Post updated successfully');
      } else {
        // Create new post
        setPosts(prev => [...prev, newPostWithId]);
        setSuccess(t.socialMediaPostScheduled || 'Post scheduled successfully');
      }

      // Save to localStorage
      const updatedPosts = editingPost
        ? posts.map(post => post.id === editingPost.id ? { ...newPostWithId, id: post.id } : post)
        : [...posts, newPostWithId];

      localStorage.setItem('scheduled_posts', JSON.stringify(updatedPosts));

      // Reset form
      setNewPost({
        title: '',
        description: '',
        content: '',
        platforms: {
          facebook: true,
          instagram: true,
          twitter: true,
          tiktok: false,
          telegram: false
        },
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '09:00',
        optimizeForSeo: true,
        optimizeForVideo: false,
        notifyOnTelegram: false,
        optimizedHashtags: [],
        seoTips: []
      });

      setEditingPost(null);
      setActiveTab('scheduled');
    } catch (err) {
      console.error('Scheduling error:', err);
      setError(`${t.errorPrefix || 'Error:'} ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setNewPost({
      ...post,
      scheduledDate: post.scheduledDateTime.split('T')[0],
      scheduledTime: post.scheduledDateTime.split('T')[1].substring(0, 5)
    });
    setActiveTab('create');
  };

  const handleDelete = (postId) => {
    if (!confirm(t.socialMediaConfirmDelete || 'Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const updatedPosts = posts.filter(post => post.id !== postId);
      setPosts(updatedPosts);
      localStorage.setItem('scheduled_posts', JSON.stringify(updatedPosts));
      setSuccess(t.socialMediaPostDeleted || 'Post deleted successfully');
    } catch (err) {
      console.error('Delete error:', err);
      setError(`${t.errorPrefix || 'Error:'} ${err.message}`);
    }
  };

  const handleCancel = () => {
    setEditingPost(null);
    setNewPost({
      title: '',
      description: '',
      content: '',
      platforms: {
        facebook: true,
        instagram: true,
        twitter: true,
        tiktok: false,
        telegram: false
      },
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '09:00',
      optimizeForSeo: true,
      optimizeForVideo: false,
      notifyOnTelegram: false,
      optimizedHashtags: [],
      seoTips: []
    });
  };

  const renderCreateTab = () => (
    <div className="create-post-form">
      <h3>{editingPost ? (t.socialMediaEditPost || 'Edit Post') : (t.socialMediaCreatePost || 'Create Post')}</h3>

      <div className="form-group">
        <label htmlFor="post-title">{t.socialMediaTitle || 'Title:'}</label>
        <input
          type="text"
          id="post-title"
          name="title"
          value={newPost.title}
          onChange={handleInputChange}
          placeholder={t.socialMediaTitlePlaceholder || 'Enter post title'}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="post-description">{t.socialMediaDescription || 'Description:'}</label>
        <textarea
          id="post-description"
          name="description"
          value={newPost.description}
          onChange={handleInputChange}
          placeholder={t.socialMediaDescriptionPlaceholder || 'Enter post description'}
          rows="3"
          required
        ></textarea>
      </div>

      <div className="form-group">
        <label htmlFor="post-content">{t.socialMediaContent || 'Content (optional):'}</label>
        <textarea
          id="post-content"
          name="content"
          value={newPost.content}
          onChange={handleInputChange}
          placeholder={t.socialMediaContentPlaceholder || 'Enter additional content'}
          rows="5"
        ></textarea>
      </div>

      <div className="form-group">
        <label>{t.socialMediaPlatforms || 'Platforms:'}</label>
        <div className="platforms-grid">
          <label className="platform-checkbox">
            <input
              type="checkbox"
              name="platform-facebook"
              checked={newPost.platforms.facebook}
              onChange={handleInputChange}
            />
            <span className="platform-name">Facebook</span>
          </label>
          <label className="platform-checkbox">
            <input
              type="checkbox"
              name="platform-instagram"
              checked={newPost.platforms.instagram}
              onChange={handleInputChange}
            />
            <span className="platform-name">Instagram</span>
          </label>
          <label className="platform-checkbox">
            <input
              type="checkbox"
              name="platform-twitter"
              checked={newPost.platforms.twitter}
              onChange={handleInputChange}
            />
            <span className="platform-name">Twitter</span>
          </label>
          <label className="platform-checkbox">
            <input
              type="checkbox"
              name="platform-tiktok"
              checked={newPost.platforms.tiktok}
              onChange={handleInputChange}
            />
            <span className="platform-name">TikTok</span>
          </label>
          <label className="platform-checkbox">
            <input
              type="checkbox"
              name="platform-telegram"
              checked={newPost.platforms.telegram}
              onChange={handleInputChange}
            />
            <span className="platform-name">Telegram</span>
          </label>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group half-width">
          <label htmlFor="scheduled-date">{t.socialMediaDate || 'Date:'}</label>
          <input
            type="date"
            id="scheduled-date"
            name="scheduledDate"
            value={newPost.scheduledDate}
            onChange={handleInputChange}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
        <div className="form-group half-width">
          <label htmlFor="scheduled-time">{t.socialMediaTime || 'Time:'}</label>
          <input
            type="time"
            id="scheduled-time"
            name="scheduledTime"
            value={newPost.scheduledTime}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="form-group checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="optimizeForSeo"
            checked={newPost.optimizeForSeo}
            onChange={handleInputChange}
          />
          <span>{t.socialMediaOptimizeSeo || 'Optimize for SEO'}</span>
        </label>
      </div>

      <div className="form-group checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="optimizeForVideo"
            checked={newPost.optimizeForVideo}
            onChange={handleInputChange}
          />
          <span>{t.socialMediaOptimizeVideo || 'Optimize for video content'}</span>
        </label>
      </div>

      <div className="form-group checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="notifyOnTelegram"
            checked={newPost.notifyOnTelegram}
            onChange={handleInputChange}
          />
          <span>{t.socialMediaNotifyTelegram || 'Send notification on Telegram'}</span>
        </label>
      </div>

      {newPost.optimizedHashtags && newPost.optimizedHashtags.length > 0 && (
        <div className="optimized-section">
          <h4>{t.socialMediaHashtags || 'Optimized Hashtags:'}</h4>
          <div className="hashtags-container">
            {newPost.optimizedHashtags.map((tag, index) => (
              <span key={index} className="hashtag">#{tag}</span>
            ))}
          </div>
        </div>
      )}

      {newPost.seoTips && newPost.seoTips.length > 0 && (
        <div className="optimized-section">
          <h4>{t.socialMediaSeoTips || 'SEO Tips:'}</h4>
          <ul className="seo-tips-list">
            {newPost.seoTips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="form-buttons">
        <button
          type="button"
          className="optimize-button"
          onClick={optimizeContent}
          disabled={isLoading || !newPost.title || !newPost.description}
        >
          {isLoading && activeTab === 'create'
            ? (t.socialMediaOptimizing || 'Optimizing...')
            : (t.socialMediaOptimize || 'Optimize Content')}
        </button>

        <button
          type="button"
          className="schedule-button"
          onClick={schedulePost}
          disabled={isLoading || !newPost.title || !newPost.description || !newPost.scheduledDate || !newPost.scheduledTime}
        >
          {isLoading
            ? (t.socialMediaScheduling || 'Scheduling...')
            : (editingPost
                ? (t.socialMediaUpdateSchedule || 'Update Schedule')
                : (t.socialMediaSchedule || 'Schedule Post'))}
        </button>

        {editingPost && (
          <button
            type="button"
            className="cancel-button"
            onClick={handleCancel}
          >
            {t.socialMediaCancel || 'Cancel'}
          </button>
        )}
      </div>
    </div>
  );

  const renderScheduledTab = () => (
    <div className="scheduled-posts">
      <h3>{t.socialMediaScheduledPosts || 'Scheduled Posts'}</h3>

      {posts.length === 0 ? (
        <p className="no-posts">{t.socialMediaNoPosts || 'No scheduled posts'}</p>
      ) : (
        <div className="posts-list">
          {posts.map(post => {
            const scheduledDate = new Date(post.scheduledDateTime);
            const isPastDue = scheduledDate < new Date();

            return (
              <div key={post.id} className={`post-card ${isPastDue ? 'past-due' : ''}`}>
                <div className="post-header">
                  <h4 className="post-title">{post.title}</h4>
                  <div className="post-actions">
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(post)}
                      title={t.socialMediaEditPost || 'Edit Post'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(post.id)}
                      title={t.socialMediaDeletePost || 'Delete Post'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="post-meta">
                  <div className="post-schedule">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                      <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                    </svg>
                    <span>
                      {scheduledDate.toLocaleDateString()} {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="post-platforms">
                    {Object.entries(post.platforms).map(([platform, enabled]) =>
                      enabled && (
                        <span key={platform} className="platform-badge">
                          {platform}
                        </span>
                      )
                    )}
                  </div>
                </div>

                <p className="post-description">{post.description}</p>

                {post.optimizedHashtags && post.optimizedHashtags.length > 0 && (
                  <div className="post-hashtags">
                    {post.optimizedHashtags.map((tag, index) => (
                      <span key={index} className="hashtag">#{tag}</span>
                    ))}
                  </div>
                )}

                <div className="post-status">
                  <span className={`status-badge ${isPastDue ? 'status-due' : 'status-scheduled'}`}>
                    {isPastDue
                      ? (t.socialMediaStatusDue || 'Past Due')
                      : (t.socialMediaStatusScheduled || 'Scheduled')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="social-media-settings">
      <h3>{t.socialMediaSettings || 'Settings'}</h3>

      <div className="settings-section">
        <h4>{t.socialMediaTelegramSettings || 'Telegram Notifications'}</h4>
        <div className="form-group">
          <label htmlFor="telegram-bot-token">{t.socialMediaTelegramBot || 'Bot Token:'}</label>
          <input
            type="text"
            id="telegram-bot-token"
            name="botToken"
            value={telegramSettings.botToken}
            onChange={handleTelegramSettingsChange}
            placeholder={t.socialMediaTelegramBotPlaceholder || 'Enter your Telegram bot token'}
          />
        </div>
        <div className="form-group">
          <label htmlFor="telegram-chat-id">{t.socialMediaTelegramChat || 'Chat ID:'}</label>
          <input
            type="text"
            id="telegram-chat-id"
            name="chatId"
            value={telegramSettings.chatId}
            onChange={handleTelegramSettingsChange}
            placeholder={t.socialMediaTelegramChatPlaceholder || 'Enter your Telegram chat ID'}
          />
        </div>
        <p className="settings-help">
          {t.socialMediaTelegramHelp || 'Create a bot with @BotFather and get your chat ID to receive notifications.'}
        </p>
      </div>

      <div className="settings-section">
        <h4>{t.socialMediaTiktokSettings || 'TikTok API Integration'}</h4>
        <div className="form-group">
          <label htmlFor="tiktok-api-key">{t.socialMediaTiktokKey || 'API Key:'}</label>
          <input
            type="text"
            id="tiktok-api-key"
            name="apiKey"
            value={tiktokSettings.apiKey}
            onChange={handleTiktokSettingsChange}
            placeholder={t.socialMediaTiktokKeyPlaceholder || 'Enter your TikTok API key'}
          />
        </div>
        <div className="form-group">
          <label htmlFor="tiktok-secret-key">{t.socialMediaTiktokSecret || 'Secret Key:'}</label>
          <input
            type="password"
            id="tiktok-secret-key"
            name="secretKey"
            value={tiktokSettings.secretKey}
            onChange={handleTiktokSettingsChange}
            placeholder={t.socialMediaTiktokSecretPlaceholder || 'Enter your TikTok secret key'}
          />
        </div>
        <p className="settings-help">
          {t.socialMediaTiktokHelp || 'Get your API credentials from the TikTok developer portal.'}
        </p>
      </div>

      <div className="settings-section">
        <h4>{t.socialMediaGeminiSettings || 'Gemini API Settings'}</h4>
        <div className="form-group">
          <label htmlFor="gemini-api-key">{t.socialMediaGeminiKey || 'API Key:'}</label>
          <input
            type="text"
            id="gemini-api-key"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              localStorage.setItem('gemini_api_key', e.target.value);
            }}
            placeholder={t.socialMediaGeminiKeyPlaceholder || 'Enter your Gemini API key'}
          />
        </div>
        <p className="settings-help">
          {t.socialMediaGeminiHelp || 'Required for content optimization features.'}
        </p>
      </div>
    </div>
  );

  return (
    <div className="social-media-automation">
      <h2>{t.socialMediaTitle || 'Social Media Workflow Automation'}</h2>
      <p className="social-description">
        {t.socialMediaDescription || 'Schedule and optimize social media posts across multiple platforms with AI-powered content enhancement.'}
      </p>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="social-tabs">
        <button
          className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          {editingPost ? (t.socialMediaEditTab || 'Edit Post') : (t.socialMediaCreateTab || 'Create Post')}
        </button>
        <button
          className={`tab-button ${activeTab === 'scheduled' ? 'active' : ''}`}
          onClick={() => setActiveTab('scheduled')}
        >
          {t.socialMediaScheduledTab || 'Scheduled Posts'}
        </button>
        <button
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          {t.socialMediaSettingsTab || 'Settings'}
        </button>
      </div>

      <div className="social-tab-content">
        {activeTab === 'create' && renderCreateTab()}
        {activeTab === 'scheduled' && renderScheduledTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </div>
    </div>
  );
}

export default SocialMediaAutomation;
