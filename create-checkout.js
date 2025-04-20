const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  const { name, phone, province, address, variantId } = JSON.parse(event.body);

  const storefrontAccessToken = "661500e21441413c79a8fc358f50ae43";
  const shopDomain = "royatapis.myshopify.com";

  const mutation = `
    mutation {
      checkoutCreate(input: {
        lineItems: [{ variantId: "${variantId}", quantity: 1 }],
        customAttributes: [
          { key: "name", value: "${name}" },
          { key: "phone", value: "${phone}" },
          { key: "province", value: "${province}" },
          { key: "address", value: "${address}" }
        ]
      }) {
        checkout {
          id
          webUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const response = await fetch(`https://${shopDomain}/api/2024-01/graphql.json`, {
    method: "POST",
    headers: {
      "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: mutation }),
  });

  const result = await response.json();

  if (result.data && result.data.checkoutCreate && result.data.checkoutCreate.checkout) {
    return {
      statusCode: 200,
      body: JSON.stringify({ checkoutUrl: result.data.checkoutCreate.checkout.webUrl }),
    };
  } else {
    console.error("Shopify error:", result);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to create checkout", details: result }),
    };
  }
};
