const { join } = require('node:path');
const { Client, Intents, MessageEmbed } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./test_config.json', 'utf-8'));
const commands = JSON.parse(fs.readFileSync('./commands.json', 'utf-8'));
const cron = require('cron');

let sentMessage;

client.once("ready", async () => { 
    const txChannel = client.channels.cache.get(config.textchannelId);
    const vcchannel = client.channels.cache.get(config.vcchannelId);

    const connection = joinVoiceChannel({
        channelId: config.vcchannelId,
        guildId: config.guildId,
        adapterCreator: vcchannel.guild.voiceAdapterCreator,
    });
    
    const player = createAudioPlayer();
    connection.subscribe(player);
    
    client.application.commands.set(commands.commands);

    console.log(`Logged in as ${client.user.tag}!`);

    const Gettime = () => {
        const JST = new Date().toLocaleString({ timeZone: 'Asia/Tokyo' });
        const realClock = new Date(JST);
        const thirtyMinutes = 30 * 60 * 1000;
        const quotient = Math.floor(realClock.getTime() / thirtyMinutes) + 1;
        const nextTime1 = new Date(quotient * thirtyMinutes);
        const nextTime2 = new Date(nextTime1.getTime() + thirtyMinutes);
        const nextTime3 = new Date(nextTime1.getTime() + thirtyMinutes * 2);
        const nextTime4 = new Date(nextTime1.getTime() + thirtyMinutes * 3);
        return [nextTime1, nextTime2, nextTime3, nextTime4];
    };
    
    const [nextTime1, nextTime2, nextTime3, nextTime4] = Gettime();
    const embed = new MessageEmbed()
        .setColor(0x0099FF)
        .setTitle('Timer')
        .setDescription('Power ON')
        .setImage('https://i.imgur.com/AfFp7pu.png')
        .addFields(
            { name: '-Next-', value: `${nextTime1.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' })} `, inline: false },
            { name: '\u200B', value: '\u200B', inline: false },
            { name: 'schedule-1', value: nextTime2.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' }), inline: true },
            { name: 'schedule-2', value: nextTime3.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' }), inline: true },
            { name: 'schedule-3', value: nextTime4.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' }), inline: true }
        )
    sentMessage = await txChannel.send({ embeds: [embed] });
    const editEmbed = () => {
        const [nextTime1, nextTime2, nextTime3, nextTime4] = Gettime();
        embed.fields[0].value = `${nextTime1.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' })} countdown: ---`;
        embed.fields[2].value = nextTime2.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' });
        embed.fields[3].value = nextTime3.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' });
        embed.fields[4].value = nextTime4.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' });
        sentMessage.edit({ embeds: [embed] });
    };

    function Worktime() {
        console.log(' Worktime', new Date().toLocaleTimeString());
        const resource = createAudioResource(join(__dirname, './voice/worktime.mp3'), {
            inputType: StreamType.Arbitrary,
        });
        player.play(resource);
    }
    const Breaktime = () => {
        console.log(' Breaktime', new Date().toLocaleTimeString());
        const resource = createAudioResource(join(__dirname, './voice/breaktime.mp3'), {
            inputType: StreamType.Arbitrary,
        });
        player.play(resource);
    };
    const Countdown = () => {
        console.log('   Countdown:', new Date().toLocaleTimeString());
    };

    const task1 = cron.job('0 */30 * * * *', () => {
        Worktime();/* 30で割れる分数の0秒になったとき */
        editEmbed();
        embed.setDescription('作業中です')
        embed.setImage('https://pbs.twimg.com/media/FsS-cS4akAAed1X?format=jpg&name=4096x4096')
        sentMessage.edit({ embeds: [embed] });
    });
    task1.start();

    const task2 = cron.job('0 25,55 * * * *', () => {
        Breaktime();/* 25分0秒と55分0秒になったとき */
        embed.setDescription('休憩中です')
        embed.setImage('https://pbs.twimg.com/media/FsS-cS9akAAf46u?format=jpg&name=4096x4096')
        sentMessage.edit({ embeds: [embed] });
    });
    task2.start();

    const task3 = cron.job('55-59 24,54,29,59 * * * *', () => {
        Countdown();/* 25分30分55分00分の5秒前になったとき */
    });
    task3.start();
});

client.on('interactionCreate', async interaction => {
    
    switch (interaction.commandName) {
        case 'time':
            /* sentMessage = await interaction.reply({ embeds: [createEmbed()] }); */
            interaction.reply('Invalid command');
            break;
        case 'reset':
            interaction.reply('Invalid command');
            break;
        default:
            interaction.reply('Invalid command');
    }
});

client.login(config.token);