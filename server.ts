import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Parse large JSON payloads for base64 image uploads
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API Check
app.get('/api/health', (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({ status: 'ok', hasKey });
});

// Generate Logo using gemini-3-pro-image-preview (with 1K, 2K, 4K affordances)
app.post('/api/generate-logo', async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(400).json({
        error: 'GEMINI_API_KEY is not configured in environment secrets.',
      });
    }

    const {
      companyName,
      tagline,
      industry,
      style,
      colorPalette,
      description,
      imageSize = '1K',
      aspectRatio = '1:1',
    } = req.body;

    const promptParts = [
      `Design a world-class, professional, iconic company logo for "${companyName || 'Apex'}".`,
      tagline ? `Tagline/Sub-motto: "${tagline}".` : '',
      industry ? `Industry: ${industry}.` : '',
      style ? `Design Style: ${style} aesthetic.` : '',
      colorPalette ? `Color Palette & Lighting: ${colorPalette}.` : '',
      description ? `Company Description & Key Symbols: ${description}.` : '',
      'Logo specifications: crisp vector-like clarity, high aesthetic polish, balanced visual weight, clean isolated background, centered composition, modern graphic design masterpiece, highly memorable emblem, zero watermark, zero blur, professional corporate identity.',
    ].filter(Boolean).join(' ');

    const validSizes = ['1K', '2K', '4K'];
    const chosenSize = validSizes.includes(imageSize) ? imageSize : '1K';
    const validAspectRatios = ['1:1', '16:9', '9:16', '4:3', '3:4'];
    const chosenAspect = validAspectRatios.includes(aspectRatio) ? aspectRatio : '1:1';

    // Model selection: gemini-3-pro-image-preview as requested
    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: promptParts }],
        },
        config: {
          imageConfig: {
            aspectRatio: chosenAspect as any,
            imageSize: chosenSize as any,
          },
        },
      });
    } catch (primaryErr: any) {
      console.warn('Primary model gemini-3-pro-image-preview failed, attempting fallback...', primaryErr?.message);
      // Fallback to gemini-nano-banana-2.1 or gemini-3.1-flash-lite-image if needed
      try {
        response = await ai.models.generateContent({
          model: 'gemini-nano-banana-2.1',
          contents: {
            parts: [{ text: promptParts }],
          },
          config: {
            imageConfig: {
              aspectRatio: chosenAspect as any,
              imageSize: chosenSize as any,
            },
          },
        });
      } catch (secondErr: any) {
        response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [{ text: promptParts }],
          },
          config: {
            imageConfig: {
              aspectRatio: chosenAspect as any,
            },
          },
        });
      }
    }

    let imageUrl = '';
    let descriptionText = '';

    const candidates = response?.candidates || [];
    if (candidates.length > 0 && candidates[0].content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        } else if (part.text) {
          descriptionText += part.text + ' ';
        }
      }
    }

    if (!imageUrl) {
      return res.status(500).json({
        error: 'Model did not return image data. ' + (descriptionText || ''),
      });
    }

    res.json({
      imageUrl,
      promptUsed: promptParts,
      details: descriptionText.trim(),
      imageSize: chosenSize,
      aspectRatio: chosenAspect,
    });
  } catch (error: any) {
    console.error('Error generating logo:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate logo image.',
    });
  }
});

// Generate Video using Veo (veo-3.1-fast-generate-preview)
app.post('/api/generate-video', async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(400).json({
        error: 'GEMINI_API_KEY is not configured in environment secrets.',
      });
    }

    const {
      image, // base64 string (with or without data:image/png;base64,)
      prompt = 'Cinematic 3D logo reveal, glowing volumetric light, smooth camera pan, sleek corporate motion graphics',
      aspectRatio = '16:9', // '16:9' or '9:16'
      resolution = '720p', // '720p' or '1080p'
    } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'An image is required to animate into video.' });
    }

    // Clean base64 string and extract mimeType
    let base64Clean = image;
    let mimeType = 'image/png';
    const match = image.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      mimeType = match[1];
      base64Clean = match[2];
    }

    const validAspect = aspectRatio === '9:16' ? '9:16' : '16:9';
    const validResolution = resolution === '1080p' ? '1080p' : '720p';

    let operation;
    try {
      operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || 'Cinematic 3D logo reveal with volumetric glowing particles and dynamic motion',
        image: {
          imageBytes: base64Clean,
          mimeType,
        },
        config: {
          numberOfVideos: 1,
          resolution: validResolution as any,
          aspectRatio: validAspect as any,
        },
      });
    } catch (veoFastErr: any) {
      console.warn('veo-3.1-fast-generate-preview failed, trying veo-3.1-generate-preview fallback...', veoFastErr?.message);
      try {
        operation = await ai.models.generateVideos({
          model: 'veo-3.1-generate-preview',
          prompt: prompt || 'Cinematic 3D logo reveal with volumetric glowing particles and dynamic motion',
          image: {
            imageBytes: base64Clean,
            mimeType,
          },
          config: {
            numberOfVideos: 1,
            resolution: validResolution as any,
            aspectRatio: validAspect as any,
          },
        });
      } catch (veoErr: any) {
        operation = await ai.models.generateVideos({
          model: 'veo-3.1-lite-generate-preview',
          prompt: prompt || 'Cinematic 3D logo reveal with volumetric glowing particles and dynamic motion',
          image: {
            imageBytes: base64Clean,
            mimeType,
          },
          config: {
            numberOfVideos: 1,
            resolution: validResolution as any,
            aspectRatio: validAspect as any,
          },
        });
      }
    }

    res.json({ operationName: operation.name });
  } catch (error: any) {
    console.error('Error starting video generation:', error);
    res.status(500).json({
      error: error?.message || 'Failed to start video generation.',
    });
  }
});

// Video Status Poll
app.post('/api/video-status', async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(400).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });

    res.json({
      done: updated.done,
      error: updated.error || null,
      metadata: updated.metadata || null,
    });
  } catch (error: any) {
    console.error('Error polling video status:', error);
    res.status(500).json({
      error: error?.message || 'Failed to check video status.',
    });
  }
});

// Video Download Proxy
app.post('/api/video-download', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const ai = getGeminiClient();
    if (!ai || !apiKey) {
      return res.status(400).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });

    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      return res.status(404).json({ error: 'Video URI not ready or missing.' });
    }

    const videoRes = await fetch(uri, {
      headers: { 'x-goog-api-key': apiKey },
    });

    if (!videoRes.ok) {
      return res.status(videoRes.status).json({
        error: `Failed to download video file: ${videoRes.statusText}`,
      });
    }

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'attachment; filename="animated-logo.mp4"');

    if (videoRes.body) {
      const reader = videoRes.body.getReader();
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            res.end();
            break;
          }
          res.write(Buffer.from(value));
        }
      };
      await pump();
    } else {
      res.status(500).json({ error: 'No response body from video service.' });
    }
  } catch (error: any) {
    console.error('Error downloading video:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: error?.message || 'Failed to download video.',
      });
    }
  }
});

// Start Dev Server with Vite middleware
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
});
