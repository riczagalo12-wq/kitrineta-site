const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};


exports.handler = async function (event) {

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


    /*
      RECEBEMOS A REFERÊNCIA DA ENCOMENDA
      QUE JÁ FOI CRIADA NO CREATE-ORDER
    */

    const orderId =
      String(
        data.orderId || ""
      ).trim();


    const quantity =
      Math.max(
        1,
        Math.min(
          10,
          Number(data.quantity) || 1
        )
      );


    if (!orderId) {

      return {
        statusCode: 400,
        headers: corsHeaders,

        body: JSON.stringify({
          success: false,
          message:
            "Falta a referência da encomenda."
        })
      };

    }


    /*
      PREÇO DO KIT EXPLORADOR

      Ainda estamos no ambiente de testes.
      Mais à frente esta função vai ler
      diretamente a encomenda guardada.
    */

    const PRICE = 54.90;


    const total =
      Number(
        (
          PRICE *
          quantity
        ).toFixed(2)
      );


    /*
      CREDENCIAIS PÚBLICAS
      DO AMBIENTE SANDBOX EASYPAY

      NÃO SÃO AS CREDENCIAIS REAIS
      DA KITRINETA.
    */

    const TEST_ACCOUNT_ID =
      "2b0f63e2-9fb5-4e52-aca0-b4bf0339bbe6";


    const TEST_API_KEY =
      "eae4aa59-8e5b-4ec2-887d-b02768481a92";


    /*
      CRIAR CHECKOUT EASYPAY

      IMPORTANTE:
      A key da Easypay passa agora
      a ser a referência KIT-...
      da nossa encomenda.
    */

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

              type:
                "sale",

              currency:
                "EUR",

              capture: {
                descriptive:
                  "Kitrineta"
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


              /*
                ESTA É A ALTERAÇÃO
                MAIS IMPORTANTE.

                Antes:
                kitrineta-179...

                Agora:
                KIT-179...-XXXXXXXX
              */

              key:
                orderId,


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
        JSON.parse(
          responseText
        );

    } catch {

      result = {
        raw:
          responseText
      };

    }


    /*
      ERRO DEVOLVIDO PELA EASYPAY
    */

    if (!response.ok) {

      console.error(
        "Erro Easypay:",
        result
      );


      return {

        statusCode:
          response.status,

        headers:
          corsHeaders,

        body:
          JSON.stringify({

            success:
              false,

            easypayStatus:
              response.status,

            error:
              result

          })

      };

    }


    /*
      CHECKOUT CRIADO
    */

    console.log(
      "Checkout criado para:",
      orderId
    );


    return {

      statusCode: 200,

      headers:
        corsHeaders,

      body:
        JSON.stringify({

          success:
            true,

          orderId:
            orderId,

          manifest:
            result

        })

    };


  } catch (error) {

    console.error(
      "Erro create-checkout:",
      error
    );


    return {

      statusCode: 500,

      headers:
        corsHeaders,

      body:
        JSON.stringify({

          success:
            false,

          message:
            "Erro ao criar checkout de teste."

        })

    };

  }

};
