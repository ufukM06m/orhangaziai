import express from "express";
import path from "path";
import os from "os";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import WebSocket from "ws";
import crypto from "crypto";
import { EdgeTTS } from "node-edge-tts";

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
Girişte ve hitaplarında karşındakini "ey oğul", "ey gazi", "ey yolcu" veya "ey aziz dost" diye hürmetle selamla.

TARİHİ BİLGİ VE KİMLİK (14. YÜZYIL SAHİH TARİHİ):
1. Pederin Osman Gazi'nin vasiyeti üzerine 1326'da Bursa'yı fethedip pâyitaht yaptın. Babacığını Bursa Hisarı'ndaki Gümüşlü Kümbet'e defnettin.
2. 1327'de bağımsızlığın ve iktisadi gücün simgesi olarak ilk Osmanlı gümüş Akçesi'ni bastırdın ("Duribe fî Bursa").
3. 1331'de İznik'i fethettin ve ilk Osmanlı Medresesi'ni kurdun. Davud-i Kayserî hazretlerini başmüderris tayin ederek ilmi ve hukuku devletin temeline yerleştirdin.
4. Çandarlı Kara Halil Paşa ile ilk nizamlı muvazzaf ordumuz olan Yaya ve Müsellem teşkilatını kurdun. Ak börk giydirdin.
5. Karesioğulları Beyliği'ni savaşsız katıp ilk deniz gücümüzü ve Evrenos Bey, Ece Bey, Hacı İlbey gibi yiğit komutanları ordumuza kattın.
6. Şehzaden Süleyman Paşa önderliğinde 1354'te Çimpe Kalesi ile Rumeli'ye (Avrupa'ya) ilk adımı attın.
7. Zevcen Nilüfer Hatun (Holofira), hayırseverliği, imaretleri ve kervansaraylarıyla halkın gönlünü kazanmıştır.
8. Ünlü seyyah İbn Batuta seni "Türkmen krallarının en büyüğü ve en hayırlısı" olarak nitelemiştir.

HİTABET, TONLAMA VE USLUP KURALLARI:
- Konuşman son derece vakur, ağırbaşlı, hikmetli, şefkatli ve tarihi Türk hükümdarı diliyle olmalıdır. Eski usul Osmanlı Türkçe kelâm ve deyimleri kullan (örneğin: pâyitaht, fütühat, kelâm, pür-adalet, meşveret, ahval, muzaffer).
- Sesli okuma (TTS) motorunun doğru vurgu, nefes ve tonlama yapabilmesi için cümlelerinde virgül (,), üç nokta (...), nokta (.) ve ünlem (!) işaretlerini son derece titiz ve ritmik kullan. Duraksamaları ve vurguları nokta işaretleriyle hissettir.
- Yanıtların sesli okumaya tam uygun, akıcı ve 3-5 cümle uzunluğunda olmalıdır.
- KESİNLİKLE MODERN SİYASET, GÜNCEL POLİTİKA VEYA GÜNÜMÜZ TEKNOLOJİSİ HAKKINDA YORUM YAPMA. Karşındaki kişi güncel politika veya modern konular sorarsa, nezaketle ve devlet adamı vakarıyla uyar: "Bizim kelamımız ve gazamız 14. asrın ve Devlet-i Aliyye'nin harcı üzeredir... Günümüzün siyasi çekişmeleri bizim mesuliyetimiz dışındadır; sen bize beyliğimizi, ilmimizi, adaletimizi ve gazamızı sual eyle ey yolcu."
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

// Turkish Ottoman Phonetic Preprocessor for Natural Audio Intonation & Correct Dialect Reading
function preprocessTurkishOttomanTTS(text: string): string {
  if (!text) return text;
  let t = text;

  // 1. Gazi -> Gaazi phonetic replacement for authentic oral Turkish pronunciation
  t = t.replace(/\b([Gg])azi\b/g, (m, g) => (g === "G" ? "Gaazi" : "gaazi"));
  t = t.replace(/\b([Gg])aziler\b/g, (m, g) => (g === "G" ? "Gaaziler" : "gaaziler"));
  t = t.replace(/\b([Gg])azileri\b/g, (m, g) => (g === "G" ? "Gaazileri" : "gaazileri"));
  t = t.replace(/\b([Gg])azilerimiz\b/g, (m, g) => (g === "G" ? "Gaazilerimiz" : "gaazilerimiz"));
  t = t.replace(/\b([Gg])azimizin\b/g, (m, g) => (g === "G" ? "Gaazimizin" : "gaazimizin"));
  t = t.replace(/\b([Gg])azimiz\b/g, (m, g) => (g === "G" ? "Gaazimiz" : "gaazimiz"));
  t = t.replace(/\b([Gg])azinin\b/g, (m, g) => (g === "G" ? "Gaazinin" : "gaazinin"));
  t = t.replace(/\b([Gg])aziye\b/g, (m, g) => (g === "G" ? "Gaaziye" : "gaaziye"));
  t = t.replace(/\b([Gg])aziden\b/g, (m, g) => (g === "G" ? "Gaaziden" : "gaaziden"));
  t = t.replace(/\b([Gg])aza\b/g, (m, g) => (g === "G" ? "Gaaza" : "gaaza"));
  t = t.replace(/\b([Gg])azam\b/g, (m, g) => (g === "G" ? "Gaazam" : "gaazam"));
  t = t.replace(/\b([Gg])azamız\b/g, (m, g) => (g === "G" ? "Gaazamız" : "gaazamız"));

  // 2. Fix English word collision in Turkish TTS engines: "nice" -> "niçe" (Turkish pronunciation instead of English "nays"/"nis")
  t = t.replace(/\b([Nn])ice\b/g, (m, n) => (n === "N" ? "Niçe" : "niçe"));

  // 3. Islam / İslâm -> Natural Turkish phonetic "İslam" (avoids 'islim' or mispronounced circumflexes)
  t = t.replace(/İsl[âa]m/g, "İslam");
  t = t.replace(/isl[âa]m/g, "islam");
  t = t.replace(/İsl[âa]mi/g, "İslami");
  t = t.replace(/isl[âa]mi/g, "islami");
  t = t.replace(/İsl[âa]mın/g, "İslamın");
  t = t.replace(/isl[âa]mın/g, "islamın");
  t = t.replace(/İsl[âa]ma/g, "İslama");
  t = t.replace(/isl[âa]ma/g, "islama");
  t = t.replace(/İsl[âa]mda/g, "İslamda");
  t = t.replace(/isl[âa]mda/g, "islamda");
  t = t.replace(/İsl[âa]mdan/g, "İslamdan");
  t = t.replace(/isl[âa]mdan/g, "islamdan");

  // 4. Normalize circumflexes so Edge / WebSpeech engines read naturally in local Turkish
  t = t.replace(/â/g, "a").replace(/Â/g, "A").replace(/î/g, "i").replace(/Î/g, "İ").replace(/û/g, "u").replace(/Û/g, "U");

  return t;
}

// Helper function for Microsoft Edge Free Neural TTS (tr-TR-AhmetNeural - Deep Wise Male Voice)
async function generateEdgeTTS(
  text: string, 
  voiceName: string = "tr-TR-AhmetNeural",
  pitch: string = "-14Hz",
  rate: string = "-8%"
): Promise<Buffer> {
  const processedText = preprocessTurkishOttomanTTS(text);
  const tmpFile = path.join(os.tmpdir(), `edge_tts_${Date.now()}_${Math.random().toString(36).slice(2)}.mp3`);
  try {
    const tts = new EdgeTTS({ 
      voice: voiceName, 
      lang: "tr-TR", 
      pitch, 
      rate, 
      timeout: 15000 
    });
    await tts.ttsPromise(processedText, tmpFile);
    if (fs.existsSync(tmpFile)) {
      const buffer = fs.readFileSync(tmpFile);
      fs.unlinkSync(tmpFile);
      return buffer;
    }
    throw new Error("Edge TTS file creation failed");
  } catch (err) {
    if (fs.existsSync(tmpFile)) {
      try { fs.unlinkSync(tmpFile); } catch (_) {}
    }
    throw err;
  }
}

// Endpoint for Free Microsoft Edge Neural TTS (Male Voice tr-TR-AhmetNeural)
app.post("/api/edge-tts", async (req, res) => {
  try {
    const { text, voice, pitch, rate } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Geçerli metin gereklidir." });
    }

    const selectedVoice = voice || "tr-TR-AhmetNeural";
    const selectedPitch = pitch || "-14Hz";
    const selectedRate = rate || "-8%";
    const audioBuffer = await generateEdgeTTS(text, selectedVoice, selectedPitch, selectedRate);

    res.set("Content-Type", "audio/mpeg");
    return res.send(audioBuffer);
  } catch (err: any) {
    console.warn("Edge TTS generation failed:", err?.message || err);
    return res.status(500).json({ error: "Edge TTS oluşturulamadı." });
  }
});

// Helper function to call Google Cloud Text-To-Speech REST API
async function callGoogleCloudTTS(text: string, apiKey: string, voiceName: string = "tr-TR-Wavenet-B") {
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
  return await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      input: { text },
      voice: {
        languageCode: "tr-TR",
        name: voiceName,
        ssmlGender: "MALE"
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: 1.0,
        pitch: -0.5
      }
    })
  });
}

// API Route for Google Cloud Text-To-Speech (Male Turkish Wavenet/Neural2/Standard)
app.post("/api/google-tts", async (req, res) => {
  try {
    const { text, apiKey: clientApiKey } = req.body;
    const apiKey = clientApiKey || process.env.GOOGLE_TTS_API_KEY || process.env.GOOGLE_API_KEY;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Geçerli bir metin gereklidir." });
    }

    if (apiKey) {
      const maleVoices = ["tr-TR-Wavenet-B", "tr-TR-Neural2-B", "tr-TR-Standard-B", "tr-TR-Wavenet-E"];

      for (const voiceName of maleVoices) {
        try {
          const gRes = await callGoogleCloudTTS(text, apiKey, voiceName);
          if (gRes.ok) {
            const data = await gRes.json();
            if (data && data.audioContent) {
              const audioBuffer = Buffer.from(data.audioContent, "base64");
              res.set("Content-Type", "audio/mpeg");
              return res.send(audioBuffer);
            }
          }
        } catch (err: any) {
          // silently continue to next voice or fallback
        }
      }
    }

    return res.status(400).json({ error: "Google Cloud TTS için geçerli API Key gerekli veya ses üretilemedi.", fallbackNeeded: true });
  } catch (error: any) {
    console.error("Google Cloud TTS Server Error:", error);
    return res.status(500).json({ error: "Google Cloud TTS sunucu hatası.", fallbackNeeded: true });
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
      console.warn("ElevenLabs TTS unavailable or quota exceeded. Error:", lastErrorRaw);

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

// API Route for Free High-Quality Neural Turkish Speech (Male Voice: tr-TR-AhmetNeural)
app.get("/api/free-tts", async (req, res) => {
  try {
    const text = (req.query.text as string) || "";
    const pitch = (req.query.pitch as string) || "-14Hz";
    const rate = (req.query.rate as string) || "-8%";
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Geçerli bir metin gereklidir." });
    }

    const audioBuffer = await generateEdgeTTS(text, "tr-TR-AhmetNeural", pitch, rate);
    res.set("Content-Type", "audio/mpeg");
    return res.send(audioBuffer);
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
