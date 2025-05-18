import { useState } from 'react';
import translations from '../utils/translations';

function CountryResearchTool({ language = 'en' }) {
  const [query, setQuery] = useState('');
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

  const researchQuery = async () => {
    if (!query.trim()) {
      setError(t.queryRequired || 'Please enter a query to research');
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
      // Create a prompt for Gemini to research the query
      const prompt = `
        Research the following query about countries or statistics: "${query}"

        Provide a structured response in the following JSON format:
        {
          "query": "the researched query",
          "summary": "a brief summary of the findings",
          "data": [
            {
              "title": "title of data point 1",
              "value": "value of data point 1",
              "description": "brief description or context"
            },
            {
              "title": "title of data point 2",
              "value": "value of data point 2",
              "description": "brief description or context"
            }
            // Add more data points as needed
          ],
          "sources": ["source 1", "source 2", "source 3"]
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
      console.error('Research query error:', err);
      setError(`${t.errorPrefix || 'Error:'} ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="country-research-tool">
      <h2>{t.countryResearchTitle || 'Country & Data Research'}</h2>
      <p className="country-research-description">
        {t.countryResearchDescription || 'Research countries, statistics, and global data with AI-powered analysis.'}
      </p>

      <div className="research-form">
        <div className="form-group">
          <label htmlFor="research-input">{t.researchInputLabel || 'Enter Research Query:'}</label>
          <div className="input-with-button">
            <input
              type="text"
              id="research-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.researchInputPlaceholder || 'e.g. "countries using cryptocurrency" or "population of Southeast Asia"'}
              disabled={isLoading}
            />
            <button
              className="research-button"
              onClick={researchQuery}
              disabled={isLoading || !query.trim()}
            >
              {isLoading ? (t.researching || 'Researching...') : (t.researchButton || 'Research')}
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t.researchingQuery || 'Researching your query...'}</p>
        </div>
      )}

      {results && (
        <div className="research-results">
          <div className="result-header">
            <h3>{results.query}</h3>
          </div>

          <div className="result-summary">
            <p>{results.summary}</p>
          </div>

          <div className="data-grid">
            {results.data?.map((item, index) => (
              <div key={index} className="data-card">
                <h4 className="data-title">{item.title}</h4>
                <div className="data-value">{item.value}</div>
                <p className="data-description">{item.description}</p>
              </div>
            ))}
          </div>

          {results.sources && results.sources.length > 0 && (
            <div className="sources-section">
              <h4>{t.sources || 'Sources'}</h4>
              <ul className="sources-list">
                {results.sources.map((source, index) => (
                  <li key={index}>{source}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CountryResearchTool;
