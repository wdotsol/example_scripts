import { Connection, Keypair } from "@solana/web3.js";
import axios from 'axios';
import {
	DriftClient,
	BN,
	Wallet,
    getMarketOrderParams,
    MarketType,
    PositionDirection,
    isVariant,
    generateSignedMsgUuid,
    OrderParams,
    buildDepositAndPlaceSignedMsgOrderRequest,
} from "@drift-labs/sdk";

const rpcUrl = process.env.RPC_URL;
if (!rpcUrl) {
	throw new Error("RPC_URL environment variable is not set");
}
const connection = new Connection(rpcUrl);

// Init driftClient with dummy wallet, default subscription is ws
const driftClient = new DriftClient({
	connection,
	wallet: new Wallet(Keypair.generate()),
    env: 'mainnet-beta',
});

const marketIndex = 0 // market index 0 for USDC
const amount = driftClient.convertToSpotPrecision(marketIndex, 100); // $100
const associatedTokenAccount = await driftClient.getAssociatedTokenAccount(marketIndex); // market index 0 for USDC

const depositTx = await driftClient.createDepositTxn(
    amount,
    marketIndex,
    associatedTokenAccount,
    undefined,   // subAccountId? - Optional
    false,       // reduceOnly
    undefined,   // txParams? - Optional
    true         // initSwiftAccount, Use this if you want to initialize a Swift account
  );

// Set up the Swift order
const marketIndexSwift = 0; // 0 = SOL-PERP market

const oracleInfo = driftClient.getOracleDataForPerpMarket(marketIndexSwift);
const highPrice = oracleInfo.price.muln(101).divn(100);
const lowPrice = oracleInfo.price;
const direction = PositionDirection.LONG;

const orderParams = getMarketOrderParams({
    marketIndex: marketIndexSwift,
    marketType: MarketType.PERP,
    direction,
    baseAssetAmount: driftClient.convertToPerpPrecision(0.1), // 0.1 SOL,
    auctionStartPrice: isVariant(direction, 'long') ? lowPrice : highPrice,
        auctionEndPrice: isVariant(direction, 'long') ? highPrice : lowPrice,
        auctionDuration: 50,
});

const slot = await driftClient.connection.getSlot();

const orderMessage = {
    signedMsgOrderParams: orderParams as OrderParams,
    subAccountId: driftClient.activeSubAccountId,
    slot: new BN(slot),
    uuid: generateSignedMsgUuid(),
    stopLossOrderParams: null,
    takeProfitOrderParams: null,
};

// Sign the message
const { orderParams: message, signature } = driftClient.signSignedMsgOrderParamsMessage(orderMessage);

// Build the request
const request = driftClient.buildDepositAndPlaceSignedMsgOrderRequest(depositTx, message);

// Send to Swift service
const result = await axios.post('https://master.swift.drift.trade/depositTrade', request);

console.log("Order response:", result.data);