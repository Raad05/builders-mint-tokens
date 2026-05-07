import {
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import wallet from "../../devnet-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createMetadataAccountV3,
  CreateMetadataAccountV3InstructionAccounts,
  CreateMetadataAccountV3InstructionArgs,
  DataV2Args,
} from "@metaplex-foundation/mpl-token-metadata";
import bs58 from "bs58";

const mint = publicKey("Fi2DUnkJKjYzsWoGfYiCS6QbqnhFfrDwwHgSgXiRgy9r");
const umi = createUmi("https://api.devnet.solana.com");
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));

(async () => {
  try {
    const accounts: CreateMetadataAccountV3InstructionAccounts = {
      mint,
      mintAuthority: signer,
    };

    const data: DataV2Args = {
      name: "Gosling Coin",
      symbol: "GSL",
      uri: "",
      sellerFeeBasisPoints: 1,
      creators: null,
      collection: null,
      uses: null,
    };

    const args: CreateMetadataAccountV3InstructionArgs = {
      data,
      isMutable: true,
      collectionDetails: null,
    };
    const tx = createMetadataAccountV3(umi, { ...accounts, ...args });

    const result = await tx.sendAndConfirm(umi);

    console.log(bs58.encode(Buffer.from(result.signature)));
  } catch (e) {
    console.log(e);
  }
})();

// Transaction signature: 2MZc137xTfvGHFBibAWBMQGYXvzJ1VRJcbRiu89fA9n8zXFNF4H1QkVUSybAxut9eywLge3RzQrMhziz9fNhGBvn
