const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};


exports.handler = async function (event) {

  // O browser envia primeiro este pedido
  // para confirmar se pode comunicar com a Netlify.
  if (event.httpMethod === "OPTIONS") {

    return {
      statusCode: 204,
      headers: corsHeaders,
      body: ""
    };

  }


  // O checkout propriamente dito é POST.
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


    const quantity =
      Math.max(
        1,
        Math.min(
          10,
          Number(data.quantity) || 1
        )
      );


    const PRICE = 54.90;


    const total =
      Number(
        (PRICE * quantity).toFixed(2)
      );


    // Credenciais públicas do
    // ambiente de TESTE Easypay.
    const TEST_ACCOUNT_ID =
      "2b0f63e2-9fb5-4e52-aca0-b4bf0339bbe6";


    const TEST_API_KEY =
      "eae4aa59-8e5b-4ec2-887d-b02768481a92";


    const orderKey =
      "kitrineta-" + Date.now();


    const response =
      await fetch(
        "https://api.test.easypay.pt/2.0/checkout",
        {

          method: "POST",

          headers: {

            "AccountId":
              TEST_ACCOUNT_ID,

            "ApiKey":
              TEST_API_KEY,

            "Content-Type":
              "application/json"

          },


          body: JSON.stringify({

            type: [
              "single"
            ],


            payment: {

              methods: [
                "cc",
                "mb",
                "mbw"
              ],

              type: "sale",

              currency: "EUR",

              capture: {
                descriptive: "Kitrineta"
              }

            },


            order: {

              items: [

                {

                  description:
                    "Kit Explorador",

                  quantity:
                    quantity,

                  key:
                    "kit-explorador",

                  value:
                    PRICE

                }

              ],


              key:
                orderKey,


              value:
                total

            }

          })

        }
      );


    const responseText =
      await response.text();


    let result;


    try {

      result =
        JSON.parse(responseText);

    }

    catch {

      result = {
        raw: responseText
      };

    }


    if (!response.ok) {

      return {

        statusCode:
          response.status,

        headers:
          corsHeaders,

        body:
          JSON.stringify({

            success: false,

            easypayStatus:
              response.status,

            error:
              result

          })

      };

    }


    return {

      statusCode: 200,

      headers:
        corsHeaders,

      body:
        JSON.stringify({

          success: true,

          manifest:
            result

        })

    };


  }

  catch (error) {

    return {

      statusCode: 500,

      headers:
        corsHeaders,

      body:
        JSON.stringify({

          success: false,

          message:
            "Erro ao criar checkout de teste.",

          error:
            error.message

        })

    };

  }

};
