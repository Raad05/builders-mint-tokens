import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import wallet from "../../devnet-wallet.json";
import {
  createSignerFromKeypair,
  generateSigner,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { create, mplCore } from "@metaplex-foundation/mpl-core";
import { base58 } from "@metaplex-foundation/umi/serializers";

const umi = createUmi("https://api.devnet.solana.com");
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));
umi.use(mplCore());

(async () => {
  try {
    const metadataUri =
      "https://gateway.irys.xyz/AqnHndrAAhrp4VkdL4UpLtoUnL8Uygzjr46maJ2h5Phs";
    const asset = generateSigner(umi);
    const tx = await create(umi, {
      asset,
      name: "Dafoe",
      uri: metadataUri,
    }).sendAndConfirm(umi);

    const signature = base58.deserialize(tx.signature)[0];

    console.log(
      `Transaction signature: ${signature}. Asset: ${asset.publicKey}`,
    );
  } catch (e) {
    console.log(e);
  }
})();

// Transaction signature: 3zZKhB3nVMKkLWpUGENbWhoo8ea1QDe1RPBQqpwEmKzaUkmu8X1sD8MnEFCR6gkkVHCqNRDFFsrpz99b41oG68h2.
// Asset: 73a21KKNurJLL5U9oSVKP4wsri15L2pFFZUsdgnVodhy
