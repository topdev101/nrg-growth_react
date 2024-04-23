// server/index.js
import { ApifyClient } from "apify-client";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";
import { MongoClient } from "mongodb";
import fetch from "node-fetch";
import path from "path";
import querystring from "querystring";
import { fileURLToPath } from "url";
import { Customer } from "./core/Customer.js";
import { InstaUsers } from "./core/InstaUsers.js";
import { Order } from "./core/Order.js";
import * as Packages from "./packages.js";

import postmark from "postmark";
import {
  generateUniqueId,
  getDateOfMonth,
  getFirstAndLastName,
  getPackageData,
  getPackagePrice,
  getRequestOption,
  getUnixTimestamp,
} from "./utils.js";

import axios from "axios";

dotenv.config();

// const nmiSecurityKey = process.env.NMI_SECURITY_KEY;
const nmiSecurityKey = "6457Thfj624V5r7WUwc5v6a68Zsd6YEm";
// const nmiSecurityKey = "SPU5cY9GM9KRp7562Cm67BY9KXU4hg8f";
const nmiTestKey = "6457Thfj624V5r7WUwc5v6a68Zsd6YEm";
const nmiHostName = "secure.edataexecutivegateway.com";
const nmiPath = "/api/transact.php";

const API_KEY = "a8ecf635aamsh74291cc22857ddcp183b0ejsnd40925dc0a01";
const API_HOST = "instagram28.p.rapidapi.com";
const API_URL = "https://instagram28.p.rapidapi.com";

const paymentUrl = `https://${nmiHostName}${nmiPath}`;

// postmark client
const pmClient = new postmark.ServerClient(
  "b64f7e50-10e3-4ad4-8d1e-6f4bf16cdc94"
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 4242;

const App = express();
const Client_Appify = new ApifyClient({
  token: "apify_api_a7VafBDpEozOixWzQvDGlcNeeGoMYS15diVE",
});
const Client_DB = new MongoClient(
  "mongodb+srv://nrg-growth:GL4ubRoufaSYrH@serverlessinstance0.icjwruo.mongodb.net/?retryWrites=true&w=majority"
);

const JAP_Url = "https://justanotherpanel.com/api/v2";
const JAP_Key = "83f499b7c9b8ef48accc9d7b37f1a1bc";

// App.use(cors);
App.use(express.static(path.resolve(__dirname, "../client/build")));
App.use(bodyParser.urlencoded({ extended: true }));
App.use(bodyParser.json());

App.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});

App.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

const initServer = async () => {
  console.clear();
  console.log("Connecting to DB...");

  await Client_DB.connect();
  const DB = Client_DB.db("NrgGrowth");
  const COLL_Customers = DB.collection("Customers");
  const COLL_InstaUsers = DB.collection("InstaUsers");
  const COLL_Orders = DB.collection("Orders");

  console.clear();
  console.log("Connected! Database available for use.");

  App.post("/get-packages", async (req, res) => {
    res.json({ list: Packages.list });
  });

  // this is used in the dashboard to show the orders by email
  App.post("/get-orders", async (req, res) => {
    const _Query = { email: { $regex: new RegExp(req.body.email, "i") } };
    const _Result = await COLL_Orders.find(_Query);
    const _ResList = await _Result.toArray();

    res.json({ list: _ResList.length > 0 ? _ResList : [] });
  });

  App.post("/get-customers", async (req, res) => {
    const _Query = { email: { $regex: new RegExp(req.body.email, "i") } };
    const _Result = await COLL_Customers.findOne(_Query);

    res.json(_Result);
  });

  App.post("/make-payment-request", async (req, res) => {
    const {
      email,
      name,
      phoneNumber,
      followerType,
      followerLocation,
      instaUsername,
      cardInfo,
      packageName,
    } = req.body;

    // check allowance period
    const _instaOrderStatusQuery = {
      instaUsername: instaUsername,
    };

    const _instaUserResult = await COLL_InstaUsers.findOne(
      _instaOrderStatusQuery
    );

    if (_instaUserResult) {
      const currentTime = getUnixTimestamp();
      const orderTime = parseInt(_instaUserResult.orderTime);
      let allowncePeriod = 0;
      if (_instaUserResult.packageName) {
        allowncePeriod = Packages.list.filter(
          (_package) => _package.name === _instaUserResult.packageName
        )[0].allowncePeriod;
      }

      const diff = orderTime + allowncePeriod - currentTime;
      if (diff > 0) {
        return res.status(500).json({
          message: `You should wait for ${Math.floor(
            diff / 1000
          )}seconds for next subscription`,
        });
      }
    }

    const _PackageData = await getPackageData(packageName);

    // make payment
    const { cardNumber, expiry, cvc } = cardInfo;
    const [firstName, lastName] = getFirstAndLastName(name);
    const amount = getPackagePrice(
      _PackageData,
      followerType,
      followerLocation
    );
    const paymentData = {
      type: "sale",
      amount: amount,
      ccnumber: cardNumber,
      ccexp: expiry,
      cvc: cvc,
      address1: "test address",
      city: "test city",
      zipcode: "86426",
      email: email,
      first_name: firstName,
      last_name: lastName,
      state: "test state",
      security_key: nmiSecurityKey,
    };

    const paymentResponse = await fetch(
      paymentUrl,
      getRequestOption(paymentData)
    );
    const responseData = await paymentResponse.text();
    const parsedData = querystring.parse(responseData);

    switch (parseInt(parsedData.response)) {
      case 1: // payment success
        // JAP API call
        const _OrderObj = {
          key: JAP_Key,
          action: "add",
          service: Packages.SERVICE_ID,
          link: instaUsername,
          quantity: _PackageData.followers,
        };
        const formData = new URLSearchParams();
        for (const key in _OrderObj) {
          formData.append(key, _OrderObj[key]);
        }
        let _orderResult;
        try {
          const response = await fetch(JAP_Url, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData.toString(),
          });

          if (response.status === 200) {
            _orderResult = await response.text();
          } else {
            _orderResult = "Order to JAP has failed.";
          }
        } catch (error) {
          console.error("Error:", error);
        }
        console.log(`JAP - ${_orderResult}`);

        const _jsonOrderResult = JSON.parse(_orderResult);
        // update order database
        if (_jsonOrderResult.order) {
          await COLL_Orders.insertOne(
            new Order(
              _jsonOrderResult.order,
              {
                totalPrice: amount,
                date: getUnixTimestamp(),
                email: email,
                packageName: packageName,
                instaUsername: instaUsername,
                femaleType: followerType === "Female",
                usaLocation: followerLocation === "USA",
              },
              _PackageData.followers
            )
          );
        }

        // update InstaUser database
        if (_instaUserResult) {
          await COLL_InstaUsers.updateOne(
            { instaUsername: instaUsername },
            {
              $set: {
                orderTime: getUnixTimestamp(),
                packageName: packageName,
              },
            }
          );
        } else {
          await COLL_InstaUsers.insertOne(
            new InstaUsers(instaUsername, getUnixTimestamp(), packageName)
          );
        }

        // customer management && add/update plan
        const _Query = { email: { $regex: new RegExp(email, "i") } };
        const _customerResult = await COLL_Customers.findOne(_Query);
        let planId;
        let planRequestData;
        if (!_customerResult) {
          // add plan
          planId = generateUniqueId(email);
          planRequestData = {
            recurring: "add_plan",
            plan_payments: 0,
            plan_amount: Packages.SUBSCRIPTION_AMOUNT,
            plan_name: "refill",
            plan_id: planId,
            month_frequency: 1,
            day_of_month: getDateOfMonth(),
            security_key: nmiSecurityKey,
          };
          const planResponse = await fetch(
            paymentUrl,
            getRequestOption(planRequestData)
          );
          const planResData = await planResponse.text();
          const parsedPlanResData = querystring.parse(planResData);
          if (parseInt(parsedPlanResData.response) === 1) {
            // add subscription
            const addSubReq = {
              recurring: "add_subscription",
              plan_id: planId,
              ccnumber: cardNumber,
              ccexp: expiry,
              first_name: firstName,
              last_name: lastName,
              email: email,
              security_key: nmiSecurityKey,
            };
            const addSubRes = await fetch(
              paymentUrl,
              getRequestOption(addSubReq)
            );
            const addSubData = await addSubRes.text();
            const parsedData = querystring.parse(addSubData);
            console.log("addSub", parsedData);
            if (parseInt(parsedData.response) === 1) {
              const subscriptionId = parsedData.subscription_id;
              // add customer
              try {
                await COLL_Customers.insertOne(
                  new Customer(
                    name,
                    email,
                    phoneNumber,
                    true,
                    getUnixTimestamp(),
                    planId,
                    subscriptionId
                  )
                );
              } catch (error) {
                console.log("customer database error: ", error);
              }

              // email handle
              const subEmail = {
                From: "info@nrg-growth.com",
                // To: email,
                To: "info@nrg-growth.com",
                Subject: "Subscription Request Confirmation",
                TextBody: `Your subscription request has been completed successfully.
                Information: email:${email}, follower type: ${followerType}, insta username: ${instaUsername}`,
              };
              pmClient
                .sendEmail(subEmail)
                .then((pmRes) => {
                  console.log("Email sent successfully:", pmRes.Message);
                })
                .catch((error) => {
                  console.error("Error sending email:", error.message);
                });

              return res.status(200).json({ message: "Transaction Approved" });
            } else {
              return res.status(500).json({
                message: `Subscription: ${parsedData.responsetext}`,
              });
            }
          } else {
            return res.status(500).json({
              message: `Adding/Updating Plan: ${parsedPlanResData.responsetext}`,
            });
          }
        } else {
          // update customer
          await COLL_Customers.updateOne(
            { email: email },
            { $set: { subStatus: true } }
          );
          // update subscription
          const updateSubReq = {
            recurring: "update_subscription",
            subscription_id: _customerResult.subscriptionId,
            paused_subscription: "true",
            security_key: nmiSecurityKey,
          };
          const updateSubRes = await fetch(
            paymentUrl,
            getRequestOption(updateSubReq)
          );
          const updateSubData = await updateSubRes.text();
          const parsedData = querystring.parse(updateSubData);
          console.log("Subscribe:", parsedData);
          if (parseInt(parsedData.response) === 1) {
            return res.status(200).json({ message: "Successfully subscribed" });
          } else {
            return res.status(500).json({
              message: `Update subscription: ${parsedData.responsetext}`,
            });
          }
        }

      case 2:
        return res.status(500).json({ message: "Transaction Declined" });
      case 3:
        console.log(parsedData);
        return res.status(500).json({ message: parsedData.responsetext });
    }
  });

  App.post("/unsubscribe", async (req, res) => {
    const email = req.body.email;
    const _customer = await COLL_Customers.findOne({ email: email });
    if (_customer) {
      if (_customer.subStatus) {
        // update subscription
        const updateSubReq = {
          recurring: "update_subscription",
          subscription_id: _customer.subscriptionId,
          paused_subscription: true,
          security_key: nmiSecurityKey,
        };
        const updateSubRes = await fetch(
          paymentUrl,
          getRequestOption(updateSubReq)
        );
        const updateSubData = await updateSubRes.text();
        const parsedData = querystring.parse(updateSubData);
        console.log("Unsubscribe:", parsedData);
        if (parseInt(parsedData.response) === 1) {
          // update customer
          await COLL_Customers.updateOne(
            { email: email },
            { $set: { subStatus: false } }
          );

          // email handle
          const unSubEmail = {
            From: "info@nrg-growth.com",
            // To: email,
            To: "info@nrg-growth.com",
            Subject: "Subscription Request Confirmation",
            TextBody: `Your subscription request has been canceled successfully.`,
          };
          pmClient
            .sendEmail(unSubEmail)
            .then((pmRes) => {
              console.log("Email sent successfully:", pmRes.Message);
            })
            .catch((error) => {
              console.error("Error sending email:", error.message);
            });

          return res.status(200).json({
            message: `Successfully unsubscribed`,
          });
        } else {
          return res.status(500).json({
            message: `Update unsubscription: ${parsedData.responsetext}`,
          });
        }
      } else {
        return res.status(500).json({
          message: "You are already unsubscribed",
        });
      }
    } else {
      return res.status(500).json({
        message: "No such customer with the email",
      });
    }
  });

  App.post("/pi", async (req, res) => {
    let _Data = null;

    for (let _p of Packages.list) {
      if (_p.name === req.body.packageName) {
        _Data = _p;

        break;
      }
    }

    res.json({ data: _Data });
  });

  const getInstagramInfo = async (name) => {
    const params = { user_name: name };
    const headers = {
      "X-RapidAPI-Key": API_KEY,
      "X-RapidAPI-Host": API_HOST,
    };
    try {
      const response = await axios.get(`${API_URL}/user_info`, {
        params: params,
        headers: headers,
      });
      const isPrivate = response.data.data.user.is_private;
      const followers = response.data.data.user.edge_followed_by.count;
      return { isPrivate, followers };
    } catch (e) {
      return {
        isPrivate: null,
        followers: null,
      };
    }
  };

  App.post("/siu", async (req, res) => {
    const username = req.body.username;

    const { followers, isPrivate } = await getInstagramInfo(username);

    res.json({
      message: {
        followers_count: followers,
        isPrivate: isPrivate,
      },
    });
  });
};

initServer();
