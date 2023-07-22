# PomoBot

ポモドーロタイマーとして動くDiscordBotを作成しました。<br>
Nodeを立ち上げると、指定したVCchに入り、指定したTXchにて、
25分毎に作業の中断と、その5分後に作業開始を通知してくれます。

config/config.jsonの
<code>
    "token": "",<br>
    "vcchannelId": "",<br>
    "guildId": "",<br>
    "textchannelId": "",<br>
</code>
を埋めたら動きます。
