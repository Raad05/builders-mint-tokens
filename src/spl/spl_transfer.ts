import {
  address,
  appendTransactionMessageInstructions,
  assertIsTransactionWithBlockhashLifetime,
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  getSignatureFromTransaction,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from "@solana/kit";
import wallet from "../../devnet-wallet.json";
import {
  findAssociatedTokenPda,
  getCreateAssociatedTokenInstructionAsync,
  getInitializeMintInstruction,
  getTransferCheckedInstruction,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";

// RPC URLs
const rpc = createSolanaRpc("https://api.devnet.solana.com");
const rpcSubscriptions = createSolanaRpcSubscriptions(
  "wss://api.devnet.solana.com",
);

const mint = address("Fi2DUnkJKjYzsWoGfYiCS6QbqnhFfrDwwHgSgXiRgy9r");
const to = address("7RC4XsSGybTHkNfdW7CBrLvYKkqpACRCDQDXFEdGgApw");

(async () => {
  try {
    const signer = await createKeyPairSignerFromBytes(new Uint8Array(wallet));
    const sendAndConfirm = sendAndConfirmTransactionFactory({
      rpc,
      rpcSubscriptions,
    });

    const [fromAta] = await findAssociatedTokenPda({
      mint,
      owner: signer.address,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    });
    console.log(`From ATA: ${fromAta}`);

    const [toAta] = await findAssociatedTokenPda({
      mint,
      owner: to,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    });
    console.log(`To ATA: ${toAta}`);

    const createAtaTx = await getCreateAssociatedTokenInstructionAsync({
      payer: signer,
      mint,
      owner: to,
    });

    const transferTx = getTransferCheckedInstruction({
      source: fromAta,
      mint,
      destination: toAta,
      authority: signer,
      amount: 1_000_000,
      decimals: 6,
    });

    const { value: latestBlockHash } = await rpc.getLatestBlockhash().send();
    const msg = createTransactionMessage({ version: 0 });
    const msgWithPayer = setTransactionMessageFeePayerSigner(signer, msg);
    const msgWithLifetime = setTransactionMessageLifetimeUsingBlockhash(
      latestBlockHash,
      msgWithPayer,
    );
    const txMessage = appendTransactionMessageInstructions(
      [createAtaTx, transferTx],
      msgWithLifetime,
    );

    const signedTx = await signTransactionMessageWithSigners(txMessage);

    assertIsTransactionWithBlockhashLifetime(signedTx);

    const signature = getSignatureFromTransaction(signedTx);

    await sendAndConfirm(signedTx, { commitment: "confirmed" });

    console.log(`Transaction signature: ${signature}`);
  } catch (e) {
    console.log(e);
  }
})();

// From ATA: voYuvoqmS8f8UA6pjACzVxmAviSon8uzGpBvDPWqQTy
// To ATA: 7WEttKEQ4ZgPmH3DWeupzVf8HW8zYEGwFnCSyGcGEMmY
// Transaction signature: 4F6NoCvC632Lhdfm24Seyvpu4DaY5nynafP6aF4qRFn8pW9fEdWSsGfDzfSiqpTTQoieGfx3cAfMJ3Ef5x5J9Dfg
