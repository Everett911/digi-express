import Link from "next/link";
import "./MenuHeader.css";
import { useState } from "react";

type Props = {
  active: boolean;
};
export function MenuHeader({ active }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <div className="menu-container">
        {categories.map((item) => (
          <Link
            className="menu-buthrefns"
            href={`/product/?search=${item}`}
            key={item}
          >
            <span>{item}</span>
          </Link>
        ))}
        {isOpen && (
          <div>
            {categories.map((item) => (
              <Link
                key={item}
                className="menu-buthrefns"
                href={`/product/?search=${item}`}
              >
                <span>{item}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className="menu-container-mobile">
        {active &&
          categories.map((item) => (
            <Link
              key={item}
              className="menu-buthrefns"
              href={`/product/?search=${item}`}
            >
              <button onClick={() => setIsOpen((prev) => !prev)}>{item}</button>
            </Link>
          ))}
      </div>
    </>
  );
}

const categories = ["Men", "Women", "Electronics", "Appliances"];
