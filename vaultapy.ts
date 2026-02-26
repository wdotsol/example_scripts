// Fetch Drift Vault APYs — run with `bun run getVaultAPYs.ts`
//
// 90d APY is the most reliable metric.
// Shorter timeframes (7d, 30d) can produce extreme values due to annualization.

const CONFIGS_URL =
	'API here';
const APYS_URL = 'API here';

async function main() {
	const [configs, apys] = await Promise.all([
		fetch(CONFIGS_URL).then((r) => r.json()),
		fetch(APYS_URL).then((r) => r.json()),
	]);

	for (const { name, vaultPubkeyString } of configs) {
		const data = apys[vaultPubkeyString];
		if (!data) continue;

		const a = data.apys;
		console.log(`\n${name} (${vaultPubkeyString})`);
		console.log(`  90d APY:  ${a['90d'].toFixed(2)}%`);
		console.log(`  7d APY:   ${a['7d'].toFixed(2)}%`);
		console.log(`  30d APY:  ${a['30d'].toFixed(2)}%`);
		console.log(`  180d APY: ${a['180d'].toFixed(2)}%`);
		console.log(`  365d APY: ${a['365d'].toFixed(2)}%`);
		console.log(`  Max Drawdown: ${data.maxDrawdownPct.toFixed(2)}%`);
	}
}

main();
