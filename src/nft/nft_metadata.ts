import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import wallet from "../../devnet-wallet.json";
import {
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";

const umi = createUmi("https://api.devnet.solana.com");
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader({ address: "https://devnet.irys.xyz" }));
umi.use(signerIdentity(signer));

(async () => {
  try {
    const image =
      "https://gateway.irys.xyz/98RwbmtH3G1DCCUbUGat1umahfNoFqeDeq4H8s4FtPvi";
    const metadata = {
      name: "Dafoe",
      description: "William Dafoe looking at the sky",
      image,
      attributes: [{ trait_type: "Rarity", value: "Legendary" }],
      properties: {
        files: [
          {
            type: "image/jpeg",
            uri: image,
          },
        ],
        category: "image",
      },
    };

    const myUri = await umi.uploader.uploadJson(metadata);

    console.log(`Metadata URI: ${myUri}`);
  } catch (e) {
    console.log(e);
  }
})();

// Metadata URI: https://gateway.irys.xyz/AqnHndrAAhrp4VkdL4UpLtoUnL8Uygzjr46maJ2h5Phs
