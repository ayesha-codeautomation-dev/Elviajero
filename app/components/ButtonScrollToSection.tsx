"use client";
import React from "react";
import { Link as ScrollLink } from "react-scroll";

const ButtonScrollToSection = ({
  content,
  classes,
  destination,
}: {
  content: string;
  classes: string;
  destination: string;
}) => {
  return (
    <ScrollLink
      to={destination}
      spy={true}
      smooth={true}
      offset={-10}
      duration={500}
      className={classes}
    >
      {content}
    </ScrollLink>
  );
};

export default ButtonScrollToSection;
