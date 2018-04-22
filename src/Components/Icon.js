import React from "react";

export default function Icon({ type, className = "" }) {
  return <i className={`${className} material-icons`}>{type}</i>;
}
