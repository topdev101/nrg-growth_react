import { useState } from "react";
import { Link } from "react-router-dom";
import { Data } from "../core";
import { getApiFetchOption, validateEmail } from "../core/utils";
import CardComponent from "./CardComponent";

const NmiPayment = ({ onPaymentSuccess, packageData }) => {
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = (error) => {
    setIsLoading(false);
    setMessage(error.message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    setMessage("Processing payment...");

    // make sure name isn't empty
    if (
      !Data.Checkout.name ||
      (Data.Checkout.name && !Data.Checkout.name.length > 0)
    ) {
      setMessage(`You must enter your name.`);
      return;
    }

    // make sure email is valid
    if (
      !Data.Checkout.email ||
      (Data.Checkout.email && !validateEmail(Data.Checkout.email))
    ) {
      setMessage(`Email isn't properly formatted.`);
      return;
    }

    setIsLoading(true);

    const {
      email,
      name,
      phoneNumber,
      followerType,
      followerLocation,
      instaUsername,
    } = Data.Checkout;

    try {
      const requestBody = {
        email: email,
        name: name,
        phoneNumber: phoneNumber,
        followerType: followerType,
        followerLocation: followerLocation,
        instaUsername: instaUsername,
        cardInfo: {
          cardNumber: formData.get("number"),
          expiry: formData.get("expiry"),
          cvc: formData.get("cvc"),
        },
        packageName: packageData.name,
      };
      const _MakePaymentRequest = await fetch(
        "/make-payment-request",
        getApiFetchOption(requestBody)
      );

      const paymentResponse = await _MakePaymentRequest.json();

      if (_MakePaymentRequest.ok) {
        onPaymentSuccess();
      } else {
        handleError(paymentResponse);
      }
    } catch (error) {
      console.error("Error:", error);
      handleError(error);
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <CardComponent />

      <div className="divider" />

      {/* <DataBlock
        name="Base Package"
        data={`$${packageData.discountPrice[0]}`}
      />
      <DataBlock
        hide={Data.Checkout.followerType !== "Female"}
        name="All Female Followers"
        data={`$${packageData.femalePrice[0]}`}
      />
      <DataBlock
        hide={Data.Checkout.followerLocation !== "USA"}
        name="All USA Followers"
        data={`$${packageData.usaPrice[0]}`}
      />
      <DataBlock
        name="Processing Fee"
        data={`$${packageData.processingFee[0]}`}
      /> */}

      <div className="divider" />

      {/* <div className="CheckoutSummary-module--price">
        <span className="bold">Total Due: </span>$
        {(
          packageData.discountPrice[0] +
          packageData.processingFee[0] +
          (Data.Checkout.followerType === "Female"
            ? packageData.femalePrice[0]
            : 0) +
          (Data.Checkout.followerLocation === "USA"
            ? packageData.usaPrice[0]
            : 0)
        ).toFixed(2)}
      </div> */}
      <button className="styled-button" disabled={isLoading} id="submit">
        Pay Now
      </button>

      {message && <div id="payment-message">{message}</div>}

      <div className="divider" />

      <small>
        By completing your order, you agree to our{" "}
        <Link to="/tos">Terms of Service</Link>
      </small>
    </form>
  );
};

export default NmiPayment;
