const genshin = require('genshin-db');
const Discord = require('discord.js');

module.exports = {

  name:"genshinchar",
  description:"Returns Genshin Characters",

  async execute(message,args,client){

    const input = args.join(" ")

    const char = genshin.characters(input)
    console.log(char);


    try{


    const embed = new Discord.MessageEmbed()
      .setTitle(`**${char.name}**`)
      .setThumbnail(char.images.image)
      .setColor("RANDOM")
      .addFields(
        {name:"Titles:", value:char.titles,inline:false},
        {name:"Element:", value:char.element,inline:false},
        {name:"Weapon Type:", value:char.weapontype,inline:false},
        {name:"Gender:", value:char.gender,inline:false},
        {name:"Region:", value:char.region,inline:false},
        {name:"Rarity:", value:char.rarity,inline:false},
        {name:"Birthday:", value:char.birthday,inline:false},
        {name:"Constellation:", value:char.constellation,inline:false},
        {name:"Substat:", value:char.substat,inline:false},
        {name:"Affiliation:", value:char.affiliation,inline:false},
        {name:"Description:", value:char.description,inline:true},

      )

      .setTimestamp()
      .setFooter(message.author.tag, message.author.displayAvatarURL({dynamic:true}))




    return message.channel.send(embed)

    } catch(err){
      message.channel.send("Character not in database")
    }







  }
}
