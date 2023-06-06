const ccxt = require('ccxt');
const moment = require('moment');
const delay = require('delay');

const binance = new ccxt.binance({
  apiKey: process.env.API_KEY,
  secret: "0kwDPU7WgJ86UZifS34eDnCpuyoVvknTilRg8SUeqNaX3BEw3WiZmMJGh46i2Nll",
});

binance.setSandboxMode(true)

async function printBalance(btcPrice) {
  const balance = await binance.fetchBalance();
  const total = balance.total
  console.log(`Balance: BTC ${total.BTC}, USDT: ${total.USDT}`);
  console.log(`Total USDT: ${(total.BTC - 1) * btcPrice + total.USDT}. \n `);
}

async function tick() {
//   const binance = new ccxt.binance();

  const prices = await binance.fetchOHLCV('BTC/USDT', '1m', undefined, 5);
  const bPrices = prices.map(price => {
    return {
      timestamp: moment(price[0]).format(),
      open: price[1],
      hight: price[2],
      low: price[3],
      close: price[4],
      volume: price[5],
    }
  })

  const averagePrice = bPrices.reduce((acc, price) => acc + price.close, 0) / 5
  const lastPrice = bPrices[bPrices.length - 1].close

  console.log(
    bPrices.map(p => p.close),
    averagePrice,
    lastPrice);

  // Thuat toan du dinh ban day
  
  // if (lastPrice > averagePrice) {
  //   let direction = 'sell'
  // } else {
  //   let direction = 'buy'
  // }
  const direction = lastPrice > averagePrice ? 'sell' : 'buy';

  const TRADE_SIZE = 100
  const quantity = TRADE_SIZE / lastPrice

  console.log(`Average price: ${averagePrice}. Last price: ${lastPrice}`)
  const order = await binance.createMarketOrder(
    'BTC/USDT',
    direction,
    quantity
  )

  console.log(`${moment().format()}: ${direction} ${quantity} BTC at ${lastPrice}`)

  printBalance(lastPrice)
}

async function main() {
  while (true) {
    await tick();
    await delay(60 * 1000);
  }
}
main()

