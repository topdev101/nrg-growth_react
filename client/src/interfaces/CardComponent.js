import Card from "react-credit-cards";
import {
  formatCreditCardNumber,
  formatCVC,
  formatExpirationDate,
} from "../core/utils";

import { useState } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import "react-credit-cards/es/styles-compiled.css";

const CardComponent = () => {
  const [cardInfo, setCardInfo] = useState({
    number: "",
    name: " ",
    expiry: "",
    cvc: "",
    issuer: "",
    focused: "",
    formData: null,
  });

  const handleInputChange = ({ target }) => {
    if (target.name === "number") {
      target.value = formatCreditCardNumber(target.value);
    } else if (target.name === "expiry") {
      target.value = formatExpirationDate(target.value);
    } else if (target.name === "cvc") {
      target.value = formatCVC(target.value);
    }

    setCardInfo({ ...cardInfo, [target.name]: target.value });
  };

  const handleCallback = ({ issuer }, isValid) => {
    if (isValid) {
      setCardInfo({ ...cardInfo, issuer: issuer });
    }
  };

  const handleInputFocus = ({ target }) => {
    setCardInfo({ ...cardInfo, focused: target.name });
  };

  const { name, number, expiry, cvc, issuer, focused } = cardInfo;

  return (
    <div id="PaymentForm">
      <div className="App-payment">
        <Card
          number={number}
          name={name}
          expiry={expiry}
          cvc={cvc}
          callback={handleCallback}
          issuer={issuer}
          focused={focused}
        />
      </div>
      <div className="form-group">
        <input
          type="tel"
          name="number"
          className="form-control"
          placeholder="Card Number"
          pattern="[\d ]{16,22}"
          required
          onChange={handleInputChange}
          onFocus={handleInputFocus}
        />
        <small>E.g.: 49..., 51..., 36..., 37...</small>
      </div>
      <div className="row">
        <div className="col-6">
          <input
            type="tel"
            name="expiry"
            className="form-control"
            placeholder="MM/YY"
            pattern="\d\d/\d\d"
            required
            onChange={handleInputChange}
            onFocus={handleInputFocus}
          />
        </div>
        <div className="col-6">
          <input
            type="tel"
            name="cvc"
            className="form-control"
            placeholder="CVC"
            pattern="\d{3,4}"
            required
            onChange={handleInputChange}
            onFocus={handleInputFocus}
          />
        </div>
      </div>
    </div>
  );
};

export default CardComponent;
