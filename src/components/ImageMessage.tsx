import React, { FunctionComponent } from "react";

export function ImageMessage(props: { imageUrl: string }) {
  const imageUrl = props.imageUrl;
  //TODO: implement image fallback with onError
  return (
    <div className="MessageImage">
      <img className="MessageImagePrim" src={imageUrl} alt="[Loading...]" />
    </div>
  );
}
