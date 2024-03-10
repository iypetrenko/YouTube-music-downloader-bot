const { Telegraf } = require("telegraf");
const ytdl = require("ytdl-core");
const dotenv = require("dotenv");
dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) =>
  ctx.reply(
    "Привет! Просто отправь мне ссылку на видео с YouTube, и я пришлю тебе аудиофайл этого видео."
  )
);

bot.on("message", async (ctx) => {
  try {
    const messageText = ctx.message.text;
    console.log("Received message:", messageText);

    if (!ytdl.validateURL(messageText)) {
      throw new Error("Invalid YouTube URL");
    }

    const audioInfo = await ytdl.getInfo(messageText);
    const audioFormats = ytdl.filterFormats(audioInfo.formats, "audioonly");
    const audioFormat = ytdl.chooseFormat(audioFormats, {
      quality: "highestaudio",
    });

    console.log("Downloading audio:", audioInfo.videoDetails.title);
    const stream = ytdl(messageText, { format: audioFormat });

    ctx.reply("Загружаю аудиофайл, пожалуйста, подождите...");
    ctx
      .replyWithAudio({
        source: stream,
        filename: audioInfo.videoDetails.title,
      })
      .then(() => console.log("Audio sent!"))
      .catch((err) => console.error("Error sending audio:", err));
  } catch (error) {
    console.error("Error:", error.message);
    ctx.reply(
      "Произошла ошибка. Пожалуйста, убедитесь, что вы отправили корректную ссылку на видео с YouTube."
    );
  }
});

bot.launch().then(() => console.log("Бот успешно запущен!"));
