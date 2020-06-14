// Load in all packages and configuration files
const Discord = require("discord.js");
const Enmap = require("enmap");
const admin = require("firebase-admin");
const rblxFunctions = require("noblox.js");
const cron = require('node-cron');
const fs = require("fs");

var serviceAccount = require("./settings/serviceAccountKey.json");
const config = require("./settings/config.json");

// Setup so that you know if the bot is logged in. Mainly used to keep cookie validation running properly.
var loggedIn = false

// Set a variable for the bot (in this instance, client)
const client = new Discord.Client();

// Implement config to the client so the config is valid everywhere
client.config = config;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `${config.firebase_url}`
});

async function rblx_login(){
  await rblxFunctions.setCookie(config.rblx_cookie)
  loggedIn = true
  console.log("logged in");
}
rblx_login();


//var newCookie = rblxFunctions.refreshCookie(config.rblx_cookie)
//console.log(newCookie)

// Events to be loaded in (message, memebrAdd, etc)
fs.readdir("./events/", (err, files) => {
  files.forEach(file => {
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    client.on(eventName, event.bind(null, client));
  });
});

// All valid commands
client.commands = new Enmap();

// Commands to be loaded in (ping, verify, etc)
fs.readdir("./commands/", (err, files) => {
  files.forEach(file => {
    if (!file.endsWith(".js")) return;
    let props = require(`./commands/${file}`);
    let commandName = file.split(".")[0];
    client.commands.set(commandName, props);
    console.log(`Loaded command: ${commandName}`)
  });
});

// Client login
client.login(config.bot_token);

// Initiate Cookie Refresh checking
cron.schedule('* */1 * * *', () => {
  if (loggedIn == true) {
    rblxFunctions.refreshCookie().then(function(newCookie) {
      config.rblx_cookie = newCookie
      console.log("Cookie refreshed and validated.")
    })
  }
});