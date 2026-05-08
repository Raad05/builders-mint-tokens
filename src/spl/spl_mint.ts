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
  getMintToInstruction,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";

// RPC URLs
const rpc = createSolanaRpc("https://api.devnet.solana.com");
const rpcSubscriptions = createSolanaRpcSubscriptions(
  "wss://api.devnet.solana.com",
);

const token_decimals = 1_000_000;
const mint = address("Fi2DUnkJKjYzsWoGfYiCS6QbqnhFfrDwwHgSgXiRgy9r");

(async () => {
  try {
    const sendAndConfirm = sendAndConfirmTransactionFactory({
      rpc,
      rpcSubscriptions,
    });
    const signer = await createKeyPairSignerFromBytes(new Uint8Array(wallet));
    const [ata] = await findAssociatedTokenPda({
      mint,
      owner: signer.address,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    });
    console.log(`ATA: ${ata}`);

    const createAtaTx = await getCreateAssociatedTokenInstructionAsync({
      payer: signer,
      mint,
      owner: signer.address,
    });
    const mintToTx = getMintToInstruction({
      mint,
      token: ata,
      mintAuthority: signer,
      amount: 1 * token_decimals,
    });
    const { value: latestBlockHash } = await rpc.getLatestBlockhash().send();
    const msg = createTransactionMessage({ version: 0 });
    const msgWithPayer = setTransactionMessageFeePayerSigner(signer, msg);
    const msgWithLifetime = setTransactionMessageLifetimeUsingBlockhash(
      latestBlockHash,
      msgWithPayer,
    );
    const txMessage = appendTransactionMessageInstructions(
      [createAtaTx, mintToTx],
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

// ATA: voYuvoqmS8f8UA6pjACzVxmAviSon8uzGpBvDPWqQTy
// Transaction signature: 64rpuUeJvmCapGTEzhxnKRxpYZ53La3uDyNenXivmTR7MK5gYEFsf2b7usQ3pSzu5Z7nW3bGPYvi6VGMF5hp62d4
