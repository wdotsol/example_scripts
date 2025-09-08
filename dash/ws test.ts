import { Connection, Keypair } from "@solana/web3.js";
import { Wallet, DriftClient } from "@drift-labs/sdk";
import WebSocket from "ws";

async function run() {
  const dummyKeypair = Keypair.generate();
  const wallet = new Wallet(dummyKeypair);
  const connection = new Connection(
    "",
    "confirmed"
  );
  const driftClient = new DriftClient({
    connection,
    wallet,
    env: "mainnet-beta",
  });

  await driftClient.subscribe();

  const ws = new WebSocket("wss://dlob.drift.trade/ws");
  ws.on("open", () => {
    ws.send(
      JSON.stringify({
        type: "subscribe",
        marketType: "perp",
        channel: "orderbook",
        market: "SOL-PERP",
      })
    );
  });

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }
    console.log(JSON.stringify(msg));
  });

  ws.on("error", (err) => {
    console.error(err);
  });

  ws.on("close", () => {
    console.log("connection closed");
  });
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
