import { getStore } from "@netlify/blobs";


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


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};


function jsonResponse(data, status = 200) {

  return new Response(
    JSON.stringify(data),
    {
      status: status,

      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    }
  );

}


export default async (request, context) => {

  /*
    CORS
  */

  if (request.method === "OPTIONS") {

    return new Response(
      null,
      {
        status: 204,
        headers: corsHeaders
      }
    );

  }


  /*
    SÓ ACEITAMOS POST
  */

  if (request.method !== "POST") {

    return jsonResponse(
      {
        success: false,
        message: "Método não permitido."
      },
      405
    );

  }


  try {

    /*
      RECEBER DADOS DO CARRINHO
    */

    const data =
      await request.json();


    const items =
      Array.isArray(data.items)
        ? data.items
        : [];


    const customer =
      data.customer &&
      typeof data.customer === "object"
        ? data.customer
        : {};


    /*
      VERIFICAR PRODUTOS
    */

    if (items.length === 0) {

      return jsonResponse(
        {
          success: false,
          message:
            "A encomenda não tem produtos."
        },
        400
      );

    }


    /*
      LIMPAR DADOS DE ENTREGA
    */

    const cleanCustomer = {

      name:
        String(
          customer.name || ""
        ).trim(),

      email:
        String(
          customer.email || ""
        ).trim(),

      phone:
        String(
          customer.phone || ""
        ).trim(),

      address:
        String(
          customer.address || ""
        ).trim(),

      postalCode:
        String(
          customer.postalCode || ""
        ).trim(),

      city:
        String(
          customer.city || ""
        ).trim(),

      nif:
        String(
          customer.nif || ""
        ).trim()

    };


    /*
      CAMPOS OBRIGATÓRIOS
    */

    if (
      !cleanCustomer.name ||
      !cleanCustomer.email ||
      !cleanCustomer.phone ||
      !cleanCustomer.address ||
      !cleanCustomer.postalCode ||
      !cleanCustomer.city
    ) {

      return jsonResponse(
        {
          success: false,
          message:
            "Faltam dados de entrega."
        },
        400
      );

    }


    /*
      VALIDAR PRODUTOS E CALCULAR
      O PREÇO NO SERVIDOR
    */

    let total = 0;

    const validatedItems = [];


    for (const item of items) {

      const product =
        PRODUCTS[item.id];


      if (!product) {

        return jsonResponse(
          {
            success: false,
            message:
              "Produto inválido."
          },
          400
        );

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

        id:
          item.id,

        name:
          product.name,

        price:
          product.price,

        quantity:
          quantity,

        childName:
          String(
            item.childName || ""
          ).trim(),

        total:
          lineTotal

      });

    }


    total =
      Number(
        total.toFixed(2)
      );


    /*
      CRIAR REFERÊNCIA ÚNICA
    */

    const orderId =
      "KIT-" +
      Date.now() +
      "-" +
      crypto.randomUUID()
        .slice(0, 8)
        .toUpperCase();


    const createdAt =
      new Date().toISOString();


    /*
      ENCOMENDA
    */

    const order = {

      id:
        orderId,

      createdAt:
        createdAt,

      status:
        "pending",

      paymentStatus:
        "pending",

      items:
        validatedItems,

      customer:
        cleanCustomer,

      shipping: {
        price: 0,
        method:
          "Portes gratuitos"
      },

      subtotal:
        total,

      total:
        total

    };


    /*
      NETLIFY BLOBS

      Dentro da Netlify Function,
      o runtime fornece o contexto
      necessário ao armazenamento.
    */

    const orders =
      getStore(
        "kitrineta-orders"
      );


    /*
      GUARDAR ENCOMENDA
    */

    await orders.setJSON(
      orderId,
      order
    );


    console.log(
      "Encomenda guardada:",
      orderId
    );


    /*
      DEVOLVEMOS AO SITE APENAS
      OS DADOS NECESSÁRIOS.

      NÃO DEVOLVEMOS A MORADA,
      TELEFONE, ETC.
    */

    return jsonResponse(
      {

        success: true,

        order: {

          id:
            order.id,

          createdAt:
            order.createdAt,

          status:
            order.status,

          items:
            order.items,

          shipping:
            order.shipping.price,

          subtotal:
            order.subtotal,

          total:
            order.total

        }

      },
      200
    );


  }

  catch (error) {

    console.error(
      "Erro create-order:",
      error
    );


    return jsonResponse(
      {
        success: false,
        message:
          "Não foi possível criar a encomenda."
      },
      500
    );

  }

};
