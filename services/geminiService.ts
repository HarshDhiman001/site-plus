
import { GoogleGenAI, Type } from "@google/genai";
import { AuditData, Severity } from "../types";

const getSchema = () => {
  return {
    type: Type.OBJECT,
    properties: {
      overallScore: { type: Type.NUMBER, description: "Overall score from 0 to 100." },
      summary: { type: Type.STRING, description: "Executive summary." },
      pageDetails: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "The detected <title> of the page. If not found, infer a likely title." },
          description: { type: Type.STRING, description: "The meta description or first major paragraph found." },
          previewText: { type: Type.STRING, description: "A short, representative snippet of visible text from the page content (approx 15-20 words) to prove we scanned it." }
        },
        required: ["title", "description", "previewText"]
      },
      researchBrief: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "A punchy, intelligence-style header (e.g., 'Intelligence Brief', 'Recon Report')." },
          bullets: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "3-4 punchy, direct, and slightly witty observations about the site's niche, vibe, or obvious flaws. Be direct."
          }
        },
        required: ["title", "bullets"]
      },
      conversionAdvice: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      seoRankings: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            keyword: { type: Type.STRING, description: "The search term" },
            position: { type: Type.NUMBER, description: "Estimated Google Rank (1-100)" },
            volume: { type: Type.STRING, description: "Monthly search volume (e.g. '2.4k')" },
            intent: { type: Type.STRING, enum: ['Informational', 'Transactional', 'Navigational', 'Commercial'] }
          }
        },
        description: "Estimated top 5 keywords this site ranks for."
      },
      competitors: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            strength: { type: Type.STRING },
            estimatedScore: { type: Type.NUMBER }
          }
        }
      },
      campaigns: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Catchy name for the campaign" },
            description: { type: Type.STRING, description: "What is the campaign about?" },
            platforms: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Where to launch (e.g. LinkedIn, Instagram, Google Ads)"
            },
            targetAudience: { type: Type.STRING, description: "Specific persona targeting" },
            adHook: { type: Type.STRING, description: "A catchy ad headline or copy snippet" },
            adType: { type: Type.STRING, description: "The format of the ad (e.g. 'User Generated Video', 'Carousel', 'Search Text', 'Retargeting Display')" },
            reasoning: { type: Type.STRING, description: "Why this ad type and platform works for this specific business context." }
          }
        }
      },
      adIntelligence: {
        type: Type.OBJECT,
        properties: {
          status: { type: Type.STRING, enum: ["High Ad Potential", "Organic Focus", "Missed Opportunity"] },
          analysis: { type: Type.STRING, description: "Analysis of their current ad posture or recommended ad strategy." }
        }
      },
      categories: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            score: { type: Type.NUMBER },
            description: { type: Type.STRING },
            metrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  value: { type: Type.STRING },
                  status: { type: Type.STRING }
                }
              },
              description: "Include exactly 6 metrics: Largest Contentful Paint (LCP), Cumulative Layout Shift (CLS), Interaction to Next Paint (INP), First Contentful Paint (FCP), Time to First Byte (TTFB), and Speed Index. Status must be 'Good', 'Needs Improvement', or 'Poor'."
            },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  severity: { type: Type.STRING },
                  message: { type: Type.STRING },
                  recommendation: { type: Type.STRING }
                }
              }
            }
          },
          required: ["name", "score", "description", "issues"]
        }
      }
    },
    required: ["overallScore", "summary", "pageDetails", "researchBrief", "categories", "conversionAdvice", "competitors", "campaigns", "adIntelligence", "seoRankings"]
  };
};

export const analyzeWebsite = async (content: string, type: 'URL' | 'CODE', region: string = "United States"): Promise<AuditData> => {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

  let prompt = "";
  if (type === 'URL') {
    prompt = `Analyze this URL: ${content}.
    TARGET REGION: ${region}.
    
    Context: Act as a senior website auditor for the ${region} market. 
    1. Adjust Compliance checks (e.g., if Region is California check CCPA, if UK check GDPR/Cookie Laws).
    2. Adjust SEO Keyword estimation for ${region} Google Search results.
    3. Adjust Competitor analysis for local ${region} businesses if applicable.
    4. CRITICAL: Mimic the extraction of the real page title, meta description, and a snippet of content to prove to the user you actually analyzed the site.
    5. STYLE: Provide a direct and factual research brief. Be punchy and use bullet points to convey complex insights quickly.
    6. PERFORMANCE: Estimate 6 Core Web Vital metrics (LCP, CLS, INP, FCP, TTFB, Speed Index).

    Return a JSON object following this schema:
    {
      overallScore: number,
      summary: string,
      pageDetails: { title: string, description: string, previewText: string },
      researchBrief: { title: string, bullets: string[] },
      conversionAdvice: string[],
      seoRankings: { keyword: string, position: number, volume: string, intent: 'Informational' | 'Transactional' | 'Navigational' | 'Commercial' }[],
      competitors: { name: string, strength: string, estimatedScore: number }[],
      campaigns: { name: string, description: string, platforms: string[], targetAudience: string, adHook: string, adType: string, reasoning: string }[],
      adIntelligence: { status: "High Ad Potential" | "Organic Focus" | "Missed Opportunity", analysis: string },
      categories: { name: string, score: number, description: string, metrics: { name: string, value: string, status: string }[], issues: { severity: string, message: string, recommendation: string }[] }[]
    }`;
  } else {
    prompt = `Analyze this code snippet:
    ${content.substring(0, 20000)}
    
    Target Region: ${region}.
    
    Return a JSON object with a website audit including a research brief and Performance metrics. Follow the standard audit JSON schema.`;
  }

  if (openRouterKey && openRouterKey !== 'PLACEHOLDER') {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://sitepulse-ai-auditor.local",
          "X-Title": "SitePulse AI Auditor"
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.4
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `OpenRouter Error: ${response.statusText}`);
      }

      const data = await response.json();
      const text = data.choices[0].message.content;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const cleanText = jsonMatch ? jsonMatch[0] : text.replace(/```json/g, '').replace(/```/g, '').trim();
      const result = JSON.parse(cleanText);

      return {
        urlOrTitle: type === 'URL' ? content : 'Code Snippet Analysis',
        timestamp: new Date().toISOString(),
        region: region,
        ...result
      };
    } catch (error: any) {
      console.error("OpenRouter Analysis Failed:", error);
      throw new Error(error.message || "Failed to analyze website via OpenRouter.");
    }
  }

  // Fallback to direct Gemini API
  if (!geminiKey || geminiKey === 'PLACEHOLDER_API_KEY') {
    throw new Error("No valid API Key found (OpenRouter or Gemini). Please check your configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: geminiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: getSchema(),
        temperature: 0.4,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    // Robust JSON extraction
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanText = jsonMatch ? jsonMatch[0] : text.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanText);

    return {
      urlOrTitle: type === 'URL' ? content : 'Code Snippet Analysis',
      timestamp: new Date().toISOString(),
      region: region,
      ...result
    };
  } catch (error: any) {
    console.error("Gemini Analysis Failed:", error);
    throw new Error(error.message || "Failed to analyze website. Please check API key and try again.");
  }
};
