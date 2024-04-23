import { useState } from "react";
import { setPageTitle } from "../../core/utils";
import "../../sass/modules.sass";
import FooterSection from "../sections/FooterSection";
import IntroSection from "../sections/IntroSection";
import LogoSection from "../sections/LogoSection";
import PackagesSection from "../sections/PackagesSection";

const Home = () => {
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  if (isFirstLoad) {
    setPageTitle("Home");
    setIsFirstLoad(false);
  }

  return (
    <div className="Page-module">
      <div className="Section-module">
        <LogoSection />
        <IntroSection />
        <PackagesSection />
        <FooterSection />
      </div>
    </div>
  );
};

export default Home;
