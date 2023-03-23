const { Player } = require("discord-music-player");
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

const { TOKEN, CLIENTID, GUILDID } = process.env;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.GuildMessageReactions,
  ],
  presence: {
    status: "idle",
    activities: [
      {
        type: ActivityType.Watching,
        name: "you creating me 😊",
      },
    ],
  },
});

const player = new Player(client, {
  timeout: 86400000,
  volume: 200,
  quality: "high",
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

// and deploy your commands!
client.once("ready", () => {
  (async () => {
    try {
      console.log(
        `Started refreshing ${commands.length} application (/) commands.`
      );

      // The put method is used to fully refresh all commands in the guild with the current set
      const data = await rest.put(
        Routes.applicationGuildCommands(CLIENTID, GUILDID),
        { body: commands }
      );

      console.log(
        `Successfully loaded ${data.length} application (/) commands.`
      );
    } catch (error) {
      // And of course, make sure you catch and log any errors!
      console.error(error);
    }
  })();
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(client, interaction);
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
