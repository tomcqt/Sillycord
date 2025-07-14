const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  EmbedBuilder,
  ActivityType,
  AttachmentBuilder,
} = require("discord.js");
const { createCanvas, loadImage, registerFont } = require("canvas");
const sharp = require("sharp");
const GIFEncoder = require("gifencoder");
const path = require("path");
const https = require("https");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
  ],
});

const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  new SlashCommandBuilder()
    .setName("burger")
    .setDescription("is burger. sends burger.")
    .addBooleanOption((option) =>
      option
        .setName("cheese")
        .setDescription("cheese or no cheese")
        .setRequired(true)
    ),
  new SlashCommandBuilder().setName("meow").setDescription("meows and mrrps!"),
  new SlashCommandBuilder()
    .setName("petpet")
    .setDescription("Creates a petpet gif!")
    .addUserOption((o) =>
      o
        .setName("user")
        .setDescription("User avatar to pet (optional)")
        .setRequired(false)
    )
    .addStringOption((o) =>
      o
        .setName("url")
        .setDescription("Image URL to pet (optional)")
        .setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName("members")
    .setDescription("Get the member count of the server (and other info)")
    .addStringOption((option) =>
      option
        .setName("code")
        .setDescription("Invite code to get the member count for")
        .setRequired(true)
    ),
  // Message context menu command
  new ContextMenuCommandBuilder()
    .setName("Sillify! :3")
    .setType(ApplicationCommandType.Message),
  new ContextMenuCommandBuilder()
    .setName("Quote Message")
    .setType(ApplicationCommandType.Message),
].map((command) => command.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("Started refreshing application (/) commands globally.");
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });
    console.log("Successfully reloaded application (/) commands globally.");
  } catch (error) {
    console.error(error);
  }
})();

function getReadableTimeAgo(unixSeconds) {
  const then = new Date(unixSeconds * 1000);
  const now = new Date();
  let diff = Math.floor((now - then) / 1000); // in seconds

  const units = [
    { label: "year", seconds: 31557600 },
    { label: "month", seconds: 2629800 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];

  const parts = [];

  for (const unit of units) {
    const count = Math.floor(diff / unit.seconds);
    if (count > 0) {
      parts.push(`${count} ${unit.label}${count > 1 ? "s" : ""}`);
      diff -= count * unit.seconds;
    }
    if (parts.length >= 2) break; // Show only top 2 units
  }

  return parts.length > 0 ? `${parts.join(", ")} ago` : "just now";
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setPresence({
    status: "online",
    activities: [
      {
        state: `Being silly since ${getReadableTimeAgo(1751667836)}`,
        name: "sillies status",
        type: ActivityType.Custom,
      },
    ],
  });

  setInterval(() => {
    client.user.setPresence({
      status: "online",
      activities: [
        {
          state: `Being silly since ${getReadableTimeAgo(1751667836)}`,
          name: "sillies status",
          type: ActivityType.Custom,
        },
      ],
    });
  }, 60_000);
});

// register the quote font
registerFont(path.join(__dirname, "Montserrat-Regular.ttf"), {
  family: "QuoteFont",
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "ping") {
      const responses = [
        "fetching the sillies...",
        "looking for goobers...",
        "pinging the discord...",
        "checking the stuff...",
      ];
      const sent = await interaction.reply({
        content: responses[Math.floor(Math.random() * responses.length)],
        fetchReply: true,
      });
      const apiLatency = Math.round(client.ws.ping);
      const messageLatency =
        sent.createdTimestamp - interaction.createdTimestamp;
      const uptime = Math.floor(process.uptime());
      const uptimeStr = [
        Math.floor(uptime / 3600) + "h",
        Math.floor((uptime % 3600) / 60) + "m",
        (uptime % 60) + "s",
      ].join(" ");

      const embed = new EmbedBuilder()
        .setTitle("ponged! :DD")
        .setColor(0x3ab8ba)
        .addFields(
          { name: "API Latency", value: `${apiLatency}ms`, inline: true },
          {
            name: "Message Latency",
            value: `${messageLatency}ms`,
            inline: true,
          },
          { name: "Uptime", value: uptimeStr, inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ content: null, embeds: [embed] });
    } else if (interaction.commandName === "burger") {
      const cheese = interaction.options.getBoolean("cheese");
      if (cheese) {
        await interaction.reply("🧀🍔");
      } else {
        await interaction.reply("🍔");
      }
    } else if (interaction.commandName === "meow") {
      const meowData = [
        [
          [
            [["m"], [1, 1]],
            [
              ["e", "o", "eo"],
              [1, 1],
            ],
            [["w"], [0, 10]],
            [["w"], [1, 1]],
          ],
          [
            [["mrr"], [1, 1]],
            [["r"], [0, 10]],
            [["p"], [1, 3]],
          ],
        ],
        [[[[" "], [1, 1]]]],
        [
          [[["^w^"], [1, 1]]],
          [
            [
              [":", ":'", ";", ">:"],
              [1, 1],
            ],
            [["3"], [1, 10]],
            [["c"], [0, 1]],
          ],
        ],
      ];

      let randomSelect = (arr) =>
        arr.at(Math.floor(Math.random() * arr.length)); // select random element of array
      let randomInt = (min, max) =>
        Math.floor(Math.random() * (max - min) + min); // get random int from range (shit)

      let message = "";

      meowData.forEach((phrase) => {
        let word = randomSelect(phrase);
        word.forEach((syllableContainer) => {
          let primedSyllable = randomSelect(syllableContainer.at(0));
          let repeatCount = randomInt(
            syllableContainer.at(1).at(0),
            syllableContainer.at(1).at(1)
          );
          let finishedSyllable = primedSyllable.repeat(repeatCount);

          message += finishedSyllable;
        });
      });

      await interaction.reply(message);
    } else if (interaction.commandName === "petpet") {
      await interaction.deferReply();

      const user = interaction.options.getUser("user");
      const url = interaction.options.getString("url");
      const imgUrl = user
        ? user.displayAvatarURL({ extension: "png", size: 512 })
        : url ||
          interaction.user.displayAvatarURL({ extension: "png", size: 512 });

      const avatarBuffer = await downloadImage(imgUrl);
      const avatarImg = await loadImage(avatarBuffer);

      // Load petpet frames
      const frameUrls = Array.from(
        { length: 10 },
        (_, i) =>
          `https://raw.githubusercontent.com/VenPlugs/petpet/main/frames/pet${i}.gif`
      );
      const frames = await Promise.all(frameUrls.map(loadImage));

      const canvas = createCanvas(128, 128);
      const ctx = canvas.getContext("2d");
      const encoder = new GIFEncoder(128, 128);

      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(20);
      encoder.setTransparent();
      encoder.setQuality(10);

      for (let i = 0; i < frames.length; i++) {
        ctx.clearRect(0, 0, 128, 128);

        const j = i < 5 ? i : 10 - i;
        const scale = 0.8 + j * 0.02;
        const hscale = 0.8 - j * 0.05;
        const dx = (1 - scale) * 64;
        const dy = 128 * (1 - hscale) - 0.08 * 128;

        ctx.drawImage(avatarImg, dx, dy, scale * 128, hscale * 128);
        ctx.drawImage(frames[i], 0, 0, 128, 128);

        encoder.addFrame(ctx);
      }

      encoder.finish();
      const gif = encoder.out.getData();
      const attachment = new AttachmentBuilder(gif, { name: "petpet.gif" });

      await interaction.editReply({ files: [attachment] });
    } else if (interaction.commandName === "members") {
      // send information about the server members in a nice embed
      // embed example:
      // Server Members
      // Users: 123  Online Members: 45
      // Bots: 45    Online Bots: 10
      // Total: 168  Offline: 113
      const guildId = interaction.options
        .getString("code")
        .replace("discord.gg", "")
        .replace("https://", "")
        .replace("http://", "");
      const guildUrl = `https://discord.com/api/v10/invites/${guildId}?with_counts=true`;
      const guildInfo = await fetch(guildUrl, {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
        },
      });
      const guildData = await guildInfo.json();
      const name = guildData.guild.name || "Unknown Server";
      const iconUrl = guildData.guild.icon;
      const online = guildData.approximate_presence_count;
      const total = guildData.approximate_member_count;
      const color = guildData.profile.brand_color_primary || 0x3ab8ba; // default to teal if no color
      const embed = new EmbedBuilder()
        .setTitle(name)
        .setThumbnail(
          iconUrl
            ? `https://cdn.discordapp.com/icons/${guildData.guild.id}/${iconUrl}.png?size=128`
            : "https://cdn.discordapp.com/embed/avatars/0.png"
        )
        .setColor(color)
        .setFooter({
          text: `Made by Sillycord`,
          iconURL:
            "https://cdn.discordapp.com/avatars/1390815472412397701/a0fa77580a39404d81a6165e1f400718.webp", // sillycord pfp
        })
        .addFields(
          {
            name: "Online Users",
            value: `${online}`,
            inline: true,
          },
          {
            name: "Total",
            value: `${total}`,
            inline: true,
          }
        )
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    }
  }

  // Handle message context menu
  if (interaction.isMessageContextMenuCommand()) {
    if (interaction.commandName === "Sillify! :3") {
      const message = interaction.targetMessage;

      // Sillify logic
      function sillify(text) {
        let silly = text
          .replace(/r/gi, "w")
          .replace(/l/gi, "w")
          .replace(/n/gi, "ny")
          .replace(/ove/gi, "uv")
          .replace(/th/gi, "d")
          .replace(/s/gi, "z");
        const faces = [":3", "x3", ":3c", "UwU", "OwO", ">w<", "^w^"];
        silly += " " + faces[Math.floor(Math.random() * faces.length)];
        return silly;
      }

      const sillyText = sillify(message.content);

      const embed = new EmbedBuilder()
        .setDescription(sillyText)
        .setColor(0x3ab8ba)
        .setFooter({
          text: `siwwified fwom ${message.author.displayName}!`,
          iconURL: message.author.displayAvatarURL({
            extension: "png",
            size: 128,
          }),
        });

      if (
        message.author.id ===
        "1390815472412397701" /* i hate discord.js WHY IS IT A STRING */
      ) {
        await interaction.reply("you cant sillify me, silly! :P");
        return;
      }

      await interaction.reply({ embeds: [embed] });
    } else if (interaction.commandName === "Quote Message") {
      const msg = interaction.targetMessage;
      const author = msg.author;
      const displayName = author.displayName || author.username;

      const width = 800;
      const height = 250;

      // 1. Download the avatar as buffer
      const avatarUrl = author.displayAvatarURL({
        extension: "png",
        size: 512,
      });
      const avatarBuffer = await downloadImage(avatarUrl);

      // 2. Use sharp to crop+blur it like CSS background-size: cover
      const blurredAvatarBuffer = await sharp(avatarBuffer)
        .resize(width, height, { fit: "cover" })
        .blur(20)
        .toBuffer();

      // 3. Load blurred avatar into canvas
      const bgImg = await loadImage(blurredAvatarBuffer);
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bgImg, 0, 0, width, height);

      // 4. Overlay dark layer
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fillRect(0, 0, width, height);

      // 5. Draw circular PFP
      const pfpImg = await loadImage(avatarBuffer);
      const pfpSize = 96;
      const pfpX = 40;
      const pfpY = 70;
      ctx.save();
      const radius = 20; // adjust corner radius
      roundedRectPath(ctx, pfpX, pfpY, pfpSize, pfpSize, radius);
      ctx.clip();
      ctx.drawImage(pfpImg, pfpX, pfpY, pfpSize, pfpSize);
      ctx.restore();

      // 6. Draw text
      ctx.fillStyle = "white";
      ctx.font = "28px Montserrat";
      ctx.fillText(displayName, 160, 110);

      ctx.font = "24px Montserrat";
      const content = msg.content?.trim() || "[no content]";
      wrapText(ctx, `"${content}"`, 160, 150, 600, 30);

      // 7. Footer
      ctx.font = "14px Montserrat";
      ctx.fillStyle = "#ccc";
      ctx.textAlign = "left";
      ctx.fillText("made by Sillycord", 40, height - 20);
      ctx.textAlign = "right";
      ctx.fillText(
        "https://sillycord.tomcat.sh/invite",
        width - 40,
        height - 20
      );

      // 8. Send image
      const buffer = canvas.toBuffer("image/png");
      const attachment = new AttachmentBuilder(buffer, { name: "quote.png" });
      await interaction.reply({ files: [attachment] });
    }
  }
});

// helper functions for the quoting code
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

function roundedRectPath(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

client.login(process.env.DISCORD_TOKEN);
