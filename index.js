const Discord = require('discord.js');
const axios = require('axios');
const Twitter = require('twitter');
require('dotenv').config();
const client = new Discord.Client()

const tweeter = new Twitter({
  consumer_key: process.env.TWITTER_API_KEY,
  consumer_secret: process.env.TWITTER_API_KEY_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
})

client.login(process.env.TOKEN)

client.on('ready', () => {
  console.log(`Bot Open Sea has started.`)
  let getFloorPrice = async () => {
    let res = await axios.get('https://api.opensea.io/api/v1/collection/exclusible-gold-alpha/stats');
    console.log(res.data.stats.floor_price);
    client.user.setActivity(res.data.stats.floor_price + ' Ξ ', { type: 'WATCHING' })
  }
  getFloorPrice(),
    setInterval(() => getFloorPrice(), 600000)
  var hash = '0x'
  let getLastSell = async () => {
    let res = await axios.get('https://api.etherscan.io/api?module=account&action=tokennfttx&contractaddress=0xb4f0e074c31fc2b5d45ff212ca30025c3c047f48&page=1&offset=5&sort=desc&apikey=YourApiKeyToken');
    // let res = await axios.get('https://api.etherscan.io/api?module=account&action=tokennfttx&contractaddress=0x75e95ba5997eb235f40ecf8347cdb11f18ff640b&page=1&offset=5&sort=desc&apikey=YourApiKeyToken');
    // console.log(res);
    var tokenID = res.data.result[0].tokenID
    var txhash = res.data.result[0].hash
    console.log('-----');
    console.log('hash precedent : ' + hash);
    console.log('hash API : ' + txhash);
    console.log(new Date().toLocaleTimeString());
    if (hash != txhash && txhash != undefined && hash != undefined) {
      hash = txhash
      let value = await axios.get(`https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${hash}&apikey=7K53RKUCHWAZIF3366FF5DCC831RK29AAM`);
      // console.log(value);
      let data = value.data.result.value
      if (data != undefined) {
        price = parseInt(data, 16)
        price = price / 1000000000000000000
        console.log('hash post : ' + hash);
        console.log('price : ' + price);
        console.log('tokenID : ' + tokenID);
        let metadata = await axios.get(`https://metadata.exclusible.com/gold//${tokenID}`);
        // let metadata = await axios.get(`https://ipfs.io/ipfs/QmdRAvWJa2Ck3pQPVni1DhYHc1zZNvJnZWAacS3vfWuDYA/${tokenID}`);
        // console.log(metadata.data);
        const imgURL = metadata.data.image.substring(6)
        // console.log(imgURL);
        const img = `https://ipfs.io/ipfs/${imgURL}`
        // console.log(img);
        console.log('-----');
        console.log('');
        if (price != 0 && price > 0.01) {
          try {
            const embed = {
              title: '**Sold**',
              description: `Token **[${tokenID}](https://opensea.io/assets/0xb4f0e074c31fc2b5d45ff212ca30025c3c047f48/${tokenID})** has been sold for **${price} Ξ**`,
              color: 0xc6ff00,
              thumbnail: {
                url: 'https://media-exp1.licdn.com/dms/image/C560BAQGLdSGRVd95xQ/company-logo_200_200/0/1633551417209?e=2159024400&v=beta&t=Bpyg75nk1Ys94j5aqh4rcFMu4kTaytf6fa-2kSlKLcw',
              },
              image: {
                url: img,
              },
              timestamp: new Date(),
            }
            channel.fetchMessages({ limit: 2 })
              .then(messageMappings => {
                let messages = Array.from(messageMappings.values());
                let previousMessage = messages[0];
                if (previousMessage.embeds[0].description != embed.description) {
                  channel.send({ embed })
                  tweeter.post('statuses/update', {
                    status: `Token ${tokenID} has been sold for ${price} Ξ\n https://opensea.io/assets/0xb4f0e074c31fc2b5d45ff212ca30025c3c047f48/${tokenID}`,
                  })
                    .then(result => {
                      console.log('You successfully tweeted this : "' + result.text + '"')
                    })
                    .catch(console.error)
                }
              })
              .catch(error => console.log(error))
          } catch (err) {
            console.log(err);
          }
        }
        return hash
      }
    }
  }
  getLastSell(),
    setInterval(() => getLastSell(), 15000)
})
