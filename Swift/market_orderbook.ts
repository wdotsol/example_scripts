import {
  DriftClient,
  OrderType,
  MarketType,
  PostOnlyParams,
  PositionDirection,
  Wallet,
  loadKeypair,
  BN,
  getMarketOrderParams,
  generateSignedMsgUuid,
} from '@drift-labs/sdk';
import axios from 'axios';
import { Connection } from '@solana/web3.js';
import * as dotenv from 'dotenv';
dotenv.config();

(async () => {
  try {
    const connection = new Connection("KEYHERE", "confirmed");
    const wallet = new Wallet(loadKeypair(process.env.PRIVATE_KEY!));

    const driftClient = new DriftClient({
      connection,
      wallet,
      env: "mainnet-beta",
      accountSubscription: { type: 'websocket' },
    });

    await driftClient.subscribe();
    console.log("Drift client subscribed!");

    const marketIndex = 0;
    const direction = PositionDirection.LONG;

    const { bestBid, bestAsk } = await getBidAsk();
    if (!bestBid || !bestAsk) throw new Error("Missing bid/ask data.");

    const makerOrderParams = getMarketOrderParams({
      marketIndex,
      marketType: MarketType.PERP,
      direction,
      baseAssetAmount: driftClient.convertToPerpPrecision(0.1), // 0.1 SOL
      auctionStartPrice: bestAsk,
      auctionEndPrice: bestBid,
      auctionDuration: 50,
    });

    const slot = await driftClient.connection.getSlot();
    const orderMessage = {
      signedMsgOrderParams: makerOrderParams,
      subAccountId: driftClient.activeSubAccountId,
      slot: new BN(slot),
      uuid: generateSignedMsgUuid(),
      stopLossOrderParams: null,
      takeProfitOrderParams: null,
    };

    const { orderParams: message, signature } = driftClient.signSignedMsgOrderParamsMessage(orderMessage);

    await axios.post('https://swift.drift.trade/orders', {
      market_index: marketIndex,
      market_type: 'perp',
      message: message.toString(),
      signature: signature.toString('base64'),
      taker_pubkey: driftClient.wallet.publicKey.toBase58(),
    });

    console.log("Order submitted via Swift.");
  } catch (error) {
    console.error("Error in execution:", error);
    process.exit(1);
  }
})();

async function getBidAsk() {
  const { data } = await axios.get('https://dlob.drift.trade/l2?marketName=SOL-PERP&depth=10');
  return {
    bestBid: data.bids.find((b: any) => b.source !== 'vamm')?.price ?? null,
    bestAsk: data.asks.find((a: any) => a.source !== 'vamm')?.price ?? null,
  };
}
