import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import wallet from "../../devnet-wallet.json";
import {
  createGenericFile,
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { readFile } from "fs/promises";

const umi = createUmi("https://api.devnet.solana.com");
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader({ address: "https://devnet.irys.xyz" }));
umi.use(signerIdentity(signer));

(async () => {
  try {
    const image = await readFile(`${__dirname}/../assets/dafoe.jpg`);
    const file = createGenericFile(image, "dafoe.jpg", {
      contentType: "image/jpeg",
    });
    const [myUri] = await umi.uploader.upload([file]);

    console.log(`Image URI: ${myUri}`);
  } catch (e) {
    console.log(e);
  }
})();

// Image URI: https://gateway.irys.xyz/98RwbmtH3G1DCCUbUGat1umahfNoFqeDeq4H8s4FtPvi
