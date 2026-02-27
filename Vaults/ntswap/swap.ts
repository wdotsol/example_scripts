// NT vault dSOL → SOL swap script
// No PRIVATE_KEY = scan mode (logs quotes + slippage, no swaps).
//
// Usage: npm start

import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import dotenv from 'dotenv';
import { BN } from '@coral-xyz/anchor';
import { DRIFT_PROGRAM_ID, Wallet, UnifiedSwapClient, WRAPPED_SOL_MINT, MainnetSpotMarkets, DriftClient } from '@drift-labs/sdk';

dotenv.config();

const RPC_ENDPOINT    = process.env.RPC_ENDPOINT!;
const VAULT_AUTHORITY = process.env.VAULT_AUTHORITY!;
const PRIVATE_KEY     = process.env.PRIVATE_KEY;      // omit for scan mode
const JUPITER_API_KEY = process.env.JUPITER_API_KEY!;
const JUPITER_URL     = process.env.JUPITER_URL;

const MAX_SLIPPAGE_BPS = Number(process.env.MAX_SLIPPAGE_BPS ?? '20');
const CHUNK_SIZE_DSOL  = Number(process.env.CHUNK_SIZE_DSOL  ?? '500');
const SLEEP_MS         = Number(process.env.SLEEP_MS         ?? '10000');

if (!RPC_ENDPOINT || !VAULT_AUTHORITY) throw new Error('RPC_ENDPOINT and VAULT_AUTHORITY required');
if (!JUPITER_API_KEY) throw new Error('JUPITER_API_KEY required');

const SOL_MARKET_INDEX  = 1;
const DSOL_MARKET_INDEX = 17;

async function main() {
	const scanMode = !PRIVATE_KEY;
	const keypair  = PRIVATE_KEY
		? Keypair.fromSecretKey(Uint8Array.from(JSON.parse(PRIVATE_KEY)))
		: Keypair.generate();

	console.log(scanMode ? '[scan]' : '[live]', `authority=${VAULT_AUTHORITY} chunk=${CHUNK_SIZE_DSOL} maxSlippage=${MAX_SLIPPAGE_BPS}bps`);

	const connection = new Connection(RPC_ENDPOINT, 'processed');

	const oracleInfos = [SOL_MARKET_INDEX, DSOL_MARKET_INDEX].map((idx) => {
		const cfg = MainnetSpotMarkets.find((m) => m.marketIndex === idx)!;
		return { publicKey: cfg.oracle, source: cfg.oracleSource };
	});

	const driftClient = new DriftClient({
		connection,
		wallet: new Wallet(keypair) as any,
		programID: new PublicKey(DRIFT_PROGRAM_ID),
		accountSubscription: { type: 'websocket', commitment: 'processed' },
		authority: new PublicKey(VAULT_AUTHORITY),
		subAccountIds: [0],
		spotMarketIndexes: [0, SOL_MARKET_INDEX, DSOL_MARKET_INDEX],
		oracleInfos,
		env: 'mainnet-beta',
	});

	await driftClient.subscribe();
	const user = driftClient.getUser();
	await user.subscribe();

	const swapClient = new UnifiedSwapClient({ clientType: 'jupiter', connection, authToken: JUPITER_API_KEY, url: JUPITER_URL });
	const dsolMint = driftClient.getSpotMarketAccount(DSOL_MARKET_INDEX).mint;

	console.log('connected, polling...\n');

	while (true) {
		try {
			const balance = user.getTokenAmount(DSOL_MARKET_INDEX);
			if (balance.lten(0)) { console.log('done'); break; }

			const chunk = BN.min(balance, new BN(CHUNK_SIZE_DSOL * 1e9));
			const quote = await swapClient.getQuote({ inputMint: dsolMint, outputMint: WRAPPED_SOL_MINT, amount: chunk, slippageBps: MAX_SLIPPAGE_BPS, swapMode: 'ExactIn' });

			if (quote.error || !quote.outAmount || !quote.inAmount) {
				console.log(new Date().toISOString(), 'quote error:', quote.error);
				await sleep(SLEEP_MS); continue;
			}

			const oracleRatio = driftClient.getOracleDataForSpotMarket(DSOL_MARKET_INDEX).price.toNumber()
			                  / driftClient.getOracleDataForSpotMarket(SOL_MARKET_INDEX).price.toNumber();
			const swapRate    = Number(quote.outAmount) / Number(quote.inAmount);
			const slippageBps = (1 - swapRate / oracleRatio) * 10_000;

			console.log(new Date().toISOString(), `bal=${(balance.toNumber() / 1e9).toFixed(2)} dSOL  slippage=${slippageBps.toFixed(2)}bps  (swap=${swapRate.toFixed(4)} oracle=${oracleRatio.toFixed(4)})`);

			if (slippageBps <= MAX_SLIPPAGE_BPS) {
				if (scanMode) {
					console.log('  -> within threshold, would swap', chunk.toNumber() / 1e9, 'dSOL [scan mode]');
				} else {
					const txSig = await driftClient.swap({ swapClient, outMarketIndex: SOL_MARKET_INDEX, inMarketIndex: DSOL_MARKET_INDEX, amount: chunk, slippageBps: MAX_SLIPPAGE_BPS, quote });
					console.log('  -> swapped', chunk.toNumber() / 1e9, 'dSOL | tx:', txSig);
				}
			}
		} catch (err) {
			console.error(new Date().toISOString(), 'error:', err);
		}

		await sleep(SLEEP_MS);
	}

	await user.unsubscribe();
	await driftClient.unsubscribe();
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
main().catch((e) => { console.error(e); process.exit(1); });
