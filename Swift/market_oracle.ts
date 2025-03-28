import { 
    DriftClient, 
    OrderType, 
    MarketType, 
    PostOnlyParams, 
    PositionDirection, 
    Wallet, 
    loadKeypair, 
    BN, 
    BulkAccountLoader, 
    User,
    getMarketOrderParams,
    isVariant,
    digestSignature,
    generateSignedMsgUuid,
    OrderParams
} from '@drift-labs/sdk';
import * as axios from 'axios';
import { Connection, PublicKey } from '@solana/web3.js';
import * as dotenv from 'dotenv';
dotenv.config();

(async () => {
    try {
      // SET UP, INPUT YOUR API KEY
      const connection = new Connection("key", "confirmed");
      const { Wallet, loadKeypair } = await import('@drift-labs/sdk');
      const wallet = new Wallet(loadKeypair(process.env.PRIVATE_KEY!));

      // Init the Drift client 
      const driftClient = new DriftClient({
        connection,
        wallet,
        env: "mainnet-beta", // 
        accountSubscription: {
          type: 'websocket',
        },
      });
      await driftClient.subscribe();
      console.log("Drift client subscribed!");
  
      const marketIndex = 0;
      const direction = PositionDirection.LONG

      const oracleInfo = driftClient.getOracleDataForPerpMarket(marketIndex);
      const highPrice = oracleInfo.price.muln(101).divn(100);
      const lowPrice = oracleInfo.price;

      const makerOrderParams = getMarketOrderParams({
        marketIndex: marketIndex,
        marketType: MarketType.PERP,
        direction: direction,
        baseAssetAmount: driftClient.convertToPerpPrecision(0.1), // 0.1 SOL,
        auctionStartPrice: isVariant(direction, 'long') ? lowPrice : highPrice,
		    auctionEndPrice: isVariant(direction, 'long') ? highPrice : lowPrice,
		    auctionDuration: 50,
    });

    //Sign order
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

    //Submit to API
    const swiftUrl = 'https://swift.drift.trade/orders';

    await axios.default.post(swiftUrl, {
	market_index: marketIndex,
	market_type: 'perp',
	message: message.toString(),
	signature: signature.toString('base64'),
	taker_pubkey: driftClient.wallet.publicKey.toBase58(),
    });

} catch (error) {
      console.error("Error in bot execution:", error);
      process.exit(1);
    }
})();