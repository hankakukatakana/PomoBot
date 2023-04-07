const { Client, Intents, MessageEmbed } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./config/config.json', 'utf-8'));
const commands = JSON.parse(fs.readFileSync('./config/commands.json', 'utf-8'));
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
        const endTime1 = new Date(nextTime1.getTime() + 25 * 60 * 1000);
        const nextTime2 = new Date(nextTime1.getTime() + thirtyMinutes);
        const endTime2 = new Date(nextTime2.getTime() + 25 * 60 * 1000);
        const nextTime3 = new Date(nextTime1.getTime() + thirtyMinutes * 2);
        const endTime3 = new Date(nextTime3.getTime() + 25 * 60 * 1000);
        return [nextTime1, nextTime2, nextTime3, endTime1, endTime2, endTime3 ];
    };

    const worktime = 25 * 60 * 1000
    const [nextTime1, nextTime2, nextTime3, endTime1, endTime2, endTime3 ] = Gettime();
    const embed = new MessageEmbed()
        .setColor(0x0099FF)
        .setTitle('Timer')
        .setDescription('Power ON')
        .setImage('https://i.imgur.com/AfFp7pu.png')
        .addFields(
            { name: '1ポモ目', value: `${nextTime1.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' })} ~ ${endTime1.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' })} `, inline: false },
            { name: '2ポモ目', value: `${nextTime2.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' })} ~ ${endTime2.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' })} `, inline: false },
            { name: '3ポモ目', value: `${nextTime3.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' })} ~ ${endTime3.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' })} `, inline: false }
        )
    sentMessage = await txChannel.send({ embeds: [embed] });
    const editEmbed = () => {
        const [nextTime1, nextTime2, nextTime3 ] = Gettime();
        embed.fields[0].value = `${nextTime1.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' })} ~ ${endTime1.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' })} `;
        embed.fields[1].value = `${nextTime2.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' })} ~ ${endTime2.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' })} `;
        embed.fields[2].value = `${nextTime3.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' })} ~ ${endTime3.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' })} `;
        sentMessage.edit({ embeds: [embed] });
    };

    function Worktime() {
        console.log(' Worktime', new Date().toLocaleTimeString());
        const resource = createAudioResource('./voice/worktime.mp3')
        player.play(resource);
    }
    const Breaktime = () => {
        console.log(' Breaktime', new Date().toLocaleTimeString());
        const resource = createAudioResource('./voice/breaktime.mp3')
        player.play(resource);
    };
    const Countdown = () => {
        console.log('   Countdown:', new Date().toLocaleTimeString());
    };

    const task1 = cron.job('0 */30 * * * *', () => {
        Worktime();/* 30で割れる分数の0秒になったとき */
        editEmbed();
        embed.setDescription('作業中です')
        embed.setImage('https://2023040321066857f3c8.conohawing.com/image/bot/worktime.png')
        sentMessage.edit({ embeds: [embed] });
    });
    task1.start();

    const task2 = cron.job('0 25,55 * * * *', () => {
        Breaktime();/* 25分0秒と55分0秒になったとき */
        embed.setDescription('休憩中です')
        embed.setImage('https://2023040321066857f3c8.conohawing.com/image/bot/breaktime.png')
        sentMessage.edit({ embeds: [embed] });
    });
    task2.start();
    
    const task3 = cron.job('55-59 24,54,29,59 * * * *', () => {
        Countdown();/* 25分30分55分00分の5秒前になったとき */
    });
    /* 
    task3.start();
    */
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