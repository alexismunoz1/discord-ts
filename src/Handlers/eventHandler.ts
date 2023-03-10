import { Client } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";
import { BotEvent } from "types";

module.exports = async (client: Client) => {
  const eventsDir = join(__dirname, "../Events");

  readdirSync(eventsDir).forEach((file) => {
    let event: BotEvent = require(`${eventsDir}/${file}`).default;
    event.once
      ? client.once(event.name, (...args) => event.execute(...args))
      : client.on(event.name, (...args) => event.execute(...args));

    console.log(`Successfully loaded event ${event.name}`);
  });
};
