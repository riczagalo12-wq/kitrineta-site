exports.handler = async function () {

  return {
    statusCode: 200,

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      success: true,
      message: "Kitrineta Checkout está a funcionar!"
    })
  };

};
