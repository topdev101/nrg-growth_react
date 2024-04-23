import gif_loading from "../../img/loading.gif";
import svg_logoUnmodified from "../../img/logo-unmodified.svg";

import { useState } from "react";
import { setPageTitle, validateEmail } from "../../core/utils";
import DashboardOrder from "../DashboardOrder";
import InputField from "../InputField";
import { DateTime } from "luxon";
import SubscriptionModal from "../SubscriptionModal";
import { getApiFetchOption } from "../../core/utils";

const Dashboard = () => {
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOrdersLoaded, setIsOrdersLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [customer, setCustomer] = useState({});
  const [message, setMessage] = useState(
    "Enter your email you used when ordering your packages to see information on your previous orders."
  );

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleUnsubscription = async () => {
    console.log(email);
    const requestBody = {
      email: email,
    };

    const request = await fetch("/unsubscribe", getApiFetchOption(requestBody));

    const response = await request.json();

    if (request.ok) {
      setMessage("You are successfully unsubscribed");
    } else {
      setMessage(response.message);
    }

    await loadOrders();

    setIsModalOpen(false);
  };

  const loadOrders = async () => {
    setIsLoading(true);

    if (email.length > 0) {
      if (!validateEmail(email)) {
        setMessage("Please enter a valid email adress.");
        setIsLoading(false);

        return;
      }
    } else {
      setMessage("Please enter a the email adress associated with the orders.");
      setIsLoading(false);

      return;
    }

    const _GetOrders = await fetch("/get-orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const { list } = await _GetOrders.json();

    const _GetCustomerInfo = await fetch("/get-customers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const customerInfo = await _GetCustomerInfo.json();
    setCustomer(customerInfo);

    setOrders(list);
    setIsLoading(false);
    setIsOrdersLoaded(true);
  };

  const getNextBillingDate = (subscriptionTimestamp) => {
    const currentDate = DateTime.now();
    const subscriptionDate = DateTime.fromMillis(subscriptionTimestamp);
    const billingDayOfMonth = subscriptionDate.day;
    let nextBillingDate = currentDate;
    if (currentDate.day >= billingDayOfMonth) {
      nextBillingDate = nextBillingDate.plus({ months: 1 });
    }
    nextBillingDate = nextBillingDate.set({ day: billingDayOfMonth });
    return nextBillingDate.toFormat("DD");
  };

  if (isFirstLoad) {
    setPageTitle("Dashboard");
    setIsFirstLoad(false);
  }

  return (
    <div className="Page-module">
      <div className="Section-module--content encompass--height">
        <div
          className="DashboardLogin-module"
          style={{ display: isOrdersLoaded ? "none" : "block" }}
        >
          <img
            className="DashboardLogin-module--img"
            src={svg_logoUnmodified}
            alt="User"
          />
          <div className="DashboardLogin-module--title">Dashboard</div>
          <div className="DashboardLogin-module--message">
            {isLoading ? "Loading orders..." : message}
          </div>
          <InputField
            title="Email"
            placeholder="me@example.com"
            oc={(e) => {
              setEmail(e.target.value);
            }}
          />
          <img
            className="DashboardLogin-module--loading"
            style={{ display: isLoading ? "block" : "none" }}
            src={gif_loading}
            alt="Loading"
          />
          <button
            className="styled-button"
            style={{ display: isLoading ? "none" : "block" }}
            onClick={() => {
              loadOrders();
            }}
          >
            Continue
          </button>
        </div>
        <div
          className="DashboardList-module"
          style={{ display: isOrdersLoaded ? "block" : "none" }}
        >
          <div className="DashboardList-module--info">
            <div
              className="DashboardList-module--title"
              onClick={() => {
                console.log("customer", customer);
                console.log(isModalOpen);
              }}
            >
              Orders
            </div>
            <div className="DashboardList-module--email">{email}</div>
          </div>
          {orders.length > 0 && (
            <div>
              {customer.subStatus ? (
                <span>
                  You are currently subscribed. Your next billing date is:{" "}
                  {getNextBillingDate(customer.date)}
                  <br />
                  You can unsubscribe <a onClick={handleModalOpen}>here</a>
                </span>
              ) : (
                <>You are currently unsubscribed</>
              )}
            </div>
          )}

          <div>
            {orders.length > 0 ? (
              orders.map((o, index) => (
                <DashboardOrder orderData={o} key={index} />
              ))
            ) : (
              <div className="DashboardList-module--empty">
                <div className="DashboardList-module--empty--title">
                  No orders yet
                </div>
                <div>Go to store to place an order.</div>
              </div>
            )}
          </div>
        </div>
      </div>
      <SubscriptionModal
        isOpen={isModalOpen}
        handleClose={handleModalClose}
        handleOk={handleUnsubscription}
      />
    </div>
  );
};

export default Dashboard;
