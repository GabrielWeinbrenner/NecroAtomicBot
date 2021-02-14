const Discord = require('discord.js')
module.exports = {
  name:'loop',
  description: 'loop music',

  async execute(message, args, client){

    if(!message.member.voice.channel){
      return message.channel.send('Must be in a vc to use this command')
    }



    if(0 <= Number(args[0]) && Number(args[0]) <= 2){
                client.distube.setRepeatMode(message,parseInt(args[0]))
                embedbuilder(client, message, "GREEN", "Repeat mode set")
            }
            else{
                embedbuilder(client, message, "RED", "ERROR", `Please use a number between **0** and **2**   |   *(0: disabled, 1: Repeat a song, 2: Repeat all the queue)*`)
            }
  }
}

function embedbuilder(client, message, color, title, description){
    let embed = new Discord.MessageEmbed()
    .setColor(color)
    .setFooter(client.user.username, client.user.displayAvatarURL());
    if(title){
      embed.setTitle(title);
    }
    if(description){
      embed.setDescription(description);
    }
    return message.channel.send(embed);
}