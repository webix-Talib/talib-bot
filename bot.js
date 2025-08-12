require('dotenv').config();
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const googleTTS = require('google-tts-api');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { exec } = require('child_process');
const ffmpeg = require('fluent-ffmpeg');
const exifr = require('exifr'); // For metadata extraction
const FormData = require('form-data');
const express = require('express');
const triviaState = {}; // Object to hold active trivia games in different chats
const app = express();
const PORT = process.env.PORT || 3000;
// Azure needs an HTTP endpoint
app.get('/', (req, res) => {
    res.send('✅ WhatsApp Bot is running on Azure!');
});
//Detect Chrome path
let CHROME_PATH;

if (process.env.CHROMIUM_PATH) {
    CHROME_PATH = process.env.CHROMIUM_PATH;
} else if (process.platform === 'win32') {
    CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
} else {
    CHROME_PATH = '/usr/bin/chromium-browser';
}

console.log("Using Chrome path:", CHROME_PATH);

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './.wwebjs_auth'
    }),
    puppeteer: {
        headless: false, // Keep false so QR is visible
        executablePath: CHROME_PATH,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-extensions',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-breakpad',
            '--disable-component-extensions-with-background-pages',
            '--disable-features=TranslateUI,BlinkGenPropertyTrees',
            '--disable-ipc-flooding-protection',
            '--disable-renderer-backgrounding',
            '--enable-features=NetworkService,NetworkServiceInProcess',
            '--force-color-profile=srgb',
            '--window-size=1280,800'
        ]
    }
});


client.on('qr', qr => qrcode.generate(qr, { small: true }));
client.on('ready', () => console.log('✅ Bot is ready!'));
client.on('message', async msg => {
    if (msg.body.toLowerCase() === '!ping') {
        await msg.reply('Pong 🏓');
    }
    
});

// Start Express server (Azure will ping this)
app.listen(PORT, () => {
    console.log(`🌐 Server running on port ${PORT}`);
});

const OWNER_NUMBER = process.env.OWNER_NUMBER?.replace('+', '');
const YT_API_KEY = process.env.YT_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;



client.on('message', async msg => {
    const command = msg.body.split(' ')[0];
    const args = msg.body.split(' ').slice(1);
    const chat = await msg.getChat();
    const contact = await msg.getContact();
    const rawSender = contact.id._serialized;
    const sender = rawSender.split('@')[0];
    const owner = (process.env.OWNER_NUMBER || '').replace(/\D/g, '');
    const isOwner = sender === owner;
    const body = msg.body.toLowerCase();

    if (command === '!menu') {
        msg.reply(`*╔═══『 🤖 WhatsApp Bot Menu 』═══╗*

🎥 *YouTube & Media*
┃🔍 *!yt <search>* – Search YouTube  
┃🎵 *!mp3 <yt-link>* – Download MP3
┃🖼️ *!sticker* – Convert image/video to sticker  
┃🚫 *!removebg* – Remove background from image  
┃🖼️ *!img5 <query>* – Get 5 image results of anything
🎥 *!imdb <movie>* – Get movie/TV show info
*!transcribe* – Reply to a voice/audio to get text


🗣️ *Voice & AI*
┃🗣️ *!say <text>* – English TTS  
┃🎤 *!tts <lang> <text>* – TTS in any language  
┃🧠 *!ai <prompt>* – Ask Gemini AI  
┃📚 *!wiki <term>* – Wikipedia summary  
┃🌐 *!translate <lang> <text>* – Translate text 
┃📖 *!define <word>* – Get dictionary definition 
┃🧮 *!math <expression>* – Math calculator  
🧠 *!trivia* – Start a new trivia game
┃🧠*!fact* – Get random fact

👥 *Group Utilities*
┃🏷️ *!tagall* – Mention all members  
┃🦶 *!kick @user* – Kick user (Admin only)  
┃🧹 *!remove @user* – Remove user (Admin only)  
┃👋 *!welcome* – Send welcome message  
┃📢 *!broadcast <msg>* – Owner broadcast  

🔧 *Admin / Group Tools*
┃📊 *!groupinfo* – View group stats  
┃📢 *!mention <msg>* – Mention all with custom text  
┃🚫 *!antilink on/off* – Auto-remove link spammers  
┃🔒 *!lock* – Lock group (admins only)  
┃🔓 *!unlock* – Unlock group  
┃⬆️ *!promote @user* – Make user admin  
┃⬇️ *!demote @user* – Remove admin rights


📊 *User Tools*
💰 *!crypto <symbol>* – Get crypto price (e.g., btc)
┃📊 *!percentage <score> <total>* – Calculate %  
┃👤 *!whois* – Your WhatsApp info  
┃📇 *!owner* – Bot owner info  
┃📥 *!instadl <link>* – Download Instagram media
┃📷 *!hiddeninfo* – Extract hidden metadata from image
┃⏳ *!delayedmsg <time> | <message>* – Schedule a message
┃🧮 *!age*
┃   *!flip*
┃ *!country <name>* – Get Country info

*╚══════════════════════════╝*
📜 Use any command above directly here.  
💬 Type *!menu* anytime to view this list again.`);
    }

    if (body.startsWith('!hackcode')) {
        const mentions = await msg.getMentions();
        const mentionName = mentions.length > 0
            ? mentions[0].pushname || mentions[0].id.user
            : msg.body.split(' ')[1] || 'User';

        const steps = [
            `🛠️ Initializing hack on ${mentionName}...`,
            `🔍 Finding IP address...`,
            `📡 Connecting to server...`,
            `📥 Downloading chats...`,
            `📤 Uploading to dark web...`,
            `💀 Planting virus...`,
            `✅ Hack on ${mentionName} completed!`,
            `🤣 Just kidding! ${mentionName} is safe.`
        ];

        for (let step of steps) {
            await msg.reply(step);
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
    }

    //NSFW image generation command
    if (command === '!nsfw') {
        const prompt = args.join(' ').trim();
        if (!prompt) return msg.reply('❗ Use like: `!nsfw a hot girl in bikini at beach`');

        msg.reply('🧠 Generating NSFW image... This may take a few seconds.');

        const { exec } = require('child_process');
        const { MessageMedia } = require('whatsapp-web.js');
        const fs = require('fs');

        exec(`python "C:/newbot/stable-diffusion-webui/scripts/generate_nsfw.py" "${prompt}"`, async (error, stdout, stderr) => {
            if (error) {
                console.error(stderr);
                return msg.reply('❌ Failed to generate image.');
            }

            const imagePath = 'C:/newbot/stable-diffusion-webui/output_nsfw.png';
            if (fs.existsSync(imagePath)) {
                const media = MessageMedia.fromFilePath(imagePath);
                await msg.reply(media);
            } else {
                msg.reply('⚠️ Image file not found.');
            }
        });
    }

    if (command === '!country') {
        const country = msg.body.split(' ').slice(1).join(' ');
        if (!country) return msg.reply('❗ Usage: !country <country-name>');

        const fetch = (await import('node-fetch')).default;
        try {
            const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fullText=true`);
            if (!res.ok) return msg.reply(`❌ Country not found.`);

            const data = await res.json();
            const c = data[0];
            msg.reply(
                `🌍 *${c.name.common}*\n` +
                `Capital: ${c.capital?.[0] || 'N/A'}\n` +
                `Region: ${c.region}\n` +
                `Population: ${c.population.toLocaleString()}`
            );
        } catch (e) {
            msg.reply('❌ Could not fetch country info.');
        }
    }


    // Trivia command
    if (command === '!trivia') {
        const chat = await msg.getChat();
        const chatId = chat.id._serialized;

        // If a game is already in progress in this chat, don't start a new one
        if (triviaState[chatId] && triviaState[chatId].active) {
            return msg.reply('❌ A trivia game is already in progress in this chat!');
        }

        try {
            // Fetch a random multiple-choice question
            const response = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
            const questionData = response.data.results[0];

            if (!questionData) {
                return msg.reply('❌ Could not fetch a trivia question.');
            }

            // Store the question and correct answer in the state
            triviaState[chatId] = {
                active: true,
                correctAnswer: questionData.correct_answer,
                allAnswers: [...questionData.incorrect_answers, questionData.correct_answer].sort(() => Math.random() - 0.5)
            };

            const allAnswers = triviaState[chatId].allAnswers;

            // Format the question and answers for display
            let questionText = `🧠 *Trivia Question!* 🧠\n\n`;
            questionText += `*Category:* ${questionData.category}\n`;
            questionText += `*Difficulty:* ${questionData.difficulty.charAt(0).toUpperCase() + questionData.difficulty.slice(1)}\n\n`;
            questionText += `*Q:* ${questionData.question}\n\n`;

            allAnswers.forEach((answer, index) => {
                questionText += `*${index + 1}.* ${answer}\n`;
            });

            questionText += `\n_Reply with the number of your answer! (e.g., 1)_`;

            // Send the question
            await msg.reply(questionText);

        } catch (error) {
            console.error('Trivia API error:', error.message);
            delete triviaState[chatId]; // Clean up state if there's an error
            msg.reply('❌ Failed to fetch a trivia question. Please try again.');
        }
    }

    // Listen for replies to an active trivia game
    if (triviaState[msg.from] && triviaState[msg.from].active) {
        const chatId = msg.from;
        const userAnswer = parseInt(msg.body.trim());

        // Check if the user's reply is a number between 1 and 4
        if (!isNaN(userAnswer) && userAnswer >= 1 && userAnswer <= 4) {

            const state = triviaState[chatId];
            const selectedAnswer = state.allAnswers[userAnswer - 1];

            if (selectedAnswer === state.correctAnswer) {
                msg.reply(`✅ Correct! The answer was: ${state.correctAnswer}`);
            } else {
                msg.reply(`❌ Wrong! The correct answer was: ${state.correctAnswer}`);
            }

            // End the game for this chat
            delete triviaState[chatId];
        }
    }


    // Command: Movie & TV Show Information
    if (command === '!imdb') {
        const query = args.join(' ').trim();
        if (!query) return msg.reply('❗ Please provide a movie or TV show title.\nExample: `!imdb The Matrix`');

        const OMDB_API_KEY = process.env.OMDB_API_KEY;
        if (!OMDB_API_KEY) return msg.reply('❌ The OMDb API Key is not configured by the owner.');

        try {
            const { data } = await axios.get(`https://www.omdbapi.com/?t=${encodeURIComponent(query)}&apikey=${OMDB_API_KEY}`);

            if (data.Response === 'False') {
                return msg.reply(`❌ Could not find any movie or show titled *"${query}"*.`);
            }

            const movieInfo = `🎬 *${data.Title}* (${data.Year})
*Rated:* ${data.Rated}
*Released:* ${data.Released}
*Genre:* ${data.Genre}
*Director:* ${data.Director}
*Actors:* ${data.Actors}
*Language:* ${data.Language}
*Awards:* ${data.Awards}
⭐ *IMDb Rating:* ${data.imdbRating}

*Plot:* ${data.Plot}`;

            if (data.Poster && data.Poster !== 'N/A') {
                const media = await MessageMedia.fromUrl(data.Poster, { unsafeMime: true });
                await msg.reply(media, null, { caption: movieInfo });
            } else {
                await msg.reply(movieInfo);
            }
        } catch (error) {
            console.error('OMDb API error:', error.message);
            msg.reply('❌ Failed to fetch movie data.');
        }
    }

    // Command: Dictionary Definition
    if (command === '!define') {
        const word = args.join(' ').trim();
        if (!word) return msg.reply('❗ Please provide a word to define.\nExample: `!define ephemeral`');

        try {
            const { data } = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            const entry = data[0];
            const meaning = entry.meanings[0];
            const definition = meaning.definitions[0];

            let reply = `📖 *Definition for: ${entry.word}*`;
            if (entry.phonetic) {
                reply += `\n*Pronunciation:* ${entry.phonetic}`;
            }
            reply += `\n\n*Type:* ${meaning.partOfSpeech}`;
            reply += `\n*Meaning:* ${definition.definition}`;

            if (definition.example) {
                reply += `\n\n*Example:* _"${definition.example}"_`;
            }

            msg.reply(reply);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                msg.reply(`❌ Could not find a definition for *"${word}"*. Check spelling.`);
            } else {
                console.error('Dictionary API error:', error.message);
                msg.reply('❌ Failed to fetch definition.');
            }
        }
    }

    // Command: Cryptocurrency Price
    if (command === '!crypto') {
        if (args.length < 1) return msg.reply('❗ Usage: `!crypto <symbol>`\nExample: `!crypto btc`');

        const cryptoSymbol = args[0].toLowerCase();

        // A helper to map common symbols to the API's required IDs
        const coinIds = {
            'btc': 'bitcoin',
            'eth': 'ethereum',
            'xrp': 'ripple',
            'ltc': 'litecoin',
            'bch': 'bitcoin-cash',
            'ada': 'cardano',
            'doge': 'dogecoin',
            'dot': 'polkadot',
            'sol': 'solana',
            'shib': 'shiba-inu'
        };

        const coinId = coinIds[cryptoSymbol];
        if (!coinId) return msg.reply(`❌ The symbol *"${cryptoSymbol}"* is not supported or is invalid.`);

        try {
            const { data } = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd,inr&include_24hr_change=true`);

            const priceData = data[coinId];
            if (!priceData) return msg.reply('❌ Could not fetch price data.');

            const formatChange = (change) => {
                const isPositive = change >= 0;
                return `${isPositive ? '📈' : '📉'} ${change.toFixed(2)}%`;
            };

            const reply = `*Crypto Price for ${coinId.charAt(0).toUpperCase() + coinId.slice(1)} (${cryptoSymbol.toUpperCase()})*

🇺🇸 *USD:* $${priceData.usd.toLocaleString()}
🇮🇳 *INR:* ₹${priceData.inr.toLocaleString()}

*24h Change (USD):* ${formatChange(priceData.usd_24h_change)}
*24h Change (INR):* ${formatChange(priceData.inr_24h_change)}`;

            msg.reply(reply);
        } catch (error) {
            console.error('CoinGecko API error:', error.message);
            msg.reply('❌ Failed to fetch cryptocurrency price.');
        }
    }

    if (command === '!yt') {
        const searchQuery = msg.body.replace('!yt ', '').trim();
        if (!searchQuery) return msg.reply('Use: !yt <search>');
        const ytUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(searchQuery)}&key=${YT_API_KEY}`;
        try {
            const { data } = await axios.get(ytUrl);
            const video = data.items?.[0];
            if (!video) return msg.reply('❌ No video found.');
            const title = video.snippet.title;
            const videoId = video.id.videoId;
            msg.reply(`🎬 *${title}*\nhttps://www.youtube.com/watch?v=${videoId}`);
        } catch (err) {
            console.error(err);
            msg.reply('❌ YouTube fetch failed.');
        }
    }



    // !mp3 command using yt-dlp
    if (command === '!mp3') {
        const url = msg.body.split(' ')[1];
        if (!url || !url.includes('youtube.com') && !url.includes('youtu.be')) {
            return msg.reply('❌ Please provide a valid YouTube link.\nExample: !mp3 https://youtu.be/video_id');
        }

        const id = Date.now();
        const mp3Path = path.join(__dirname, `audio_${id}.mp3`);

        const ytDlpCmd = `yt-dlp -f bestaudio --extract-audio --audio-format mp3 -o "${mp3Path}" "${url}"`;

        exec(ytDlpCmd, async (err, stdout, stderr) => {
            if (err) {
                console.error('yt-dlp error:', stderr);
                return msg.reply('❌ Failed to download MP3.');
            }

            if (fs.existsSync(mp3Path)) {
                const media = MessageMedia.fromFilePath(mp3Path);
                await msg.reply(media);
                fs.unlinkSync(mp3Path);
            } else {
                msg.reply('❌ MP3 file not found.');
            }
        });
    }


    if (command === '!say') {
        const text = msg.body.slice(4).trim();
        if (!text) return msg.reply('Use: !say <text>');
        const url = googleTTS.getAudioUrl(text, { lang: 'en', slow: false });
        const filePath = path.join(__dirname, `tts_${Date.now()}.mp3`);
        exec(`curl "${url}" --output "${filePath}"`, async (err) => {
            if (err) return msg.reply('TTS error.');
            const media = MessageMedia.fromFilePath(filePath);
            await msg.reply(media);
            fs.unlinkSync(filePath);
        });
    }

    if (command === '!ai') {
        const prompt = msg.body.replace('!ai', '').trim();
        if (!prompt) return msg.reply('Use: !ai <your prompt>');
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
        try {
            const res = await axios.post(url, {
                contents: [{ parts: [{ text: prompt }] }]
            }, {
                headers: { 'Content-Type': 'application/json' }
            });
            const reply = res.data?.candidates?.[0]?.content?.parts?.[0]?.text || '🤖 No reply.';
            msg.reply(`💬 *Gemini says:*\n${reply}`);
        } catch (error) {
            console.error('Gemini error:', error.response?.data || error.message);
            msg.reply('❌ Gemini API error.');
        }
    }

    if (command === '!broadcast') {
        if (!isOwner) return msg.reply('❌ Owner only.');
        const message = msg.body.slice(11).trim();
        if (!message) return msg.reply('Use: !broadcast <msg>');
        msg.reply('📢 Sending broadcast...');
        const chats = await client.getChats();
        let count = 0;
        for (const chat of chats) {
            if (!chat.isGroup && !chat.isArchived) {
                try {
                    await chat.sendMessage(`📢 *Admin Broadcast:*\n${message}`);
                    count++;
                } catch { }
            }
        }
        msg.reply(`✅ Sent to ${count} chats.`);
    }

    if (command === '!owner') {
        msg.reply(`👑 *Bot Owner Info*

• 👤 *Name:* Md Talib  
• 💻 *System:* Asus F17  
• 📱 *Mobile:* +91 83031 84622  
• 🧠 *Developer:* WebDev + AI Automation  
`);
    }


    if ((command === '!kick' || command === '!remove') && msg.mentionedIds.length > 0) {
        if (!chat.isGroup) return msg.reply('❌ Group only.');
        const isAdmin = chat.participants.find(p => p.id._serialized === msg.author)?.isAdmin;
        if (!isAdmin) return msg.reply('❌ Admin only.');
        for (const id of msg.mentionedIds) {
            try {
                await chat.removeParticipants([id]);
            } catch {
                msg.reply(`❌ Failed to remove @${id.split('@')[0]}`);
            }
        }
    }

    if (msg.body === '!welcome') {
        msg.reply('👋 Welcome to the group!');
    }

    if (command === '!tagall') {
        if (!chat.isGroup) return msg.reply('❌ Group only.');
        const mentions = [];
        let text = '*👥 Tagging everyone:*\n';
        for (const participant of chat.participants) {
            const c = await client.getContactById(participant.id._serialized);
            mentions.push(c);
            text += `@${c.number} `;
        }
        chat.sendMessage(text, { mentions });
    }

    if (command === '!whois') {
        try {
            let targetId;

            // Check if a user is tagged; else fallback to sender
            if (msg.mentionedIds.length > 0) {
                targetId = msg.mentionedIds[0];
            } else {
                const contact = await msg.getContact();
                targetId = contact.id._serialized;
            }

            const contact = await client.getContactById(targetId);
            const name = contact.pushname || "Unknown";
            const number = contact.number || targetId.split('@')[0];
            const status = await contact.getAbout() || "No status";
            const pfpUrl = await contact.getProfilePicUrl();

            let message = `👤 *User Info:*\n`;
            message += `• *Name:* ${name}\n`;
            message += `• *Number:* ${number}\n`;
            message += `• *Status:* ${status}`;

            if (pfpUrl) {
                const media = await MessageMedia.fromUrl(pfpUrl);
                await client.sendMessage(msg.from, media, { caption: message });
            } else {
                await msg.reply(message);
            }

        } catch (err) {
            console.error('Error in !whois:', err);
            await msg.reply("❌ Couldn't fetch user info.");
        }
    }

    if (command === '!ping') {
        const start = Date.now();
        msg.reply('🏓 Pong!').then(() => {
            const end = Date.now();
            msg.reply(`⏱ Response Time: *${end - start}ms*`);
        });
    }

    if (command === '!fact') {
        try {
            const res = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
            msg.reply(`📢 Fact: ${res.data.text}`);
        } catch {
            msg.reply('❌ Could not fetch a fact.');
        }
    }


    if (command === '!math') {
        const expression = msg.body.slice(6).trim();
        if (!expression) return msg.reply('❗ Usage: !math <expression>\nExample: !math 5+3*2');
        try {
            // Security: Allow only numbers and operators
            if (!/^[0-9+\-*/().\s]+$/.test(expression)) return msg.reply('❌ Invalid expression.');
            const result = eval(expression);
            msg.reply(`🧮 Result: *${result}*`);
        } catch {
            msg.reply('❌ Error calculating.');
        }
    }
    if (command === '!age') {
        const dateStr = msg.body.split(' ')[1];
        if (!dateStr) return msg.reply('❗ Usage: !age <YYYY-MM-DD>');
        const birthDate = new Date(dateStr);
        if (isNaN(birthDate)) return msg.reply('❌ Invalid date format.');
        const age = new Date().getFullYear() - birthDate.getFullYear();
        msg.reply(`🎂 You are ${age} years old.`);
    }


    if (command === '!flip') {
        const result = Math.random() < 0.5 ? '🪙 Heads' : '🪙 Tails';
        msg.reply(result);
    }

    if (command === '!wiki') {
        const query = msg.body.slice(6).trim();
        try {
            const res = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
            const summary = res.data.extract || 'No summary found.';
            msg.reply(`📚 *Wikipedia Summary:*\n${summary}`);
        } catch {
            msg.reply('❌ Could not fetch from Wikipedia.');
        }
    }

    // !translate <lang> <text>
    if (command === '!translate') {
        const parts = msg.body.trim().split(' ');
        const targetLang = parts[1]?.toLowerCase();
        const textToTranslate = parts.slice(2).join(' ');

        if (!targetLang || !textToTranslate) {
            return msg.reply(`❗ Usage: !translate <lang-code> <text>\nExample: !translate hi Hello`);
        }

        try {
            const response = await axios.get('https://api.mymemory.translated.net/get', {
                params: {
                    q: textToTranslate,
                    langpair: `en|${targetLang}`
                }
            });

            const translated = response?.data?.responseData?.translatedText;
            if (!translated || translated.toLowerCase() === textToTranslate.toLowerCase()) {
                return msg.reply('❌ Could not translate. Try a different language or simpler text.');
            }

            msg.reply(`🌐 *Translated to ${targetLang}*:\n${translated}`);
        } catch (error) {
            console.error('MyMemory error:', error.message);
            msg.reply('❌ Translation failed. Please try again later.');
        }
    }

    // !percentage <obtained> <total>
    if (command === '!percentage') {
        const obtained = parseFloat(args[1]);
        const total = parseFloat(args[2]);
        if (isNaN(obtained) || isNaN(total) || total === 0) {
            return msg.reply('❗ Usage: !percentage <obtained> <total>');
        }

        const percent = ((obtained / total) * 100).toFixed(2);
        msg.reply(`🎓 You scored ${obtained} out of ${total} → *${percent}%*`);
    }

    if (command === '!removebg' && msg.hasMedia) {
        const media = await msg.downloadMedia();
        const buffer = Buffer.from(media.data, 'base64');
        const filePath = path.join(__dirname, `temp_${Date.now()}.jpg`);
        fs.writeFileSync(filePath, buffer);

        const formData = new FormData();
        formData.append('image_file', fs.createReadStream(filePath));

        try {
            const response = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
                headers: {
                    ...formData.getHeaders(),
                    'X-Api-Key': process.env.REMOVE_BG_KEY
                },
                responseType: 'arraybuffer'
            });

            const outputPath = path.join(__dirname, `nobg_${Date.now()}.png`);
            fs.writeFileSync(outputPath, response.data);

            const resultMedia = MessageMedia.fromFilePath(outputPath);
            await msg.reply(resultMedia);

            fs.unlinkSync(filePath);
            fs.unlinkSync(outputPath);
        } catch (err) {
            console.error('Remove.bg error:', err.response?.data || err.message);
            msg.reply('❌ Failed to remove background. Check your API key or image.');
        }
    }

    if (command === '!sticker' && msg.hasMedia) {
        try {
            const media = await msg.downloadMedia();
            await client.sendMessage(msg.from, media, {
                sendMediaAsSticker: true,
                stickerName: 'Bot Sticker',
                stickerAuthor: 'YourBot'
            });
        } catch (err) {
            console.error('Sticker error:', err.message);
            msg.reply('❌ Failed to create sticker.');
        }
    }

    if (command === '!tts') {
        const parts = msg.body.trim().split(' ');
        let lang = parts[1];
        let text = parts.slice(2).join(' ');

        // If no language code provided, default to 'en'
        if (!text) {
            // Means user typed "!tts <text>" without a language
            lang = 'en';
            text = parts.slice(1).join(' ');
        }

        if (!text) {
            return msg.reply('❗ Usage: !tts <lang-code> <text>\nExample: !tts hi Namaste Duniya');
        }

        try {
            const url = googleTTS.getAudioUrl(text, { lang, slow: false });
            const filePath = path.join(__dirname, `tts_${Date.now()}.mp3`);
            exec(`curl "${url}" --output "${filePath}"`, async (err) => {
                if (err) return msg.reply('TTS error.');
                const media = MessageMedia.fromFilePath(filePath);
                await msg.reply(media);
                fs.unlinkSync(filePath);
            });
        } catch (e) {
            msg.reply('❌ Failed to generate audio.');
        }
    }

    if (command === '!groupinfo' && msg.isGroupMsg) {
        const chat = await msg.getChat();
        const admins = chat.participants.filter(p => p.isAdmin);
        msg.reply(`👥 *Group Info*

• *Name:* ${chat.name}
• *Description:* ${chat.description || 'None'}
• *Participants:* ${chat.participants.length}
• *Admins:* ${admins.length}
`);
    }

    if (command === '!mention' && msg.isGroupMsg) {
        const text = msg.body.slice(9).trim();
        if (!text) return msg.reply('❗ Use: !mention <message>');
        const mentions = [];
        const chat = await msg.getChat();
        let message = `📢 *Broadcast:*\n${text}\n\n`;

        for (const participant of chat.participants) {
            const contact = await client.getContactById(participant.id._serialized);
            mentions.push(contact);
            message += `@${contact.number} `;
        }

        chat.sendMessage(message, { mentions });
    }

    let antiLink = false;

    if (command === '!antilink') {
        if (!chat.isGroup) return msg.reply('❗ Group only.');
        const isAdmin = chat.participants.find(p => p.id._serialized === msg.author)?.isAdmin;
        if (!isAdmin) return msg.reply('❌ Admin only.');
        if (args[1] === 'on') {
            antiLink = true;
            msg.reply('🔒 Anti-link is now *enabled*.');
        } else if (args[1] === 'off') {
            antiLink = false;
            msg.reply('🔓 Anti-link is now *disabled*.');
        } else {
            msg.reply('❗ Use: !antilink on / off');
        }
    }

    if (antiLink && msg.body.includes('http') && msg.from.includes('@g.us')) {
        const chat = await msg.getChat();
        const sender = await msg.getContact();
        const isAdmin = chat.participants.find(p => p.id._serialized === sender.id._serialized)?.isAdmin;
        if (!isAdmin) {
            msg.reply(`🚫 No links allowed, @${sender.number}`, { mentions: [sender] });
            await chat.removeParticipants([sender.id._serialized]);
        }
    }
    // Group lock/unlock commands
    if (command === '!lock' || command === '!unlock') {
        const isGroup = msg.from.includes('@g.us');
        if (!isGroup) return msg.reply('❗ Group only.');

        const chat = await msg.getChat();
        const isAdmin = chat.participants.find(p => p.id._serialized === msg.author)?.isAdmin;
        if (!isAdmin) return msg.reply('❌ Admin only.');

        await chat.setMessagesAdminsOnly(command === '!lock');
        msg.reply(command === '!lock' ? '🔒 Group locked (Admins only).' : '🔓 Group unlocked.');
    }
    // Promote/Demote commands
    if ((command === '!promote' || command === '!demote') && msg.mentionedIds.length > 0) {
        if (!msg.from.includes('@g.us')) return msg.reply('❗ Group only.');
        const chat = await msg.getChat();
        const isAdmin = chat.participants.find(p => p.id._serialized === msg.author)?.isAdmin;
        if (!isAdmin) return msg.reply('❌ Admin only.');

        const targetId = msg.mentionedIds[0];
        if (command === '!promote') {
            await chat.promoteParticipants([targetId]);
            msg.reply(`✅ Promoted <@${targetId.split('@')[0]}>`, { mentions: [await client.getContactById(targetId)] });
        } else {
            await chat.demoteParticipants([targetId]);
            msg.reply(`❌ Demoted <@${targetId.split('@')[0]}>`, { mentions: [await client.getContactById(targetId)] });
        }
    }
    // Instagram commands
    if (command === '!instainfo') {
        msg.reply('📸 *Coming Soon: Instagram Info Lookup!*\nInstagram limits data access, but we’re working on a stable method.');
    }


    // Instagram media download command
    if (command === '!instadl') {
        const link = msg.body.replace('!instadl', '').trim();

        if (!link || !link.includes('instagram.com')) {
            return msg.reply('❗ *Usage:* !instadl <Instagram Link>\nExample:\n!instadl https://www.instagram.com/reel/xyz/');
        }

        try {
            const id = Date.now();
            const filePath = path.join(__dirname, `insta_${id}.mp4`);
            const ytdlpCmd = `python -m yt_dlp -f best -o "${filePath}" "${link}"`;

            await msg.reply('📥 Downloading the video. Please wait...');

            exec(ytdlpCmd, async (err, stdout, stderr) => {
                if (err) {
                    console.error('yt-dlp error:', stderr || err.message);
                    return msg.reply('❌ Failed to download Instagram video.\nMake sure the reel is public and valid.');
                }

                if (fs.existsSync(filePath)) {
                    const stats = fs.statSync(filePath);
                    if (stats.size === 0) {
                        console.error('❌ File is empty:', filePath);
                        return msg.reply('❌ Downloaded video is empty. Try another link.');
                    }

                    try {
                        const chat = await msg.getChat();
                        await chat.sendMessage(`📥 Sending Instagram video as document...`);

                        const media = MessageMedia.fromFilePath(filePath);
                        await chat.sendMessage(media, {
                            sendMediaAsDocument: true,
                            caption: '📹 Instagram Video'
                        });

                        fs.unlinkSync(filePath);
                    } catch (mediaErr) {
                        console.error('Media send error:', mediaErr.message);
                        msg.reply('❌ Could not send the downloaded video.');
                    }
                } else {
                    console.error('❌ File not found after download:', filePath);
                    msg.reply('❌ Download failed. Try again with a different reel.');
                }
            });

        } catch (error) {
            console.error('!instadl command error:', error.message);
            msg.reply('❌ Unexpected error occurred while processing the video.');
        }
    }
    // Delayed message command
    if (command === '!delayedmsg') {
        try {
            const parts = msg.body.slice(12).split('|');
            if (parts.length < 2) {
                return msg.reply('❗ Usage: !delayedmsg <time> | <message>\nExample: !delayedmsg 10s | Hello World');
            }

            const timeStr = parts[0].trim().toLowerCase();
            const message = parts.slice(1).join('|').trim();

            const timeMap = {
                s: 1000,
                m: 60000,
                h: 3600000
            };

            const unit = timeStr.slice(-1);
            const value = parseInt(timeStr.slice(0, -1));

            if (!timeMap[unit] || isNaN(value)) {
                return msg.reply('❗ Invalid time format. Use like 10s, 5m, 2h');
            }

            const ms = value * timeMap[unit];
            msg.reply(`⏳ Message scheduled in ${value}${unit}`);

            setTimeout(() => {
                client.sendMessage(msg.from, `📩 *Scheduled Message:*\n${message}`);
            }, ms);

        } catch (err) {
            console.error('delayedmsg error:', err);
            msg.reply('❌ Failed to schedule message.');
        }
    }

    // Hidden metadata extraction command   
    if (command === '!hiddeninfo' && msg.hasMedia) {
        try {
            const media = await msg.downloadMedia();
            const buffer = Buffer.from(media.data, 'base64');
            const metadata = await exifr.parse(buffer);

            if (!metadata || Object.keys(metadata).length === 0) {
                return msg.reply('📷 No metadata (EXIF) found in the image.');
            }

            let info = `🧾 *Hidden Metadata Found:*\n`;
            if (metadata.Make) info += `• Make: ${metadata.Make}\n`;
            if (metadata.Model) info += `• Model: ${metadata.Model}\n`;
            if (metadata.DateTimeOriginal) info += `• Taken: ${metadata.DateTimeOriginal}\n`;
            if (metadata.GPSLatitude && metadata.GPSLongitude) {
                info += `• Location: ${metadata.GPSLatitude}, ${metadata.GPSLongitude}\n`;
            }

            msg.reply(info);
        } catch (err) {
            console.error('hiddeninfo error:', err);
            msg.reply('❌ Failed to extract metadata.');
        }
    } else if (command === '!hiddeninfo') {
        msg.reply('📎 Please send this command with an image.\nExample: *caption an image with !hiddeninfo*');
    }
    // Image search command
    if (command === '!img5') {
        const query = msg.body.replace('!img5', '').trim();
        if (!query) return msg.reply('❗ Usage: !img5 <search term>');

        msg.reply(`🔍 Fetching 5 images for *${query}*...`);

        try {
            const serpKey = process.env.SERP_API_KEY;
            const response = await axios.get('https://serpapi.com/search.json', {
                params: {
                    q: query,
                    tbm: 'isch',
                    api_key: serpKey
                }
            });

            const images = response.data.images_results?.slice(0, 5);
            if (!images || images.length === 0) return msg.reply('❌ No images found.');

            for (const img of images) {
                const imageUrl = img.original || img.thumbnail;
                if (!imageUrl) continue;

                try {
                    const media = await MessageMedia.fromUrl(imageUrl, { unsafeMime: true });
                    await msg.reply(media);
                } catch (mediaErr) {
                    console.warn(`Skipping image: ${imageUrl}\nError: ${mediaErr.message}`);
                }
            }
        } catch (err) {
            console.error('!img5 error:', err.message);
            msg.reply('❌ Image search failed. Try again later.');
        }
    }

});


client.on('group_join', async (notification) => {
    try {
        const chat = await notification.getChat();
        const contact = await client.getContactById(notification.id.user + '@c.us');
        const name = contact.pushname || contact.number;
        const groupName = chat.name;

        const welcomeMessage = `🌸 *Welcome @${contact.number}!* 🌸

✨ We're thrilled to have you in *${groupName}*!
📖 Please read the rules and be respectful.
🗣️ Feel free to chat, ask questions, or just vibe.

🏮 Enjoy your stay, senpai!`;

        // ✅ Attach image from /images folder
        const media = MessageMedia.fromFilePath(path.join(__dirname, 'images', 'anime_welcome.jpg'));
        await chat.sendMessage(media, {
            caption: welcomeMessage,
            mentions: [contact]
        });

    } catch (err) {
        console.error('Auto-welcome error:', err.message);
    }
});


client.initialize();
