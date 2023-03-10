import {
  AutocompleteInteraction,
  Collection,
  MessagePayload,
  MessageCreateOptions,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

export interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => void;
  autocomplete?: (interaction: AutocompleteInteraction) => void;
}

export interface BotEvent {
  name: string;
  once?: boolean | false;
  on?: boolean | false;
  execute: (...args) => void;
}

declare module "discord.js" {
  export interface Client {
    commands: Collection<string, Command>;
  }
  export interface GuildMember {
    _roles: Array<string>;
  }

  export interface CategoryChannel {
    send(
      content: string | MessagePayload | MessageCreateOptions
    ): Promise<void>;
  }
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_TOKEN: string;
      SERVER_ID: string;
      ROL_AM_ID: string;
      ROL_PM_ID: string;
      ROL_AM_PM_ID: string;
      ROL_INGROUP_ID: string;
      ROL_ADMIN_ID: string;
      CATEGORY_AM_ID: string;
      CATEGORY_PM_ID: string;
      CATEGORY_AM_PM_ID: string;
      CHANNEL_LOGS_NEW_MEMBER_ID: string;
      CHANNEL_LOGS_ONBOARDING_NOTICES_ID: string;
    }
  }
}
