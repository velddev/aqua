const Discord = require("discord.js");
const fs = require("fs");

const client = new Discord.Client();
let config = {
    prefix : ">",
    token : "",
}

if(fs.existsSync("./config.json"))
{
    config = JSON.parse(fs.readFileSync("./config.json"));
}
else
{
    console.log("config file created!");    
    fs.writeFileSync("./config.json", JSON.stringify(config, null, '\t'));
}

var commandPool = {};

function trimStart(character, string) {
    var startIndex = 0;

    while (string[startIndex] === character) {
        startIndex++;
    }

    return string.substr(startIndex);
}

function getErrorEmbed(message)
{
    return {
        "embed":{
            "title":"🚫 Uh oh.",
            "description":message,
            "color":16711680
        }
    }
}

function getOKEmbed(message)
{
    return {
        "embed":{
            "title":"🆗 Got ya.",
            "description":message,
            "color":6857471
        }
    }
}

commandPool["iam"] = {
    process : (msg, arguments) => { 
        let role = msg.guild.roles.find(r => r.name.toLowerCase() == arguments.toLowerCase());
        if(role == null)
        {
            msg.channel.send(getErrorEmbed("I couldn't find this role."));
            return;
        }

        if(msg.member.roles.has(role.id)) {
             msg.member.removeRole(role).catch(console.error);            
             msg.channel.send(getOKEmbed("removed `" + role.name + "` from " + msg.author.name));                         
        } 
        else {
            msg.member.addRole(role).catch(console.error);  
            msg.channel.send(getOKEmbed("added `" + role.name + "` to " + msg.author.name));                         
        }
    }
};

commandPool["game"] = {
    process : (msg, arguments) => {
        if(msg.member.highestRole.position >= msg.guild.me.highestRole.position)
        {
            msg.channel.send(getErrorEmbed("sorry, but you have more permissions than I do, I can not change your nickname."));
            return;
        }

        let newName = msg.member.username;
        if(msg.member.nickname != null)
        {
            let nicknameSplit = msg.member.nickname.split('[');
            newName = nicknameSplit[0];
        }

        if(newName.length + arguments.length + 2 > 32)
        {
            msg.channel.send(getErrorEmbed("sorry, but discord doesn't allow names longer than 32 characters."));
            return;
        }      

        msg.member.setNickname(newName + "[" + arguments + "]");
        msg.channel.send(getOKEmbed("set your game to `" + arguments + "`"));
    }
};

commandPool["search"] = {
    process : (msg, arguments) => {

        if(arguments.length <= 2)
        {
            msg.channel.send(getErrorEmbed("please search for more than 2 letters at a time."));
            return;
        }
        

        var x = msg.guild.roles.array();
        x.sort(function(a, b) {
            var nameA = a.name.toUpperCase(); // ignore upper and lowercase
            var nameB = b.name.toUpperCase(); // ignore upper and lowercase
            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }
        });
        
        var output = "";

        for(let i = 0; i < x.length; i++) {
            if(x[i].name.toLowerCase().includes(arguments))
            {
                output += "`" + x[i].name + "`\n";
            }
        }

        msg.channel.send(getOKEmbed(output));
    }
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});



client.on('message', msg => {
    if(msg.content.startsWith(config.prefix))
    {
        let command = msg.content.substring(prefix.length).split(' ')[0];
         
        try
        {
            if (command in commandPool)
            {
                commandPool[command].process(msg, trimStart(' ', msg.content.substring(command.length + prefix.length)))
            }
        }
        catch(e)
        {
            msg.channel.send(getErrorEmbed(e.message));
        }
    }
});

client.login(config.token);