import React from "react";
import styles from "./styles.module.css";

const HeroSection = () => {
  const backgroundImage =
    "https://images.unsplash.com/photo-1534470397273-a1c104354754?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  return (
    <div
      className={styles.container}
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.7)), url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div></div>
    </div>
  );
};

export default HeroSection;
