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

  const urlPattern = /https?:\/\/zora\.co\/collect\/([^:]+):([^/]+)\/(\d+)/;
  const match = text.match(urlPattern);

  if (match) {
    const [_, chain, address, tokenId] = match;
    const newUrl = `https://xmtp-coinbase-mint-frame.vercel.app/${chain}/${address}/${tokenId}`;
    await context.send(newUrl);
  } else {
    await context.send(
      "Hello! I can help you transform Zora URLs to a Mint Frame. Please send a valid zora.co URL in the format: zora.co/collect/chain:address/tokenId."
    );
  }
});
