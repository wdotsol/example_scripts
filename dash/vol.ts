import {
    DriftClient,
    Wallet,
    loadKeypair,
    getUserStatsAccountPublicKey,
    UserStats,
} from '@drift-labs/sdk';
import { Connection, PublicKey } from '@solana/web3.js';
import * as dotenv from 'dotenv';

dotenv.config();

const ADDRESSES = process.env.ADDRS
    ? process.env.ADDRS.split(',').map(a => a.trim()).filter(Boolean)
    : [];

if (ADDRESSES.length === 0) {
    throw new Error("No addresses provided in ADDRS env variable.");
}

async function main() {
    // Load wallet/keypair
    const keypair = loadKeypair(process.env.PRIVATE_KEY!);
    const wallet = new Wallet(keypair);

    const connection = new Connection("url", "confirmed");
    const driftClient = new DriftClient({
        connection,
        wallet,
        env: 'mainnet-beta',
        programID: new PublicKey('dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH'),
        userStats: true,
        accountSubscription: {
            type: 'websocket',
        },
    });

    await driftClient.subscribe();

    for (const marketMakerAddress of ADDRESSES) {
        try {
            const marketMakerPubkey = new PublicKey(marketMakerAddress);
            const userStatsPublicKey = getUserStatsAccountPublicKey(
                driftClient.program.programId,
                marketMakerPubkey
            );
            const userStats = new UserStats({
                driftClient,
                userStatsAccountPublicKey: userStatsPublicKey,
                accountSubscription: { type: 'websocket' },
            });

            await userStats.subscribe();
            const userStatsAccount = userStats.getAccount();

            const makerVolume = userStatsAccount.makerVolume30D;
            const takerVolume = userStatsAccount.takerVolume30D;

            console.log('Market Maker Address:', marketMakerAddress);
            console.log('MakerVOL:', makerVolume.toString());
            console.log('TakerVOL:', takerVolume.toString());
            console.log('-------------------------');
            await userStats.unsubscribe();
        } catch (err) {
            console.error(`Error fetching volume for ${marketMakerAddress}:`, err);
        }
    }

    await driftClient.unsubscribe();
}

main().catch(console.error);
