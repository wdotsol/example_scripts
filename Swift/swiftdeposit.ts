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

//1. Init driftClient with dummy wallet, default subscription is ws
const driftClient = new DriftClient({
	connection,
	wallet: new Wallet(Keypair.generate()),
    env: 'mainnet-beta',
});

//2. Set up the Swift order
const marketIndex = 0; // 0 = SOL-PERP market

const oracleInfo = driftClient.getOracleDataForPerpMarket(marketIndex);
const highPrice = oracleInfo.price.muln(101).divn(100);
const lowPrice = oracleInfo.price;
const direction = PositionDirection.LONG;

const orderParams = getMarketOrderParams({
    marketIndex: marketIndex,
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

// Sign the orderParams message
const { orderParams: message, signature } = driftClient.signSignedMsgOrderParamsMessage(orderMessage);

// 3. Build the deposit tx
const takerATA = await driftClient.getAssociatedTokenAccount(marketIndex); // market index 0 for USDC

const depositTx = drift.buildSwiftDepositTx(
  message,
  {
		taker: await drift.getUserAccountPublicKey(subAccountId), // subAccountId 0
		takerStats: drift.getUserStatsAccountPublicKey(),
		takerUserAccount: drift.getUserAccount(subAccountId),
		signingAuthority: drift.wallet.publicKey,
	},
	new BN(1_000_000), // deposit amount
	0, // spot market for deposit (USDC)
	marketIndex, // perp market for trade (SOL perp)
	subAccountId, // subAccountId,
	takerATA,
	false, // initSwiftAccount, use this if you want to initialize a Swift account
);

// Build the request
const request = driftClient.buildDepositAndPlaceSignedMsgOrderRequest(depositTx, message);

// Send to Swift service
const result = await axios.post('https://master.swift.drift.trade/depositTrade', request);

console.log("Order response:", result.data);
