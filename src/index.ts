import { run, HandlerContext } from "@xmtp/message-kit";

//Tracks conversation steps
const inMemoryCacheStep = new Map<string, number>();

//List of words to stop or unsubscribe.
const stopWords = ["stop", "unsubscribe", "cancel", "list"];

run(async (context: HandlerContext) => {
  const {
    client,
    message: {
      content: { content: text },
      typeId,
      sender,
    },
  } = context;

  if (typeId !== "text") {
    /* If the input is not text do nothing */
    return;
  }
  const urlPatterns = [
    {
      pattern: /https?:\/\/zora\.co\/collect\/([^:]+):([^/]+)\/(\d+)/,
      transform: (chain: string, address: string, tokenId: string) =>
        `https://xmtp-coinbase-mint-frame.vercel.app/${chain}/${address}/${tokenId}`,
    },
    {
      pattern:
        /https?:\/\/wallet\.coinbase\.com\/nft\/mint\/eip155:(\d+):erc721:([^:]+)/,
      transform: (chain: string, address: string) =>
        `https://xmtp-coinbase-mint-frame.vercel.app/eip155/${chain}/erc721/${address}`,
    },
    {
      pattern:
        /https?:\/\/wallet\.coinbase\.com\/nft\/mint\/eip155:(\d+):erc1155:([^:]+):(\d+)/,
      transform: (chain: string, address: string, tokenId: string) =>
        `https://xmtp-coinbase-mint-frame.vercel.app/eip155/${chain}/erc1155/${address}/${tokenId}`,
    },
  ];
  //https://wallet.coinbase.com/nft/mint/eip155:8453:erc1155:0x9a83e7b27b8a9b68e8dc665a0049f2f004287a20:1
  //https://wallet.coinbase.com/nft/mint/eip155:8453:erc721:0x2a8e46E78BA9667c661326820801695dcf1c403E
  //https://xmtp-coinbase-mint-frame.vercel.app/eip155/8453/erc721/0xf16755b43eE1a458161f0faE5a9124729f4f6B1B
  let parsedUrl = null;
  for (const { pattern, transform } of urlPatterns) {
    const match = text.match(pattern);
    if (match) {
      parsedUrl = transform(match[1], match[2], match[3]);
      break;
    }
  }

  if (parsedUrl) {
    await context.send("Here is your Mint Frame URL: ");
    await context.send(parsedUrl);
    return;
  } else {
    await context.send(
      "Error: Unable to parse the provided URL. Please ensure you're sending a valid Zora or Coinbase URL."
    );
    return;
  }

  await context.send(
    "Hello! I can help you transform from URLs Zora and Coinbase to Mint Frames. Please send a valid URL."
  );
});
