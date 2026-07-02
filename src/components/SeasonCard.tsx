import Link from "next/link";
import SpringCard from "@/assets/images/spring-card.png";
import SummerCard from "@/assets/images/summer-card.png";
import AutumnCard from "@/assets/images/autumn-card.png";
import WinterCard from "@/assets/images/winter-card.png";
import "./SeasonCard.css";
import Image from "next/image";

function SeasonCard() {
  return (
    <>
      {seasons.map((season) => (
        <Link
          key={season.season}
          className="seasons-card"
          href={`/products/?search=${season.season}`}
        >
          <div className="card-content">
            <Image
              className="season-card-image"
              src={season.image}
              alt={season.title}
            />
            <div
              className="card-context"
              style={{
                background: `radial-gradient(circle at right, ${season.color} 0%, rgba(0, 0, 0, .1) 100%)`,
              }}
            >
              <div className="card-title">{season.title}</div>
              <div className="card-text">{season.text}</div>
              <button className="card-button">Shop Now</button>
            </div>
          </div>
        </Link>
      ))}
    </>
  );
}

export default SeasonCard;

const seasons = [
  {
    season: "spring",
    image: SpringCard,
    title: "Freshest Stylish",
    text: "Look for the new arrivals that matches your season styles",
    color: "#75ba75",
  },
  {
    season: "summer",
    image: SummerCard,
    title: "Hottest Deals",
    text: "The Deals that can match your money and style",
    color: "#fec76f",
  },
  {
    season: "autumn",
    image: AutumnCard,
    title: "Cozy Fashion",
    text: "Products mostly use daily basis with a cool look at it",
    color: "#f5945c",
  },
  {
    season: "winter",
    image: WinterCard,
    title: "Holiday Feast",
    text: "Elevate your style tradition ",
    color: "#5fa2df",
  },
];
