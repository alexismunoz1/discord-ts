import { ChatInputCommandInteraction } from "discord.js";
import { BotEvent } from "types";

const event: BotEvent = {
  name: "interactionCreate",
  execute: (interaction: ChatInputCommandInteraction) => {
    if (interaction.isChatInputCommand()) {
      let command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        return interaction.reply({
          content: "This command is outdated.",
          ephemeral: true,
        });
      }

      command.execute(interaction);
    }
  },
};

export default event;
