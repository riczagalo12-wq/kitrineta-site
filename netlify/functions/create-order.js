const { getStore } = require("@netlify/blobs");


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


    const customer =
      data.customer &&
      typeof data.customer === "object"

        ? data.customer

        : {};


    if (items.length === 0) {

      return {
        statusCode: 400,
        headers: corsHeaders,

        body: JSON.stringify({
          success: false,
          message:
            "A encomenda não tem produtos."
        })
      };

    }


    /*
      VALIDAR DADOS DE ENTREGA
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


    if (
      !cleanCustomer.name ||
      !cleanCustomer.email ||
      !cleanCustomer.phone ||
      !cleanCustomer.address ||
      !cleanCustomer.postalCode ||
      !cleanCustomer.city
    ) {

      return {
        statusCode: 400,
        headers: corsHeaders,

        body: JSON.stringify({
          success: false,
          message:
            "Faltam dados de entrega."
        })
      };

    }


    /*
      VALIDAR PRODUTOS E PREÇOS
    */

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
            message:
              "Produto inválido."
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
      CRIAR REFERÊNCIA
    */

    const orderId =
      "KIT-" +
      Date.now();


    const createdAt =
      new Date().toISOString();


    /*
      ENCOMENDA COMPLETA
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
      GUARDAR NO NETLIFY BLOBS

      Este armazenamento é permanente
      entre deploys.
    */

    const orders =
      getStore("kitrineta-orders");


    await orders.setJSON(
      orderId,
      order,
      {
        onlyIfNew: true
      }
    );


    /*
      RESPOSTA PARA O SITE

      Não devolvemos novamente a morada
      nem os restantes dados pessoais.
    */

    return {
      statusCode: 200,
      headers: corsHeaders,

      body: JSON.stringify({

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

      })
    };


  }

  catch (error) {

    console.error(
      "Erro create-order:",
      error
    );


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
