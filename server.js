'use strict';

const crypto = require('crypto');
const rq = require('request-promise');
const bpromise = require('bluebird');
const Pog = require('pokemon-go-node-api');
const inst = new Pog.Pokeio();

const conf = require('./conf');

let token = {
  type: undefined,
  value: undefined,
  expirationTime: undefined,
};

const pokemonCache = {};

inst.init(conf.pog.username, conf.pog.password, conf.pog.location, conf.pog.provider, function (err) {
  const loc = conf.pog.location;
  const prefix = `[pokebot:~(${loc.coords.latitude}, ${loc.coords.longitude})] ±`;

  if (err) {
    console.log(err);
    throw err;
  }

  inst.GetProfile(function (err, profile) {
    if (err) {
      console.log(err);
      throw err;
    }

    console.log('[i] Username: ' + profile.username);
    console.log('[i] Poke Storage: ' + profile.poke_storage);
    console.log('[i] Item Storage: ' + profile.item_storage);

    setInterval(function () {
      inst.Heartbeat(function (err, hb) {
        if (err) {
          console.log(err);
          throw err;
        }

        if (hb && Array.isArray(hb.cells)) {
          for (var i = hb.cells.length - 1; i >= 0; i--) {
            if (hb.cells[i].NearbyPokemon[0]) {
              var pokemon = inst.pokemonlist[parseInt(hb.cells[i].NearbyPokemon[0].PokedexNumber) - 1];
              console.log('[+] There is a ' + pokemon.name + ' near.');
            }
          }

          for (i = hb.cells.length - 1; i >= 0; i--) {
            for (var j = hb.cells[i].MapPokemon.length - 1; j >= 0; j--) {
              var currentPokemon = hb.cells[i].MapPokemon[j];

              (function (currentPokemon) {
                var pokedexInfo = inst.pokemonlist[parseInt(currentPokemon.PokedexTypeId) - 1];

                inst.EncounterPokemon(currentPokemon, function (suc, dat) {
                  if (dat) {
                    const expTimestamp = new Date().getTime() + dat['WildPokemon'].TimeTillHiddenMs;
                    const date = new Date(expTimestamp + (2 * 3600 * 1000));
                    const formatDateExpiration = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
                    const encounterHash = crypto
                      .createHash('sha1')
                      .update(JSON.stringify(dat['WildPokemon'].EncounterId))
                      .digest('hex');
                    if (existsInCache(encounterHash, expTimestamp)) {
                      sendMessage(`${prefix} Pokemon '${pokedexInfo.name}' appears (hidden at ${formatDateExpiration})`);
                    }
                  } else {
                    console.log('Error : ', dat);
                  }
                });
              })(currentPokemon);
            }
          }
        }
      });
    }, 5000);
  });
});

function existsInCache(encounterHash, expirationDate) {
  const currentTime = new Date().getTime() / 1000 | 0;
  console.log('Cache : ', pokemonCache);
  if (pokemonCache.hasOwnProperty(encounterHash)) {
    const encouterExpDate = pokemonCache[encounterHash];
    if (encouterExpDate < currentTime) {
      delete pokemonCache[encounterHash];
      return true;
    }
    return false;
  } else {
    pokemonCache[encounterHash] = expirationDate;
    return true;
  }
}

function sendMessage(message) {
  authenticate()
    .then((token) => {
      rq({
        method: 'POST',
        uri: conf.skype.confUri,
        body: {
          message: {
            content: message,
          }
        },
        headers: {
          'Authorization': `${token.type} ${token.value}`,
        },
        json: true,
      })
    })
    .catch((error) => {
      console.error(error);
    });
}

function authenticate() {
  const currentTime = new Date().getTime() / 1000 | 0;
  if (!token.value || token.expirationTime < currentTime) {
    return rq({
      method: 'POST',
      uri: conf.skype.authUri,
      form: {
        grant_type: conf.skype.grantType,
        client_id: conf.skype.clientId,
        client_secret: conf.skype.clientSecret,
        scope: conf.skype.scope,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    }).then((body) => {
      const data = JSON.parse(body);
      token.type = data['token_type'];
      token.expirationTime = currentTime + data['expires_in'];
      token.value = data['access_token'];
      console.log('> Request new token !');
      return new bpromise((resolve) => {
        resolve(token);
      })
    })
  } else {
    return new bpromise((resolve) => {
      console.log('> Use existing token !');
      resolve(token);
    })
  }
}