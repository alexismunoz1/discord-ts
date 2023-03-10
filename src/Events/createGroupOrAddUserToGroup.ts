import "dotenv/config";
import {
  Events,
  ChannelType,
  MessageReaction,
  User,
  Role,
  Collection,
  GuildBasedChannel,
  BaseGuildTextChannel,
  BaseGuildVoiceChannel,
} from "discord.js";
import { BotEvent } from "types";

const event: BotEvent = {
  name: Events.MessageReactionAdd,
  on: true,
  async execute(reaction: MessageReaction, user: User) {
    if (reaction.message.id === process.env.MESSAGE_ENDONBOARDING_ID) {
      const guildServer = reaction.client.guilds.cache.get(
        process.env.SERVER_ID
      );
      if (!guildServer || guildServer == undefined) return;

      const userData = guildServer.members.cache.find(
        ({ id }) => id == user.id
      );
      if (!userData) return;

      const AmRol = guildServer.roles.cache.get(process.env.ROL_AM_ID);
      if (!AmRol) return;
      const PmRol = guildServer.roles.cache.get(process.env.ROL_PM_ID);
      if (!PmRol) return;
      const AmPmRol = guildServer.roles.cache.get(process.env.ROL_AM_PM_ID);
      if (!AmPmRol) return;
      const InGroupRol = guildServer.roles.cache.get(
        process.env.ROL_INGROUP_ID
      );
      if (!InGroupRol) return;

      const hasAmRol = userData._roles.includes(AmRol.id);
      const hasPmRol = userData._roles.includes(PmRol.id);
      const hasAmPmRol = userData._roles.includes(AmPmRol.id);

      const AmCategory = guildServer.channels.cache.get(
        process.env.CATEGORY_AM_ID
      );
      if (!AmCategory) return;
      const PmCategory = guildServer.channels.cache.get(
        process.env.CATEGORY_PM_ID
      );
      if (!PmCategory) return;
      const AmPmCategory = guildServer.channels.cache.get(
        process.env.CATEGORY_AM_PM_ID
      );
      if (!AmPmCategory) return;

      const AmChannelsOfCategory = guildServer.channels.cache.filter(
        (item) => item.parentId === process.env.CATEGORY_AM_ID
      );
      const PmChannelsOfCategory = guildServer.channels.cache.filter(
        (item) => item.parentId === process.env.CATEGORY_PM_ID
      );
      const AmPmChannelsOfCategory = guildServer.channels.cache.filter(
        (item) => item.parentId === process.env.CATEGORY_AM_PM_ID
      );

      const textChannelPermissions = {
        EmbedLinks: true,
        ViewChannel: true,
        AttachFiles: true,
        SendMessages: true,
        AddReactions: true,
        ChangeNickname: true,
        MentionEveryone: true,
        UseExternalEmojis: true,
        ReadMessageHistory: true,
        CreatePublicThreads: true,
        UseExternalStickers: true,
        CreatePrivateThreads: true,
        SendMessagesInThreads: true,
        UseEmbeddedActivities: true,
      };

      const voiceChannelPermissions = {
        Speak: true,
        UseVAD: true,
        Stream: true,
        Connect: true,
        ViewChannel: true,
        MuteMembers: true,
        SendMessages: true,
        EmbedLinks: true,
        AttachFiles: true,
        AddReactions: true,
        ChangeNickname: true,
        MentionEveryone: true,
        UseExternalEmojis: true,
        ReadMessageHistory: true,
        CreatePublicThreads: true,
        UseExternalStickers: true,
        CreatePrivateThreads: true,
        SendMessagesInThreads: true,
        UseEmbeddedActivities: true,
      };

      const createGroup = async (
        parentId: string,
        lastCreatedGroupId: number,
        userRol: Role
      ) => {
        const newGroupI = lastCreatedGroupId + 1;

        const newTextChannel = await guildServer.channels.create({
          name: `💬・chat-grupo-${newGroupI}`,
          type: ChannelType.GuildText,
          parent: parentId,
        });

        newTextChannel.permissionOverwrites.create(
          user.id,
          textChannelPermissions
        );

        newTextChannel.permissionOverwrites.create(guildServer.roles.everyone, {
          ViewChannel: false,
          SendMessages: false,
        });

        const newVoiceChannel = await guildServer.channels.create({
          name: `🙌・call-grupo-${newGroupI}`,
          type: ChannelType.GuildVoice,
          parent: parentId,
        });
        newVoiceChannel.permissionOverwrites.create(
          user.id,
          voiceChannelPermissions
        );
        newVoiceChannel.permissionOverwrites.create(
          guildServer.roles.everyone,
          {
            ViewChannel: false,
            SendMessages: false,
          }
        );

        await sendIntegromatMessage(newTextChannel.id, user.id, userRol);
        return;
      };

      const addUserToGroup = async (
        channelsOfCategory: Collection<string, GuildBasedChannel>,
        lastCreatedGroupId: number,
        userRol: Role
      ) => {
        const textChannels = channelsOfCategory.filter(
          ({ type, name }) => type === 0 && name.includes("chat-grupo-")
        );
        const voiceChannels = channelsOfCategory.filter(
          ({ type, name }) => type === 2 && name.includes("call-grupo-")
        );

        const getGroupIdToChannelName = (groupName: string) => {
          const groupId = groupName.match(/\d+/g);
          return groupId ? parseInt(groupId[0]) : null;
        };

        const lastTextChannelCreated = textChannels.find(({ name }) => {
          const textChannelId = getGroupIdToChannelName(name);
          return textChannelId === lastCreatedGroupId;
        }) as BaseGuildTextChannel;

        const lastVoiceChannelCreated = voiceChannels.find(({ name }) => {
          const voiceChannelId = getGroupIdToChannelName(name);
          return voiceChannelId === lastCreatedGroupId;
        }) as BaseGuildVoiceChannel;

        lastTextChannelCreated?.permissionOverwrites.create(
          user.id,
          textChannelPermissions
        );

        lastVoiceChannelCreated?.permissionOverwrites.create(
          user.id,
          voiceChannelPermissions
        );

        await sendIntegromatMessage(
          lastTextChannelCreated.id,
          user.id,
          userRol
        );
        return;
      };

      const usersPerRoleCounter = async (rolId: string) => {
        let usersPerRolCount = 0;
        const usersPerRol = await guildServer.members.cache.filter(
          (member) =>
            member._roles.includes(rolId) &&
            member._roles.includes(InGroupRol.id)
        );
        usersPerRol.forEach(() => usersPerRolCount++);

        return { usersPerRolCount };
      };

      const sendIntegromatMessage = async (
        channelTextGroupId: string,
        userId: string,
        userRol: Role
      ) => {
        const integromatBot = guildServer.members.cache.find(
          (members) => members.user.id == process.env.INTEGROMAP_BOT_ID
        );
        const logsChannel = guildServer.channels.cache.get(
          process.env.CHANNEL_LOGS_NEW_MEMBER_ID
        ) as BaseGuildTextChannel;

        return await logsChannel.send({
          content: `${integromatBot},nuevo_integrante_de_grupo,${channelTextGroupId},${userId},${userRol.name}`,
        });
      };

      const lastGroupIdCreated = (
        channelsOfCategory: Collection<string, GuildBasedChannel>
      ) => {
        const textChannels = channelsOfCategory.filter(
          ({ type, name }) => type === 0 && name.includes("chat-grupo-")
        );

        const lastTextChannelCreated = textChannels.map(({ name }) => {
          const currentTextChannelId = name.match(/\d+/g) as RegExpMatchArray;
          return parseInt(currentTextChannelId[0]);
        });

        const lastChannelId = Math.max(...lastTextChannelCreated);
        return lastChannelId < 1 ? 0 : lastChannelId;
      };

      const crateOrAddToGroupHandle = async (
        userRol: Role,
        parentId: string,
        channelsOfCategory: Collection<string, GuildBasedChannel>
      ) => {
        const { usersPerRolCount } = await usersPerRoleCounter(userRol.id);
        const maxLimitOfGroup = 10;
        const lastGroupId = lastGroupIdCreated(channelsOfCategory);

        if (usersPerRolCount % maxLimitOfGroup === 0) {
          createGroup(parentId, lastGroupId, userRol)
            .then(() => {
              console.log("The group was created successfully");
            })
            .catch((err) => {
              console.log(`Error when creating a study group: ${err}`);
            });
        } else {
          addUserToGroup(channelsOfCategory, lastGroupId, userRol)
            .then(() => {
              console.log("Successfully added a user to a study group");
            })
            .catch((err) => {
              console.log(`Error when adding a user to a study group: ${err}`);
            });
        }
      };

      if (hasAmRol) {
        crateOrAddToGroupHandle(AmRol, AmCategory.id, AmChannelsOfCategory);
      } else if (hasPmRol) {
        crateOrAddToGroupHandle(PmRol, PmCategory.id, PmChannelsOfCategory);
      } else if (hasAmPmRol) {
        crateOrAddToGroupHandle(
          AmPmRol,
          AmPmCategory.id,
          AmPmChannelsOfCategory
        );
      } else {
        const AdminRol = guildServer.roles.cache.get(
          process.env.ROL_ADMIN_ID
        ) as Role;
        const logsChannel = guildServer.channels.cache.get(
          process.env.CHANNEL_LOGS_ONBOARDING_NOTICES_ID
        ) as BaseGuildTextChannel;

        await logsChannel.send({
          content: `¡Atención ${AdminRol}! ${userData} continuó con el onboarding sin seleccionar disponibilidad `,
        });
      }
    }
  },
};

export default event;
