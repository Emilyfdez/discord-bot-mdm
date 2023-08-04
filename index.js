const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv/config');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const channelIDToMonitor = '939686024286720010'; // ID del canal videos
const videoLinkRegex = /https:\/\/(?:www\.youtube\.com\/watch\?v=|youtu\.be\/)[A-Za-z0-9_-]{11}/i;

const sentLinks = {}; // Objeto para almacenar los enlaces de youtube que mandamos

client.on('ready', () => {
    console.log('Bot ready');
});

client.on('messageCreate', async (message) => {
    // Si es un enlace de youtube en el canal videos se ejecutan las acciones
    if (message.channel.id === channelIDToMonitor && videoLinkRegex.test(message.content)) {
        const link = message.content.match(videoLinkRegex)[0];
        
        // Si el mensaje contiene un link que ya se envio previamente no se aprueba y se ejecutan otras acciones
        if (sentLinks[link]) {
            try {
                // Reacciona al mensaje con el emoji :x: cuando el video está repetido
                await message.react('❌');
                // Envía un mensaje indicando que el video está repetido
                const repeatedMessage = await message.channel.send('Este video ya ha sido enviado previamente y está repetido. El mensaje será eliminado en 10 segundos.');
                
                // Elimina el mensaje repetido después de 10 segundos
                setTimeout(async () => {
                    await message.delete();
                    await repeatedMessage.delete();
                }, 10000); // 10000 milisegundos = 10 segundos
            } catch (error) {
                console.error('Error al reaccionar, enviar el mensaje de repetición o eliminar el mensaje:', error);
            }
        } else {
            try {
                // Reacciona con el tick verde si el video no estaba repetido
                await message.react('✅');
                // Se almacena en link en el objeto
                sentLinks[link] = true;
                // Se manda el mensaje de aprobación
                await message.channel.send('Este video ha sido aprobado por el Ministerio de Magia.');
            } catch (error) {
                console.error('Error al reaccionar o enviar el mensaje:', error);
            }
        }
    }
});

client.login(process.env.TOKEN);