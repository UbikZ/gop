'use strict';

const restify = require('restify');
const builder = require('botbuilder');
const Pog = require('pokemon-go-node-api');
const inst = new Pog.Pokeio();

const conf = require('./conf');

let pogUsername = undefined;
let pogPassword = undefined;
let location = undefined;

const server = restify.createServer();
server.listen(process.env.PORT || 3000, () => {
  console.log('%s listening to %s', server.name, server.url);
});

const connector = new builder.ChatConnector({
  appId: conf.skype.client_id,
  appPassword: conf.skype.client_secret,
});

const bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

bot.on('conversationUpdate', (message) => {
  if (message.address.conversation.isGroup) {
    if (message.membersAdded) {
      message.membersAdded.forEach(function (identity) {
        if (identity.id === message.address.bot.id) {
          const reply = new builder.Message().address(message.address).text("Hello everyone!");
          bot.send(reply);
        }
      });
    }

    if (message.membersRemoved) {
      message.membersRemoved.forEach(function (identity) {
        if (identity.id === message.address.bot.id) {
          const reply = new builder.Message().address(message.address).text("Goodbye");
          bot.send(reply);
        }
      });
    }
  }
});

bot.on('contactRelationUpdate', function (message) {
  if (message.action === 'add') {
    const name = message.user ? message.user.name : null;
    const reply = new builder.Message()
      .address(message.address)
      .text("Hello %s... Thanks for adding me. Say 'hello' to see some great demos.", name || 'there');
    bot.send(reply);
  }
});

bot.use(builder.Middleware.dialogVersion({ version: 1.0, resetCommand: /^reset/i }));

bot.dialog('/', [
  (session) => {
    var card = new builder.HeroCard(session)
      .title("Pokemon Bot")
      .text("Enjoy the power of Skype Pokemon Bot binded on the Niantic API.")
      .images([
        builder.CardImage.create(session, "http://www.pokemongo.com/static/assets/images/pokemon_go_logo.png")
      ]);
    var msg = new builder.Message(session).attachments([card]);
    session.send(msg);
    session.send("Hi. I'm the Pokemon Bot for Skype.");
    session.beginDialog('/help');
  },
  (session, results) => {
    session.beginDialog('/menu');
  },
  (session, results) => {
    session.send("See you later!");
  }
]);

bot.dialog('/menu', [
  (session) => {
    builder.Prompts.choice(session, "What do you want to do ?", "set_conn|unset_conn|info_player|(quit)");
  },
  (session, results) => {
    if (results.response && results.response.entity != '(quit)') {
      session.beginDialog('/' + results.response.entity);
    } else {
      session.endDialog();
    }
  },
  (session, results) => {
    session.replaceDialog('/menu');
  }
]).reloadAction('reloadMenu', null, { matches: /^menu|show menu/i });

bot.dialog('/help', [
  (session) => {
    session.endDialog("> Help here.");
  },
]);

bot.dialog('/set_conn', [
  (session) => {
    session.endDialog("sed_conn launched")
  },
]);

bot.dialog('/unset_conn', [
  (session) => {
    session.endDialog("unsed_conn launched")
  },
]);

bot.dialog('/info_player', [
  (session) => {
    session.endDialog("info_player launched")
  },
]);

//inst.init(conf.pog.username, conf.pog.password, conf.pog.location, conf.pog.provider, function (err) {
//  if (err) throw err;
//
//  console.log('[i] Current location: ' + inst.playerInfo.locationName);
//  console.log('[i] lat/long/alt: : ' + inst.playerInfo.latitude + ' ' + inst.playerInfo.longitude + ' ' + inst.playerInfo.altitude);
//
//  inst.GetProfile(function (err, profile) {
//    if (err) throw err;
//
//    console.log('[i] Username: ' + profile.username);
//    console.log('[i] Poke Storage: ' + profile.poke_storage);
//    console.log('[i] Item Storage: ' + profile.item_storage);
//
//    var poke = 0;
//    if (profile.currency[0].amount) {
//      poke = profile.currency[0].amount;
//    }
//
//    console.log('[i] Pokecoin: ' + poke);
//    console.log('[i] Stardust: ' + profile.currency[1].amount);
//
//    setInterval(function () {
//      inst.Heartbeat(function (err, hb) {
//        if (err) {
//          console.log(err);
//        }
//
//        for (var i = hb.cells.length - 1; i >= 0; i--) {
//          if (hb.cells[i].NearbyPokemon[0]) {
//            //console.log(inst.pokemonlist[0])
//            var pokemon = inst.pokemonlist[parseInt(hb.cells[i].NearbyPokemon[0].PokedexNumber) - 1];
//            console.log('[+] There is a ' + pokemon.name + ' near.');
//          }
//        }
//
//        // Show MapPokemons (catchable) & catch
//        for (i = hb.cells.length - 1; i >= 0; i--) {
//          for (var j = hb.cells[i].MapPokemon.length - 1; j >= 0; j--) {   // use async lib with each or eachSeries should be better :)
//            var currentPokemon = hb.cells[i].MapPokemon[j];
//
//            (function (currentPokemon) {
//              var pokedexInfo = inst.pokemonlist[parseInt(currentPokemon.PokedexTypeId) - 1];
//              console.log('[+] There is a ' + pokedexInfo.name + ' near!');
//
//              inst.EncounterPokemon(currentPokemon, function (suc, dat) {
//                console.log('Encountering pokemon ' + pokedexInfo.name + '...');
//                console.log(suc, dat);
//                /*inst.CatchPokemon(currentPokemon, 1, 1.950, 1, 1, function(xsuc, xdat) {
//                 var status = ['Unexpected error', 'Successful catch', 'Catch Escape', 'Catch Flee', 'Missed Catch'];
//                 console.log(status[xdat.Status]);
//                 });*/
//              });
//            })(currentPokemon);
//          }
//        }
//      });
//    }, 5000);
//
//  });
//});