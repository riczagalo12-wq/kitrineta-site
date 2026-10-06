const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};


const PRODUCTS = {
  "kit-explorador": {
    name: "Kit Explorador",
    price: 54.90
  },

  "kit-dinossauro": {
    name: "Kit Dinossauro",
    price: 54.90
  }
};


exports.handler = async function (event) {

  // Permitir comunicação do site com a função
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: ""
    };
  }


  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        message: "Método não permitido."
      })
    };
  }


  try {

    const data =
      JSON.parse(event.body || "{}");


    const items =
      Array.isArray(data.items)
        ? data.items
        : [];


    if (items.length === 0) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          message: "A encomenda não tem produtos."
        })
      };
    }


    let total = 0;

    const validatedItems = [];


    for (const item of items) {

      const product =
        PRODUCTS[item.id];


      if (!product) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({
            success: false,
            message: "Produto inválido."
          })
        };
      }


      const quantity =
        Math.max(
          1,
          Math.min(
            10,
            Number(item.quantity) || 1
          )
        );


      const lineTotal =
        Number(
          (
            product.price *
            quantity
          ).toFixed(2)
        );


      total +=
        lineTotal;


      validatedItems.push({
        id: item.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        childName:
          String(
            item.childName || ""
          ).trim(),
        total: lineTotal
      });

    }


    total =
      Number(
        total.toFixed(2)
      );


    const orderId =
      "KIT-" +
      Date.now();


    /*
      IMPORTANTE:

      Ainda NÃO estamos a guardar
      esta encomenda numa base de dados.

      Primeiro vamos confirmar que
      recebemos e validamos corretamente
      os dados do carrinho.
    */


    return {
      statusCode: 200,
      headers: corsHeaders,

      body: JSON.stringify({

        success: true,

        order: {
          id: orderId,
          items: validatedItems,
          shipping: 0,
          total: total,
          status: "pending"
        }

      })
    };


  }

  catch (error) {

    return {
      statusCode: 500,
      headers: corsHeaders,

      body: JSON.stringify({
        success: false,
        message:
          "Não foi possível criar a encomenda."
      })
    };

  }

};
