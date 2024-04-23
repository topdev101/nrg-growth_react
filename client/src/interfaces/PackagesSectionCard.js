import { Link, useNavigate } from "react-router-dom";
import { getLocaleString } from "../core/utils";
import svg_box from "../img/icons/box.svg";

const PackagesSectionCard = ({ img, packageData }) => {
  const navigate = useNavigate();
  return (
    <Link
      className="Packages-section--grid--card"
      to={`/purchase/${packageData.name.toLowerCase()}`}
    >
      <div className="Packages-section--grid--card--topGrid">
        <div>
          <div className="Packages-section--grid--card--topGrid--title">
            {packageData.name}
          </div>
          <ul>
            <li>
              <span className="bold">
                {getLocaleString(packageData.followers)}
              </span>{" "}
              Followers
            </li>
            <li>High Quality Followers</li>
            <li>Dedicated Support</li>
            <li>Quality Insured</li>
            <li>Fast Checkout</li>
          </ul>
        </div>
        <img
          className="Packages-section--grid--card--img"
          src={img ? img : svg_box}
          alt="Card"
        />
      </div>

      <button
        className="styled-button"
        onClick={navigate(`/purchase/${packageData.name.toLowerCase()}`)}
      >
        Buy Now
      </button>
    </Link>
  );
};

export default PackagesSectionCard;
