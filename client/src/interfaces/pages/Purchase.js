import { useState } from "react";
import { getPackageData, setPageTitle } from "../../core/utils";
import CheckoutSummary from "../CheckoutSummary";
import CheckoutVerification from "../CheckoutVerification";
import Loading from "../Loading";
import PaymentComplete from "../PaymentComplete";
import FooterSection from "../sections/FooterSection";

const Purchase = ({ packageName }) => {
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [packageData, setPackageData] = useState(null);
  const [instaUserVerified, setIUV] = useState(false);
  const [paymentPassed, setPP] = useState(false);

  const loadPackageData = async () => {
    setPackageData(await getPackageData(packageName));
  };

  if (isFirstLoad) {
    setPageTitle("Purchase");
    setIsFirstLoad(false);
    loadPackageData();
  }

  if (!packageData) {
    return (
      <div className="Page-module">
        <Loading message="Loading package..." />
      </div>
    );
  } else {
    return (
      <div className="Page-module">
        <div className="Section-module--content">
          <div className="Checkout-module--title">
            {paymentPassed ? "Congratulations!" : "NRG Growth Checkout"}
          </div>
          <div className="Checkout-module--message">
            You {paymentPassed ? "have purchased" : "are purchasing"}{" "}
            <span className="bold">
              {packageData.followers} Instagram Followers
            </span>
          </div>
          {/* <CheckoutVerification
            visible={!instaUserVerified && !paymentPassed}
            onVerification={() => {
              setIUV(true);
            }}
          /> */}
          <CheckoutSummary
            visible={!paymentPassed}
            packageData={packageData}
            instaUserVerified={instaUserVerified}
            onPaymentSuccess={() => {
              setPP(true);
            }}
          />
          <PaymentComplete visible={instaUserVerified && paymentPassed} />
        </div>
        <FooterSection />
      </div>
    );
  }
};

export default Purchase;
