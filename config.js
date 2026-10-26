/* ONE place to edit your shop: name, prices, contact, products.
   Nothing secret belongs in this file: it is public. Coupon codes, the payment secret and the sheet link live in the API (see worker/README.txt).
   Prices are whole rupees. "regular" is the old price, "price" is today's price,
   and the Save amount is worked out for you. */
window.SITE = {
  name: 'Pawnote',
  tagline: 'Little letters that come alive.',
  currency: 'INR',
  symbol: '₹',
  supportEmail: 'pawnote.we@gmail.com',      // change to your real support email
  apiBase: 'https://pawnote-api.pawnotekitty.workers.dev',  // the address of your Pawnote API (Cloudflare Worker), for example https://pawnote-api.yourname.workers.dev
  products: [
    {
      id: 'kitty', status: 'live', name: 'Kitty Letter', tag: 'Animated page',
      blurb: 'A tiny 3D kitten carries in your letter and your question, and gets sadder with every no.',
      url: 'kitty-letter.html', image: 'assets/kitty-cover.jpg',
      price: 99, regular: 199
    },
    {
      id: 'starry', status: 'soon', name: 'Starry Promise', tag: 'Animated page',
      blurb: 'A night sky that draws your promise one star at a time.',
      price: 149, regular: 299
    },
    {
      id: 'cake', status: 'soon', name: 'Birthday Surprise', tag: 'Animated page',
      blurb: 'A cake, a wish and a pop of confetti, sent as a private link.',
      price: 129, regular: 259
    },
    {
      id: 'museum', status: 'soon', name: 'Our Little Museum', tag: 'Walk-through 3D',
      blurb: 'Turn your photos and notes into a tiny gallery to walk through together.',
      price: 199, regular: 399
    }
  ]
};
