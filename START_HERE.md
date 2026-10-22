# Outpost Rivals v1.4.1 — start here

1. Node 24: `npm ci`, copy `.env.example` to `.env`, `npm run build`, `npm start`. Open http://localhost:3000.
2. Read `docs/FINAL_HANDOFF.md` and `reports/VERIFICATION.md` for tested scope and deployment gates.
3. Play guided practice, a solo match, then invite a second browser. Explore the local agent directory and Armory previews.
4. Configure optional WalletConnect, then prove wallet linking on the intended public origin.
5. Deploy the included test contracts, configure addresses/signer, run preflight and complete a real testnet cosmetic purchase. Follow `docs/DEPLOYMENT.md`.
6. Use `docs/LAUNCH_PLAYBOOK.md` for the beta announcement. Paid launch requires live receipts and the operational checks in the handoff.

This is a developer/testnet candidate. No live contract deployment, token launch or public-host update is included. The living island is a local simulation; the tactical game and captain records are server persisted.

## v1.4 experience update
Read `docs/UX_V14.md` for the new world navigation, captain passport, wallet stages and account isolation changes. Deploy source and rebuilt assets together. Existing SQLite databases require no new columns.

## Security release note
For paid checkout, use the new contract and required treasury configuration. See `reports/SECURITY_V1.4.1.md`. The free beta can run without configured payments.
