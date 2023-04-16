// const { Player } = require("discord-music-player");
const { Player } = require("discord-player");
const {
  Client,
  ActivityType,
  Events,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const { TOKEN, CLIENTID } = process.env;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
  ],
  presence: {
    status: "online",
    activities: [
      {
        type: ActivityType.Listening,
        name: "to /play",
      },
    ],
  },
});

const player = new Player(client, {
  timeout: 86400000,
  volume: 200,
  quality: "high",
  disableVolume: false,
  leaveOnEnd: false,
  leaveOnStop: false,
  leaveOnEmpty: false,
  deafenOnJoin: true,
});

client.player = player;

const commands = [];

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  commands.push(command.data.toJSON());
  client.commands.set(command.data.name, command);
}

const rest = new REST({ version: "10" }).setToken(TOKEN);

const servers = 0;

// The put method is used to fully refresh all commands in the guild with the current set
client.on("ready", async () => {
  // Get all ids of the servers
  console.log(
    `Started refreshing ${commands.length} application (/) commands.`
  );
  const guild_ids = client.guilds.cache.map((guild) => guild.id);
  for (const guildId of guild_ids) {
    await rest
      .put(Routes.applicationGuildCommands(CLIENTID, guildId), {
        body: commands,
      })
      .then(() =>
        console.log(
          `Successfully updated commands for guild ${servers + 1}` + guildId
        )
      )
      .catch(console.error);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await interaction.deferReply({ fetchReply: true });
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

client.login(TOKEN);
