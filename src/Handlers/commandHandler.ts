import { Client } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";
import { Command } from "types";

module.exports = (client: Client) => {
  const commands: Command[] = [];

  let commandsDir = join(__dirname, "../Commands");

  readdirSync(commandsDir).forEach((file) => {
    let { command } = require(`${commandsDir}/${file}`);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());

    console.log(`Successfully loaded command ${command.data.name}`);
  });
};
