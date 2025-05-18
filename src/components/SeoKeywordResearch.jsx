import { useState } from 'react';
import translations from '../utils/translations';

function SeoKeywordResearch({ language = 'en' }) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiKey, setApiKey] = useState('');

  // Get translations based on current interface language
  const t = translations[language];

  // Load API key from localStorage on component mount
  useState(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key') || '';
    setApiKey(savedApiKey);
  }, []);

  const analyzeKeyword = async () => {
    if (!keyword.trim()) {
      setError(t.keywordRequired || 'Please enter a keyword to analyze');
      return;
    }

    if (!apiKey) {
      setError(t.apiKeyError || 'Please configure your Gemini API key in settings');
      return;
    }

    setIsLoading(true);
    setError('');
    setResults(null);

    try {
      // Create a prompt for Gemini to analyze the keyword
      const prompt = `
        Analyze the following keyword for SEO purposes: "${keyword}"

        Provide a structured response in the following JSON format:
        {
          "keyword": "the analyzed keyword",
          "searchVolume": "estimated search volume (high/medium/low)",
          "competition": "competition level (high/medium/low)",
          "suggestedKeywords": ["list", "of", "5-10", "related", "keywords"],
          "contentIdeas": ["list", "of", "3-5", "content", "ideas"],
          "seoTips": ["list", "of", "3-5", "SEO", "tips"]
        }

        IMPORTANT: Return ONLY valid JSON with no markdown formatting, no code blocks, and no additional text.
        The response must be parseable by JSON.parse() directly.
      `;

      // Call Gemini API with Google Search grounding
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
            },
            tools: [{ googleSearch: {} }],
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
          setResults(jsonResponse);
        } catch (jsonError) {
          console.error('Error parsing JSON response:', jsonError);
          setError(t.jsonParseError || 'Error parsing response from Gemini API');
        }
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (err) {
      console.error('Keyword analysis error:', err);
      setError(`${t.errorPrefix || 'Error:'} ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="seo-keyword-research">
      <h2>{t.seoKeywordTitle || 'SEO Keyword Research'}</h2>
      <p className="seo-keyword-description">
        {t.seoKeywordDescription || 'Analyze keywords for SEO optimization and get related keyword suggestions.'}
      </p>

      <div className="keyword-form">
        <div className="form-group">
          <label htmlFor="keyword-input">{t.keywordInputLabel || 'Enter Keyword:'}</label>
          <div className="input-with-button">
            <input
              type="text"
              id="keyword-input"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={t.keywordInputPlaceholder || 'e.g. "organic coffee beans"'}
              disabled={isLoading}
            />
            <button
              className="analyze-button"
              onClick={analyzeKeyword}
              disabled={isLoading || !keyword.trim()}
            >
              {isLoading ? (t.analyzing || 'Analyzing...') : (t.analyzeButton || 'Analyze')}
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t.analyzingKeyword || 'Analyzing keyword...'}</p>
        </div>
      )}

      {results && (
        <div className="keyword-results">
          <div className="result-header">
            <h3>{results.keyword}</h3>
            <div className="metrics">
              <div className="metric">
                <span className="metric-label">{t.searchVolume || 'Search Volume'}:</span>
                <span className={`metric-value volume-${results.searchVolume?.toLowerCase()}`}>
                  {results.searchVolume}
                </span>
              </div>
              <div className="metric">
                <span className="metric-label">{t.competition || 'Competition'}:</span>
                <span className={`metric-value competition-${results.competition?.toLowerCase()}`}>
                  {results.competition}
                </span>
              </div>
            </div>
          </div>

          <div className="result-section">
            <h4>{t.suggestedKeywords || 'Suggested Keywords'}</h4>
            <div className="keyword-chips">
              {results.suggestedKeywords?.map((kw, index) => (
                <div key={index} className="keyword-chip">
                  {kw}
                </div>
              ))}
            </div>
          </div>

          <div className="result-section">
            <h4>{t.contentIdeas || 'Content Ideas'}</h4>
            <ul className="content-ideas-list">
              {results.contentIdeas?.map((idea, index) => (
                <li key={index}>{idea}</li>
              ))}
            </ul>
          </div>

          <div className="result-section">
            <h4>{t.seoTips || 'SEO Tips'}</h4>
            <ul className="seo-tips-list">
              {results.seoTips?.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default SeoKeywordResearch;
