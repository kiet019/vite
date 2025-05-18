import { useState, useEffect } from 'react';
import translations from '../utils/translations';

function MetaSeoGenerator({ language = 'en' }) {
  const [destinationUrl, setDestinationUrl] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaImage, setMetaImage] = useState('');
  const [redirectDelay, setRedirectDelay] = useState(3);
  const [redirectMethod, setRedirectMethod] = useState('both'); // 'both', 'meta', or 'js'
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState(false);
  const [cloakingMethod, setCloakingMethod] = useState('basic'); // 'basic', 'advanced', or 'custom'
  const [customCloakingCode, setCustomCloakingCode] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [metaAuthor, setMetaAuthor] = useState('');
  const [metaViewport, setMetaViewport] = useState('width=device-width, initial-scale=1.0');

  // Get translations based on current interface language
  const t = translations[language];

  // Generate preview HTML for the meta tags
  useEffect(() => {
    if (showPreview && metaTitle) {
      generateCode(false);
    }
  }, [showPreview, metaTitle, metaDescription, metaImage, destinationUrl, metaKeywords, metaAuthor, metaViewport]);

  const generateCode = (setOutput = true) => {
    if (!destinationUrl && setOutput) {
      alert(t.metaSeoUrlRequired);
      return;
    }

    // Determine which redirect methods to include
    const includeMetaRefresh = redirectMethod === 'meta' || redirectMethod === 'both';
    const includeJsRedirect = redirectMethod === 'js' || redirectMethod === 'both';

    // Generate cloaking code based on selected method
    let cloakingCode = '';
    if (cloakingMethod === 'advanced') {
      cloakingCode = `
    <!-- Advanced cloaking for search engines vs. users -->
    <script type="text/javascript">
        // Check if the visitor is a search engine bot
        function isBot() {
            return /bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent);
        }

        // Show different content based on visitor type
        if (!isBot()) {
            // For regular users - redirect immediately
            window.location.href = "${destinationUrl}";
        }
        // Bots will see the regular page with meta refresh
    </script>`;
    } else if (cloakingMethod === 'custom' && customCloakingCode) {
      cloakingCode = customCloakingCode;
    }

    // Additional meta tags for advanced options
    const additionalMetaTags = advancedOptions ? `
    ${metaKeywords ? `<meta name="keywords" content="${metaKeywords}" />` : ''}
    ${metaAuthor ? `<meta name="author" content="${metaAuthor}" />` : ''}
    <meta name="viewport" content="${metaViewport}" />` : '';

    // Create the HTML template with meta tags and redirect script
    const htmlTemplate = `<!DOCTYPE html>
<html lang="${language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="${metaViewport}">
    <title>${metaTitle || t.metaSeoRedirectPage}</title>

    <!-- Standard SEO meta tags -->
    <meta name="description" content="${metaDescription || ''}" />
    <meta name="robots" content="noindex, follow" />
    <link rel="canonical" href="${destinationUrl}" />
    ${metaKeywords ? `<meta name="keywords" content="${metaKeywords}" />` : ''}
    ${metaAuthor ? `<meta name="author" content="${metaAuthor}" />` : ''}

    <!-- Open Graph meta tags for Facebook, LinkedIn, etc. -->
    <meta property="og:title" content="${metaTitle || t.metaSeoRedirectPage}" />
    <meta property="og:description" content="${metaDescription || ''}" />
    ${metaImage ? `<meta property="og:image" content="${metaImage}" />` : ''}
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${destinationUrl}" />

    <!-- Twitter Card meta tags -->
    <meta name="twitter:card" content="${metaImage ? 'summary_large_image' : 'summary'}" />
    <meta name="twitter:title" content="${metaTitle || t.metaSeoRedirectPage}" />
    <meta name="twitter:description" content="${metaDescription || ''}" />
    ${metaImage ? `<meta name="twitter:image" content="${metaImage}" />` : ''}

    ${includeMetaRefresh ? `<!-- Meta refresh (search engine friendly fallback) -->
    <meta http-equiv="refresh" content="${redirectDelay}; url=${destinationUrl}" />` : ''}

    ${cloakingCode}

    ${includeJsRedirect && cloakingMethod !== 'advanced' ? `<!-- JavaScript redirect (for browsers with JS enabled) -->
    <script type="text/javascript">
        setTimeout(function() {
            window.location.href = "${destinationUrl}";
        }, ${redirectDelay * 1000});
    </script>` : ''}

    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
            text-align: center;
            padding: 20px;
        }
        .container {
            max-width: 600px;
        }
        h1 {
            color: #333;
        }
        p {
            color: #666;
            margin-bottom: 20px;
        }
        .loader {
            border: 5px solid #f3f3f3;
            border-top: 5px solid #3498db;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>

    <!-- Schema.org structured data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "${metaTitle || t.metaSeoRedirectPage}",
        "description": "${metaDescription || ''}",
        ${metaImage ? `"image": "${metaImage}",` : ''}
        "url": "${destinationUrl}"
    }
    </script>
</head>
<body>
    <div class="container">
        <h1>${metaTitle || t.metaSeoRedirecting}</h1>
        <p>${metaDescription || t.metaSeoRedirectDesc}</p>
        <div class="loader"></div>
        <p>${t.metaSeoRedirectingIn.replace('{seconds}', redirectDelay)}</p>
    </div>
</body>
</html>`;

    if (setOutput) {
      setGeneratedCode(htmlTemplate);
    } else {
      return htmlTemplate;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="meta-seo-generator">
      <h2>{t.metaSeoTitle}</h2>
      <p className="meta-seo-description">{t.metaSeoDescription}</p>

      <div className="seo-tips">
        <h3>{t.metaSeoSeoTips}</h3>
        <p>{t.metaSeoSeoTip1}</p>
        <p>{t.metaSeoSeoTip2}</p>
        <p>{t.metaSeoSeoTip3}</p>
      </div>

      <div className="meta-seo-form">
        <div className="form-group">
          <label htmlFor="destination-url">{t.metaSeoDestinationUrl}</label>
          <input
            type="url"
            id="destination-url"
            value={destinationUrl}
            onChange={(e) => setDestinationUrl(e.target.value)}
            placeholder={t.metaSeoDestinationUrlPlaceholder}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="meta-title">{t.metaSeoTitleLabel}</label>
          <input
            type="text"
            id="meta-title"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder={t.metaSeoTitlePlaceholder}
          />
        </div>

        <div className="form-group">
          <label htmlFor="meta-description">{t.metaSeoDescriptionLabel}</label>
          <textarea
            id="meta-description"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder={t.metaSeoDescriptionPlaceholder}
            rows="3"
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="meta-image">{t.metaSeoImageLabel}</label>
          <input
            type="url"
            id="meta-image"
            value={metaImage}
            onChange={(e) => setMetaImage(e.target.value)}
            placeholder={t.metaSeoImagePlaceholder}
          />
        </div>

        <div className="form-group">
          <label htmlFor="redirect-delay">{t.metaSeoRedirectDelayLabel}</label>
          <input
            type="number"
            id="redirect-delay"
            value={redirectDelay}
            onChange={(e) => setRedirectDelay(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            max="30"
          />
          <span className="input-suffix">{t.metaSeoSeconds}</span>
        </div>

        <div className="form-group">
          <label htmlFor="redirect-method">{t.metaSeoRedirectMethodLabel || 'Redirect Method:'}</label>
          <select
            id="redirect-method"
            value={redirectMethod}
            onChange={(e) => setRedirectMethod(e.target.value)}
          >
            <option value="both">{t.metaSeoRedirectMethodBoth || 'Both (Meta + JavaScript)'}</option>
            <option value="meta">{t.metaSeoRedirectMethodMeta || 'Meta Refresh (SEO Friendly)'}</option>
            <option value="js">{t.metaSeoRedirectMethodJs || 'JavaScript (Smoother UX)'}</option>
          </select>
        </div>

        <div className="advanced-options-toggle">
          <button
            type="button"
            className="toggle-button"
            onClick={() => setAdvancedOptions(!advancedOptions)}
          >
            {advancedOptions ? (t.hideAdvancedOptions || 'Hide Advanced Options') : (t.showAdvancedOptions || 'Show Advanced Options')}
          </button>
        </div>

        {advancedOptions && (
          <div className="advanced-options">
            <div className="form-group">
              <label htmlFor="meta-keywords">{t.metaSeoKeywordsLabel || 'Meta Keywords:'}</label>
              <input
                type="text"
                id="meta-keywords"
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                placeholder={t.metaSeoKeywordsPlaceholder || 'keyword1, keyword2, keyword3'}
              />
            </div>

            <div className="form-group">
              <label htmlFor="meta-author">{t.metaSeoAuthorLabel || 'Meta Author:'}</label>
              <input
                type="text"
                id="meta-author"
                value={metaAuthor}
                onChange={(e) => setMetaAuthor(e.target.value)}
                placeholder={t.metaSeoAuthorPlaceholder || 'Author name'}
              />
            </div>

            <div className="form-group">
              <label htmlFor="meta-viewport">{t.metaSeoViewportLabel || 'Meta Viewport:'}</label>
              <input
                type="text"
                id="meta-viewport"
                value={metaViewport}
                onChange={(e) => setMetaViewport(e.target.value)}
                placeholder="width=device-width, initial-scale=1.0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cloaking-method">{t.metaSeoCloakingMethodLabel || 'Cloaking Method:'}</label>
              <select
                id="cloaking-method"
                value={cloakingMethod}
                onChange={(e) => setCloakingMethod(e.target.value)}
              >
                <option value="basic">{t.metaSeoCloakingMethodBasic || 'Basic (No Cloaking)'}</option>
                <option value="advanced">{t.metaSeoCloakingMethodAdvanced || 'Advanced (Bot Detection)'}</option>
                <option value="custom">{t.metaSeoCloakingMethodCustom || 'Custom Code'}</option>
              </select>
            </div>

            {cloakingMethod === 'custom' && (
              <div className="form-group">
                <label htmlFor="custom-cloaking-code">{t.metaSeoCustomCloakingLabel || 'Custom Cloaking Code:'}</label>
                <textarea
                  id="custom-cloaking-code"
                  value={customCloakingCode}
                  onChange={(e) => setCustomCloakingCode(e.target.value)}
                  placeholder={t.metaSeoCustomCloakingPlaceholder || '<!-- Your custom cloaking code here -->'}
                  rows="5"
                ></textarea>
              </div>
            )}
          </div>
        )}

        <div className="button-group">
          <button className="generate-button" onClick={() => generateCode(true)}>
            {t.metaSeoGenerateButton}
          </button>
          <button
            className={`preview-button ${showPreview ? 'active' : ''}`}
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (t.hidePreview || 'Hide Preview') : (t.showPreview || 'Show Preview')}
          </button>
        </div>
      </div>

      {showPreview && metaTitle && (
        <div className="meta-preview">
          <h3>{t.metaSeoPreviewTitle || 'Meta Tags Preview'}</h3>
          <div className="preview-container">
            <div className="social-preview">
              <div className="preview-header">
                <h4>{t.metaSeoSocialPreview || 'Social Media Preview'}</h4>
              </div>
              <div className="social-card">
                {metaImage && (
                  <div className="preview-image">
                    <img src={metaImage} alt={metaTitle} onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
                <div className="preview-content">
                  <div className="preview-url">{destinationUrl || 'https://example.com'}</div>
                  <div className="preview-title">{metaTitle}</div>
                  <div className="preview-description">{metaDescription}</div>
                </div>
              </div>
            </div>

            <div className="search-preview">
              <div className="preview-header">
                <h4>{t.metaSeoSearchPreview || 'Search Engine Preview'}</h4>
              </div>
              <div className="search-result">
                <div className="search-title">{metaTitle}</div>
                <div className="search-url">{destinationUrl || 'https://example.com'}</div>
                <div className="search-description">{metaDescription}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {generatedCode && (
        <div className="generated-code-container">
          <div className="generated-code-header">
            <h3>{t.metaSeoGeneratedCodeTitle}</h3>
            <button
              className={`copy-button ${copied ? 'copied' : ''}`}
              onClick={copyToClipboard}
            >
              {copied ? t.metaSeoCodeCopied : t.metaSeoCodeCopy}
            </button>
          </div>
          <pre className="generated-code">
            <code>{generatedCode}</code>
          </pre>
          <p className="usage-instructions">{t.metaSeoUsageInstructions}</p>
        </div>
      )}
    </div>
  );
}

export default MetaSeoGenerator;
