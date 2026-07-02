import { useState } from "react";
import Chevron from "../assets/images/icons/chevron.svg?react";

type Props = {
  title: string;
  context: string;
};
function Dropdown({ title, context }: Props) {
  const [isActive, setisActive] = useState<boolean>(false);
  const toggleDescription = () => setisActive((prev) => !prev);
  return (
    <>
      <div className="toggle-container">
        <button className="toggle-menu-button" onClick={toggleDescription}>
          {title}
        </button>
        {isActive === true ? (
          <Chevron
            className="chevron-icon"
            style={{
              width: "24px",
              height: "36px",
            }}
          />
        ) : (
          <Chevron
            className="chevron-icon"
            style={{
              transform: "rotate(180deg)",
              transformOrigin: "center",
              width: "24px",
              height: "36px",
            }}
          />
        )}
      </div>
      {isActive && <div className="dropdown-context">{context}</div>}
    </>
  );
}

export default Dropdown;
