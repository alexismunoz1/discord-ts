import { SlashCommandBuilder } from "discord.js";
import { Command } from "types";

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Shows the bot's ping"),
  execute: (interaction) => {
    interaction.reply({
      content: `Pong! \n 📡 Ping: ${interaction.client.ws.ping}`,
      ephemeral: true,
    });
  },
};
