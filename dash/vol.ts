import {
    DriftClient,
    Wallet,
    loadKeypair,
    BulkAccountLoader,
    MarketType,
    getUserStatsAccountPublicKey,
    UserStats,
  } from '@drift-labs/sdk';
  import { Connection, PublicKey } from '@solana/web3.js';
  import * as dotenv from 'dotenv';
  
  dotenv.config();
  
  async function trackVol(marketMakerAddress: string) {  
    const keypair = loadKeypair(process.env.PRIVATE_KEY!);
    const wallet = new Wallet(keypair);
    // Initialize connection to Solana  
    const connection = new Connection("url", "confirmed");      
    // Initialize DriftClient  
    const driftClient = new DriftClient({  
      connection,  
      wallet: wallet,  
      env: 'mainnet-beta',
      programID: new PublicKey('dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH'),  
      userStats: true,
      accountSubscription: {  
        type: 'websocket', 
      }  
    });    
    await driftClient.subscribe();  

    const marketMakerPubkey = new PublicKey(marketMakerAddress);  
    const userStatsPublicKey = getUserStatsAccountPublicKey(  
      driftClient.program.programId,  
      marketMakerPubkey  
    );  
      
    const userStats = new UserStats({  
      driftClient,  
      userStatsAccountPublicKey: userStatsPublicKey,  
      accountSubscription: {  
        type: 'websocket',
      }  
    });  
      
    await userStats.subscribe();  
    const userStatsAccount = userStats.getAccount();
    const makerVolume = userStatsAccount.makerVolume30D;  
    const takerVolume = userStatsAccount.takerVolume30D; 

    console.log('Market Maker Address:', marketMakerAddress); 
    console.log('MakerVOL:', makerVolume);
    console.log('TakerVOL:', takerVolume);
}

trackVol("addy");