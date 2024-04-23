import querystring from "querystring";
import * as Packages from "./packages.js";
import { v4 as uuidv4 } from "uuid";

export const getUnixTimestamp = (daysToAdd = 0) => {
  const _DATE = new Date();

  return _DATE.setDate(_DATE.getDate() + daysToAdd);
};

export const getDateOfMonth = () => {
  const _Date = new Date();
  return _Date.getDate();
};

export const getPackageData = (name) => {
  return new Promise((resolve) => {
    let _Data = null;

    for (let p of Packages.list) {
      if (p.name === name) {
        _Data = p;

        break;
      }
    }

    resolve(_Data);
  });
};

export const getPackagePrice = (packageData, femaleType, usaLocation) => {
  let _s = `${(
    packageData.discountPrice[0] +
    packageData.processingFee[0] +
    (femaleType === "Female" ? packageData.femalePrice[0] : 0) +
    (usaLocation === "USA" ? packageData.usaPrice[0] : 0)
  ).toFixed(2)}`;

  return Number(_s);
};

export const generateUniqueId = (email) => {
  return uuidv4(email);
};

export const getRequestOption = (reqData) => {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: querystring.stringify(reqData),
  };
};

export const getFirstAndLastName = (fullName) => {
  const nameArray = fullName.split(" ");
  const firstName = nameArray[0];
  const lastName = nameArray[nameArray.length - 1];
  return [firstName, lastName];
};
