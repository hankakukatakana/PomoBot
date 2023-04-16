const { Client, Intents, MessageEmbed } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./config/config.json', 'utf-8'));
const commands = JSON.parse(fs.readFileSync('./config/commands.json', 'utf-8'));
const cron = require('cron');

let sentMessage;
let worktimeMp3 = './voice/worktime.mp3';
let breaktimeMp3 = './voice/breaktime.mp3';

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


    const Gettime = () => {
        const JST = new Date().toLocaleString({ timeZone: 'Asia/Tokyo' });
        const realClock = new Date(JST);
        const thirtyMinutes = 30 * 60 * 1000;
        const worktime = 25 * 60 * 1000
        const quotient = Math.floor(realClock.getTime() / thirtyMinutes) + 1;

        const nextTime1 = new Date(quotient * thirtyMinutes);
        
        const nowTime = new Date(nextTime1.getTime() - thirtyMinutes);

        const endTime1 = new Date(nextTime1.getTime() + worktime);
        const nextTime2 = new Date(nextTime1.getTime() + thirtyMinutes);
        const endTime2 = new Date(nextTime2.getTime() + worktime);
        const nextTime3 = new Date(nextTime1.getTime() + thirtyMinutes * 2);
        const endTime3 = new Date(nextTime3.getTime() + worktime);
        return [nextTime1, nextTime2, nextTime3, endTime1, endTime2, endTime3, nowTime ];
    };

    
    const [nextTime1, nextTime2, nextTime3, endTime1, endTime2, endTime3 ] = Gettime();
    const embed = new MessageEmbed()
        .setColor(0x0099FF)
        .setTitle('Timer')
        .setDescription(`Power ON `)
        .setImage('https://i.imgur.com/AfFp7pu.png')
        .addFields(
            { name: '\u200B', value: '\u200B' },
            { name: '1ポモ目', value: `${nextTime1.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' })} ~ ${endTime1.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' })} `, inline: false },
            { name: '2ポモ目', value: `${nextTime2.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' })} ~ ${endTime2.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' })} `, inline: false },
            { name: '3ポモ目', value: `${nextTime3.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' })} ~ ${endTime3.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' })} `, inline: false }
        )
    sentMessage = await txChannel.send({ embeds: [embed] });

    console.log(`Logged in as ${client.user.tag}!`);

    const editEmbed = () => {
        const [nextTime1, nextTime2, nextTime3, endTime1, endTime2, endTime3 ] = Gettime();
        embed.fields[1].value = `${nextTime1.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' })} ~ ${endTime1.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' })} `;
        embed.fields[2].value = `${nextTime2.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' })} ~ ${endTime2.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' })} `;
        embed.fields[3].value = `${nextTime3.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' })} ~ ${endTime3.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' })} `;
        sentMessage.edit({ embeds: [embed] });
    };

    function Worktime() {
        const resource = createAudioResource(worktimeMp3)
        player.play(resource);
    }
    const Breaktime = () => {
        const resource = createAudioResource(breaktimeMp3)
        player.play(resource);
    };
    const Countdown = () => {
        console.log('   Countdown:', new Date().toLocaleTimeString());
    };

    const task1 = cron.job('0 */30 * * * *', () => {
        Worktime();/* 30で割れる分数の0秒になったとき */
        editEmbed();
        const [ nowTime ] = Gettime();
        embed.setDescription(`作業中です ${nowTime.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' })} まで`)
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
        case 'reset':
            worktimeMp3 = './voice/worktime.mp3';
            breaktimeMp3 = './voice/breaktime.mp3';
            interaction.reply('default mode');
            break;
        case 'hiroyuki':
            worktimeMp3 = './voice/worktime_hryk.mp3';
            breaktimeMp3 = './voice/breaktime_hryk.mp3';
            interaction.reply('change mode');
            break;
        default:
            interaction.reply('Invalid command');
    }
});

client.login(config.token);