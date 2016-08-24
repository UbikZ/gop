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

bot.dialog('/', function (session) {
  session.send("Hello World");
});

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