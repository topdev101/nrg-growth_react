import axios from "axios";
import { useEffect, useState } from "react";
import ReactLoading from "react-loading";
import { Data } from "../core";
import "../sass/modules.sass";
import IconInput from "./InputField";
import NmiPayment from "./NmiPayment";
// import { request } from "express";

function formatNumberWithCommas(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const CheckoutSummary = ({
  visible,
  packageData,
  instaUserVerified,
  onPaymentSuccess,
}) => {
  const [instaUsername, setInstaUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [instaInfo, setInstaInfo] = useState("");
  const [ss, dd] = useState(instaUserVerified);
  const [letter, setLetter] = useState(false);
  const [notFoundUser, setNotFoundUser] = useState(false);
  const [exlain, setExplain] = useState(false);
  const source = axios.CancelToken.source();

  useEffect(() => {
    setNotFoundUser(false);
    dd(false);
    setLetter(false);
    setExplain(true);
    // Define a function to send the request when called.
    const sendRequest = async () => {
      try {
        setIsLoading(true);

        const response = await axios.post(
          "/siu",
          { username: instaUsername },
          {
            headers: { "Content-Type": "application/json" },
            cancelToken: source.token,
          }
        );
        const data = response.data;
        setInstaInfo(data.message);
        setIsLoading(false);
        if (data.message.isPrivate === false) {
          dd(true);
          setLetter(true);
          setNotFoundUser(false);
        } else if (data.message.isPrivate === null) {
          dd(false);
          setLetter(false);
          setExplain(true);
          setNotFoundUser(true);
          setExplain(true);
        } else {
          setExplain(false);
        }
      } catch (error) {
        // Handle error appropriately
        if (axios.isCancel(error)) {
          // Request was canceled, no need to handle it.
        } else {
          console.error(error);
          setIsLoading(false);
        }
      }
    };

    // This effect watches for changes in instaUsername and schedules the request with a 1s delay.
    if (instaUsername !== "") {
      const delayTimer = setTimeout(sendRequest, 1000);

      return () => {
        // Cleanup: If the input changes again or the component unmounts, cancel the previous request.
        source.cancel("Request canceled due to input change.");
        clearTimeout(delayTimer);
      };
    } else {
      setIsLoading(false);
    }
  }, [instaUsername]);

  const handleInstaUserChange = (e) => {
    // Update the inputValue when the user types in the input field.
    setInstaUsername(e.target.value);
    Data.Checkout.instaUsername = e.target.value;
  };

  return (
    <div
      className="CheckoutSummary-module"
      style={{ display: visible ? "block" : "none" }}
    >
      <div className="CheckoutSummary-module--title">Order Summary</div>

      <div
        className="CheckoutSummary-module--instaData"
        style={{ display: Data.Checkout.InstaUserdata ? "block" : "none" }}
      >
        <span className="bold">@{Data.Checkout.instaUsername}</span> will gain{" "}
        <span className="bold">
          {formatNumberWithCommas(packageData.followers)}
        </span>{" "}
        followers
      </div>
      <div
        className="CheckoutSummary-module--instaData"
        style={{ display: Data.Checkout.InstaUserdata ? "block" : "none" }}
      >
        New follower count will be{" "}
        <span className="bold">
          {Data.Checkout.InstaUserdata
            ? Data.Checkout.InstaUserdata.followersCount + packageData.followers
            : 0}
        </span>{" "}
        followers
      </div>

      <div className="divider" />

      <IconInput
        title="Full Name *"
        placeholder="John Smith"
        oc={(e) => {
          Data.Checkout.name = e.target.value;
        }}
      />
      <IconInput
        title="Email *"
        placeholder="me@example.com"
        oc={(e) => {
          Data.Checkout.email = e.target.value;
        }}
      />
      <IconInput
        title="Phone Number"
        placeholder="(123) 456-7890"
        oc={(e) => {
          Data.Checkout.phoneNumber = e.target.value;
        }}
      />

      <IconInput
        id="input1"
        title="Instagram Username"
        placeholder="Instagram Username"
        value={instaUsername}
        oc={handleInstaUserChange}
      />

      <br />

      {isLoading ? <ReactLoading type={"bars"} color="#fff" /> : ""}
      {letter ? (
        <>
          <span className="followers">
            @<b>{instaUsername}</b>
            {" Will Gain "}
            {formatNumberWithCommas(packageData.followers)}
            {" Followers"}
          </span>
          <br />
          <span className="followers">
            {"New Follower Count : "}
            {formatNumberWithCommas(
              instaInfo.followers_count + packageData.followers
            )}
            {" Followers"}
          </span>
          <br />
        </>
      ) : (
        ""
      )}
      {exlain ? "" : <>User is Private.</>}
      {notFoundUser ? <>User Not Found.</> : ""}

      <div>
        {ss && (
          <NmiPayment
            onPaymentSuccess={onPaymentSuccess}
            packageData={packageData}
          />
        )}
      </div>
    </div>
  );
};

export default CheckoutSummary;
