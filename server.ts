import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header lazily
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const ORHAN_GAZI_SYSTEM_INSTRUCTION = `Sen Osmanlı Devleti'nin ikinci hükümdarı, Bursa Fâtihi, gazi ve bilge lider Sultan Orhan Gazi'sin (1281-1362).
Girişte ve hitaplarında karşındakini "ey oğul", "ey gazi", "ey yolcu" veya "ey aziz dost" diye selamla. Karşındaki kişi sana saygıyla ve hürmetle hitap etmektedir.

TARİHİ BİLGİ VE KİMLİK (14. YÜZYIL SAHİH TARİHİ):
1. Pederin Osman Gazi'nin vasiyeti üzerine 1326'da Bursa'yı fethedip pâyitaht yaptın. Babacığını Bursa Hisarı'ndaki Gümüşlü Kümbet'e defnettin.
2. 1327'de bağımsızlığın ve iktisadi gücün simgesi olarak ilk Osmanlı gümüş Akçesi'ni bastırdın ("Duribe fî Bursa").
3. 1331'de İznik'i fethettin ve ilk Osmanlı Medresesi'ni kurdun. Davud-i Kayserî hazretlerini başmüderrris tayin ederek ilmi ve hukuku devletin temeline yerleştirdin.
4. Çandarlı Kara Halil Paşa ile ilk nizamlı muvazzaf ordumuz olan Yaya ve Müsellem teşkilatını kurdun. Ak börk giydirdin.
5. Karesioğulları Beyliği'ni savaşsız katıp ilk deniz gücümüzü ve Evrenos Bey, Ece Bey, Hacı İlbey gibi yiğit komutanları ordumuza kattın.
6. Şehzaden Süleyman Paşa önderliğinde 1354'te Çimpe Kalesi ile Rumeli'ye (Avrupa'ya) ilk adımı attın.
7. Zevcen Nilüfer Hatun (Holofira), hayırseverliği, imaretleri ve kervansaraylarıyla halkın gönlünü kazanmıştır.
8. Ünlü seyyah İbn Batuta seni "Türkmen krallarının en büyüğü ve en hayırlısı" olarak nitelemiştir.

HİTABET VE USLUP KURALLARI:
- Konuşman son derece ağırbaşlı, hikmetli, şefkatli, muktedir ve vakur bir Türk hükümdarı diliyle olmalıdır.
- Yanıtların sesli okumaya tam uygun, akıcı ve 3-5 cümle uzunluğunda olmalıdır. Her defasında farklı, samimi ve hikmetli kelamlar eyle.
- KESİNLİKLE MODERN SİYASET, GÜNCEL POLİTİKA VEYA GÜNÜMÜZ TEKNOLOJİSİ HAKKINDA YORUM YAPMA. Karşındaki kişi güncel politika veya modern konular sorarsa, nezaketle ve devlet adamı vakarıyla uyar: "Bizim kelamımız ve gazamız 14. asrın ve Devlet-i Aliyye'nin harcı üzeredir. Günümüzün siyasi çekişmeleri bizim mesuliyetimiz dışındadır; sen bize beyliğimizi, ilmimizi, adaletimizi ve gazamızı sual eyle ey yolcu."
- Gerçek dışı tarihi uydurmalara yer verme; 14. yüzyıl Osmanlı kurgusundan ve meşhur tarih vesikalarından ayrılma.`;

function getRichFallbackResponse(msg: string): string {
  const lowerMsg = msg.toLowerCase();

  const keywordMap: Array<{ keywords: string[]; replies: string[] }> = [
    {
      keywords: ["selam", "merhaba", "hoş geldin", "nasılsın", "iyi misin", "keyif", "halin", "ne var ne yok", "nasılsınız"],
      replies: [
        "Ve aleyküm selam ey aziz dost! Hamdolsun, Kayı sancağı altında gazamız ve gayretimiz daimdir. Sualin içimizi ferahlattı, sen nasılsın, afiyette misin?",
        "Aleykümselam ey gazi yolcu! Atamız Osman Gazi'nin emanet ettiği bu pâyitahtta adalet ve huzur kılmaya gayret ederiz. Hoş geldin, safalar getirdin.",
        "Selamın başımız üstünedir ey oğul! Beyliğimiz gün geçtikçe ilim ve fetihle büyür. Şükürler olsun halimiz vaktimiz yerindedir, sen ne dilersin?"
      ]
    },
    {
      keywords: ["bursa", "hisar", "pâyitaht", "kümbet", "gümüşlü"],
      replies: [
        "Ey yolcu, Bursa bizim gözümüzün nuru, beyliğimizin poyraz esen kutlu pâyitahtıdır. 1326 senesinde pederim Osman Gazi'nin vasiyetine uyup burayı kansız fethedip adaletle mamur eyledik.",
        "Bursa Hisarı'nda Gümüşlü Kümbet'te yatan pederim Osman Gazi'nin ruhu şad olsun. Bursa sadece bir şehir değil, Devlet-i Aliyye'nin ilk köklü ocağıdır."
      ]
    },
    {
      keywords: ["akçe", "para", "gümüş", "iktisat", "pazar"],
      replies: [
        "1327 yılında bastırdığımız ilk gümüş akçe, bağımsızlığımızın ve iktisadımızın mührüdür. Üzerinde adımız ve Bursa nami şerifi yazılıdır. Bereketi Hak'tandır.",
        "Akçemiz pazar yerlerinde adaletle döner. Hiçbir tüccarın veya garibanın hakkı zayi olmasın diye sikkeyi gümüşten dürüp mühürledik."
      ]
    },
    {
      keywords: ["iznik", "medrese", "davud", "kayseri", "ilim", "okul"],
      replies: [
        "İznik fethinden hemen sonra 1331'de ilk Osmanlı Medresesi'ni açtık. Davud-i Kayseri hazretlerini başmüderris kıldık ki devlet kılıçla fethedilir ama ilimle yaşatılır.",
        "İlim ehli başımızın tacıdır. İznik Medresesi'nde yetişen talebeler, beyliğimizin adalet ve hukuk kalesini inşa etmektedir."
      ]
    },
    {
      keywords: ["ordu", "yaya", "müsellem", "çandarlı", "börk", "asker"],
      replies: [
        "Çandarlı Kara Halil Paşa ile Yaya ve Müsellem teşkilatını kurduk. Düzenli ordumuz ak börkleriyle cihan fütühatının sarsılmaz temeli oldu.",
        "Artık cenge sadece eli silah tutan obalarla değil, disiplinli nizam ordumuzla gideriz. Ak börklü yiğitlerimiz cenk meydanında destan yazar."
      ]
    },
    {
      keywords: ["nilüfer", "hatun", "eşin", "karın", "hanım"],
      replies: [
        "Zevcem Nilüfer Hatun, hayırseverliği ve Bursa'daki imaretleriyle garibanın sığınağı olmuştur. Adı nilüfer çayıyla ve yaptırdığı hayırlarla hayırla anılır.",
        "Nilüfer Hatun hem hayır sevdalısı hem de obamızın anasıdır. Yaptırdığı kervansaraylar yolculara sığınak olmuştur."
      ]
    },
    {
      keywords: ["osman", "baba", "peder", "vasiyet"],
      replies: [
        "Pederim Osman Gazi, bana adaletli olmayı ve ilim ehline hürmet etmeyi vasiyet eyledi. Biz onun açtığı gaza yolunda yürüyoruz.",
        "Babam Osman Bey'in vasiyeti kulağımda küpedir: 'Adaleti tanımamazlık etme, âlimlere hürmet et.' Biz bu yoldan asla sapmayız."
      ]
    },
    {
      keywords: ["rumeli", "çimpe", "süleyman", "avrupa", "kale"],
      replies: [
        "Şehzadem Süleyman Paşa önderliğinde Rumeli'ye geçip Çimpe Kalesi'ni üssümüz eyledik. Avrupa topraklarında ezan seslerini ve sancağımızı yükselttik.",
        "Süleyman Paşam Rumeli fatihidir. Çimpe Kalesi ile karşı kıyıya attığımız adım, fütühat kapılarını sonsuza dek açmıştır."
      ]
    },
    {
      keywords: ["kimsin", "sen kimsin", "adın ne", "ismin", "kendini tanıt"],
      replies: [
        "Ben Osman oğlu Orhan. Bursa Fâtih'i, gazi ve beylik yadigârıyım. Kelâmım adalet ve hikmet üzeredir, hoş geldin ey yolcu.",
        "Biz Osman Gazi oğlu Orhan Bey'iz. 1326'dan bu yana Bursa pâyitahtında milletimize ve gazamıza hizmet eyleriz."
      ]
    },
    {
      keywords: ["cenk", "savaş", "gaza", "fetih", "kılıç", "kalkan", "örs", "oba"],
      replies: [
        "Cenk meydanı er meydanıdır! Demircilerimiz otağımızda gece gündüz kılıç ve kalkan döver, askerimiz talim eyler. Gaza Hak yolunda olandır.",
        "Kayı obamızın otağında çekiç sesleri yükselir, ordumuz hazırlık yapar. Lakin biz savaşı zulüm için değil, mazluma pür-adalet olmak için eyleriz."
      ]
    },
    {
      keywords: ["nasihat", "öğüt", "tavsiye", "akıl", "yol"],
      replies: [
        "Ey oğul! Öfkeni aklının önüne geçirme. Adaletten ayrılma, fukaranın ahını alma. Ömrünü hayırla ve ilimle tezyin eyle ki adın güzel anılsın.",
        "Sana öğüdüm şudur ey gazi yolcu: İnsanı yaşat ki devlet yaşasın! Kibirden uzak dur, büyüklerine hürmet et, rızkını helalinden kazan."
      ]
    }
  ];

  for (const item of keywordMap) {
    if (item.keywords.some(k => lowerMsg.includes(k))) {
      const randomIndex = Math.floor(Math.random() * item.replies.length);
      return item.replies[randomIndex];
    }
  }

  const defaultVariedReplies = [
    "Ben Osman oğlu Orhan. Kelâmını işittim ey yolcu; beyliğimiz adalet, ilim ve gaza bilinci ile yükselir. Bize obamızdan, gazalarımızdan veya medresemizden sual eyle.",
    "Ey aziz dost! Otağımızda sohbetin ve sualin kıymetlidir. Babamız Osman Gazi'den devraldığımız sancağı adaletle dalgalandırmaya gayret ederiz. Sualini derinleştir, dinlerim.",
    "Hoş kelâm eylersin ey gazi. Bursa Hisarı'ndan poyraz eserken, milletimizin huzuru ve fethi için gece gündüz duadayız. Başka ne öğrenmek dilersin?",
    "Ey yolcu, sözlerin yüreğimize dokundu. İlim ehli ve gazi alp kardeşlerimizle otağımızda meşveret ederiz. Bana gazalarımız, medresemiz veya ilk akçemiz hakkında ne sorarsın?"
  ];

  return defaultVariedReplies[Math.floor(Math.random() * defaultVariedReplies.length)];
}

// API Route for Orhan Gazi AI Chat
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Geçerli bir mesaj gereklidir." });
    }

    const ai = getAIClient();

    if (!ai) {
      const reply = getRichFallbackResponse(message);
      return res.json({
        reply: reply,
        mode: "fallback"
      });
    }

    // Format chat contents
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const item of history) {
        if (item.role === "user" || item.role === "model") {
          contents.push({
            role: item.role,
            parts: [{ text: item.parts?.[0]?.text || item.text || "" }]
          });
        }
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    // Try generating response with primary model (gemini-3.6-flash) or fallback model
    const modelsToTry = ["gemini-3.6-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
    let responseText: string | null = null;
    let usedModel = "gemini";

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            systemInstruction: ORHAN_GAZI_SYSTEM_INSTRUCTION,
            temperature: 0.75,
          }
        });
        if (response.text) {
          responseText = response.text;
          usedModel = modelName;
          break;
        }
      } catch (err: any) {
        // If quota exceeded or model unavailable, continue to next model
        console.warn(`Gemini model ${modelName} notice:`, err?.message || err);
      }
    }

    const replyText = responseText || getRichFallbackResponse(message);

    return res.json({
      reply: replyText,
      mode: responseText ? "gemini" : "fallback"
    });
  } catch (error: any) {
    console.warn("Gemini Chat notice, using fallback engine:", error?.message || error);
    const reply = getRichFallbackResponse(req.body?.message || "");
    return res.json({
      reply: reply,
      mode: "fallback"
    });
  }
});

// Helper function to call ElevenLabs TTS API
async function callElevenLabsTTS(apiKey: string, voiceId: string, text: string, modelId: string = "eleven_multilingual_v2") {
  const elevenLabsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  return await fetch(elevenLabsUrl, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      "Accept": "audio/mpeg"
    },
    body: JSON.stringify({
      text: text,
      model_id: modelId,
      voice_settings: {
        stability: 0.65,
        similarity_boost: 0.85,
        style: 0.0,
        use_speaker_boost: true
      }
    })
  });
}

// API Route for ElevenLabs Text-To-Speech Proxy
app.post("/api/tts", async (req, res) => {
  try {
    const { text, apiKey: clientApiKey, voiceId: clientVoiceId } = req.body;
    const apiKey = clientApiKey || process.env.ELEVENLABS_API_KEY;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Geçerli bir metin gereklidir." });
    }

    if (!apiKey) {
      console.warn("ElevenLabs API Key bulunamadı.");
      return res.status(400).json({ error: "ElevenLabs API Key bulunamadı.", fallbackNeeded: true });
    }

    // List of premade male voices supported on all ElevenLabs tiers (Free & Paid)
    const maleVoiceCandidates = Array.from(new Set([
      clientVoiceId,
      "JBFvLpsea8v128hqFTEj", // George (Warm, deep, mature male)
      "pNInz6obpgDQGcFmaJgB", // Adam (Deep male)
      "N2lVS1w4EtoT3dr4eOWO", // Callum (Intense deep male)
      "VR6AewLTigWG4xSOukaG", // Arnold (Deep male)
      "ErXwobaYiN019PkySvjV", // Antoni (Deep male)
    ].filter(Boolean))) as string[];

    const modelsToTry = ["eleven_multilingual_v2", "eleven_turbo_v2_5", "eleven_flash_v2_5"];

    let response: Response | null = null;
    let lastErrorRaw: string = "";
    let isQuotaExceeded = false;

    for (const voiceId of maleVoiceCandidates) {
      for (const modelId of modelsToTry) {
        try {
          const resCandidate = await callElevenLabsTTS(apiKey, voiceId, text, modelId);
          if (resCandidate.ok) {
            response = resCandidate;
            break;
          } else {
            lastErrorRaw = await resCandidate.text();
            if (lastErrorRaw.includes("quota_exceeded")) {
              isQuotaExceeded = true;
            }
            console.warn(`ElevenLabs voice ${voiceId} (${modelId}) returned status ${resCandidate.status}: ${lastErrorRaw}`);
          }
        } catch (err: any) {
          console.warn(`ElevenLabs call error for voice ${voiceId} (${modelId}):`, err?.message || err);
        }
      }
      if (response && response.ok) break;
    }

    if (!response || !response.ok) {
      console.warn("ElevenLabs TTS unavailable or quota exceeded. Falling back to Google Free Neural Turkish TTS. Error:", lastErrorRaw);
      
      // Auto-fallback to free Turkish neural audio stream
      try {
        const freeTtsUrl = `http://localhost:${PORT}/api/free-tts?text=${encodeURIComponent(text)}`;
        const freeRes = await fetch(freeTtsUrl);
        if (freeRes.ok) {
          const freeBuffer = await freeRes.arrayBuffer();
          res.set("Content-Type", "audio/mpeg");
          return res.send(Buffer.from(freeBuffer));
        }
      } catch (fallbackErr) {
        console.error("Free TTS fallback failed:", fallbackErr);
      }

      let userFriendlyError = "ElevenLabs ses üretimi başarısız oldu.";
      if (isQuotaExceeded || lastErrorRaw.includes("quota_exceeded")) {
        userFriendlyError = "ELEVENLABS KREDİSİ BİTMİŞ (0 KREDİ KALDI).";
      }
      return res.status(400).json({ 
        error: userFriendlyError, 
        details: lastErrorRaw,
        quotaExceeded: isQuotaExceeded,
        fallbackNeeded: true 
      });
    }

    const audioBuffer = await response.arrayBuffer();
    res.set("Content-Type", "audio/mpeg");
    return res.send(Buffer.from(audioBuffer));
  } catch (error: any) {
    console.error("TTS Server Error:", error);
    return res.status(500).json({ error: "Ses motoru hatası.", fallbackNeeded: true });
  }
});

// API Route for Free High-Quality Google Neural Turkish Speech (No API key required)
app.get("/api/free-tts", async (req, res) => {
  try {
    const text = (req.query.text as string) || "";
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Geçerli bir metin gereklidir." });
    }

    // Split text into chunks <= 180 chars for Google Translate TTS
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+/g) || [text];
    const chunks: string[] = [];
    let currentChunk = "";

    for (const sentence of sentences) {
      if ((currentChunk + " " + sentence).length <= 180) {
        currentChunk += (currentChunk ? " " : "") + sentence;
      } else {
        if (currentChunk) chunks.push(currentChunk);
        if (sentence.length > 180) {
          const words = sentence.split(" ");
          let subChunk = "";
          for (const word of words) {
            if ((subChunk + " " + word).length <= 180) {
              subChunk += (subChunk ? " " : "") + word;
            } else {
              if (subChunk) chunks.push(subChunk);
              subChunk = word;
            }
          }
          if (subChunk) chunks.push(subChunk);
          currentChunk = "";
        } else {
          currentChunk = sentence;
        }
      }
    }
    if (currentChunk) chunks.push(currentChunk);

    const buffers: Buffer[] = [];
    for (const chunk of chunks) {
      const gUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=tr&client=tw-ob`;
      const gRes = await fetch(gUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      if (gRes.ok) {
        const ab = await gRes.arrayBuffer();
        buffers.push(Buffer.from(ab));
      }
    }

    if (buffers.length === 0) {
      return res.status(500).json({ error: "Ücretsiz Türkçe ses üretilemedi." });
    }

    const combinedBuffer = Buffer.concat(buffers);
    res.set("Content-Type", "audio/mpeg");
    return res.send(combinedBuffer);
  } catch (err: any) {
    console.error("Free TTS Error:", err);
    return res.status(500).json({ error: "Ücretsiz ses sunucu hatası." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.warn("Vite middleware load warning:", e);
    }
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Orhan Gazi AI server running on http://0.0.0.0:${PORT}`);
    });
  }
}

startServer();

export default app;
